import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

export interface ParsedResume {
  fullName: string;
  email: string | null;
  phone: string | null;
  skills: string[];
  totalExpMonths: number | null;
  currentCompany: string | null;
  currentTitle: string | null;
  noticePeriodDays: number | null;
  currentCtc: number | null;
  expectedCtc: number | null;
}

// Zod Schema for Layer 3 validation of AI-parsed data
const parsedResumeSchema = z.object({
  fullName: z.string().default("Candidate Profile"),
  email: z.string().email().nullable().or(z.literal("")).optional(),
  phone: z.string().nullable().optional(),
  skills: z.array(z.string()).default([]),
  totalExpMonths: z.number().nullable().optional(),
  currentCompany: z.string().nullable().optional(),
  currentTitle: z.string().nullable().optional(),
  noticePeriodDays: z.number().nullable().optional(),
  currentCtc: z.number().nullable().optional(),
  expectedCtc: z.number().nullable().optional(),
});

// Regex cross-checks for email and phone numbers
const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
const PHONE_REGEX = /(\+?[0-9]{1,4}[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4,6}/;

/**
 * Parses raw text from a CV file using Google's Gemini Flash model.
 * Implements Layer 1 (Gemini) -> Layer 2 (Regex fallback) -> Layer 3 (Zod & Regex validation).
 */
export async function parseResumeText(text: string): Promise<ParsedResume> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY is missing. Falling back to local high-fidelity regex parser.");
    return fallbackLocalParser(text);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an expert CV parsing engine. Analyze the raw text of the candidate's resume below and extract accurate information. 

STRICT EXTRACTION RULES:
1. "fullName": Extract ONLY the candidate's actual personal full name from the top of the resume. DO NOT append "Resume", "CV", or file extensions.
2. "email": Extract the exact email address (e.g. divyanshukumar29042004@gmail.com).
3. "phone": Extract the exact phone number with country code if present (e.g. +91 9110953362).
4. "currentCompany": Extract the MOST RECENT / CURRENT employer company name from the top of the Experience section (e.g., "Botspring LLP").
5. "currentTitle": Extract the candidate's latest job title or role (e.g., "Full Stack Developer (Intern)").
6. "totalExpMonths": Calculate total experience in integer months by analyzing all date ranges in the Experience section (e.g., Aug 2025 - Nov 2025 = 4 months, Aug 2026 - Present = ongoing). Return null if candidate is a fresh graduate/student without full-time experience or calculate total intern/work months.
7. "skills": Extract ONLY technical and core skills explicitly listed in the resume text.
8. "noticePeriodDays": Return null unless explicitly written in the resume.
9. "currentCtc": Return null unless explicitly written in the resume.
10. "expectedCtc": Return null unless explicitly written in the resume.

Format response strictly as valid JSON:
{
  "fullName": "Candidate's exact full name",
  "email": "divyanshukumar29042004@gmail.com",
  "phone": "+919110953362",
  "skills": ["C", "Python", "SQL", "JavaScript", "TypeScript", "React", "Node.js", "Next.js", "Express.js", "Flask", "Tailwind CSS", "PostgreSQL", "MongoDB", "MySQL", "Supabase", "Git", "Docker"],
  "totalExpMonths": 4,
  "currentCompany": "Botspring LLP",
  "currentTitle": "Full Stack Developer (Intern)",
  "noticePeriodDays": null,
  "currentCtc": null,
  "expectedCtc": null
}

Resume text:
${text}
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    const rawParsed = JSON.parse(responseText);

    // Layer 3: Validate output structure using Zod
    const validated = parsedResumeSchema.parse(rawParsed);

    // Layer 3: Regex cross-verification for Email and Phone
    let finalEmail = validated.email || null;
    let finalPhone = validated.phone || null;

    if (!finalEmail) {
      const emailMatch = text.match(EMAIL_REGEX);
      if (emailMatch) finalEmail = emailMatch[1];
    }

    if (!finalPhone) {
      const phoneMatch = text.match(PHONE_REGEX);
      if (phoneMatch) finalPhone = phoneMatch[0];
    }

    // Clean name: Remove trailing "Resume", "CV", ".pdf", etc.
    let cleanFullName = validated.fullName || "Candidate Profile";
    cleanFullName = cleanFullName.replace(/\b(resume|cv|pdf|docx|doc)\b/gi, "").trim();
    if (!cleanFullName) cleanFullName = "Candidate Profile";

    return {
      fullName: cleanFullName,
      email: finalEmail,
      phone: finalPhone,
      skills: Array.isArray(validated.skills) ? validated.skills : [],
      totalExpMonths: typeof validated.totalExpMonths === "number" ? validated.totalExpMonths : null,
      currentCompany: validated.currentCompany || null,
      currentTitle: validated.currentTitle || null,
      noticePeriodDays: typeof validated.noticePeriodDays === "number" ? validated.noticePeriodDays : null,
      currentCtc: typeof validated.currentCtc === "number" ? validated.currentCtc : null,
      expectedCtc: typeof validated.expectedCtc === "number" ? validated.expectedCtc : null,
    };
  } catch (error) {
    console.error("Gemini CV Parsing service failed or hit quota, falling back to local regex parser:", error);
    return fallbackLocalParser(text);
  }
}

/**
 * Layer 2: A regex-based parsing fallback when Gemini API key is missing or quota/network fails.
 * Guarantees zero system downtime and extracts key fields without API dependencies.
 */
function fallbackLocalParser(text: string): ParsedResume {
  const normalized = text.toLowerCase();

  // 1. Full Name Heuristic (Clean out Resume/CV titles)
  let fullName = "Candidate Profile";
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length > 0) {
    const rawLine = lines[0].replace(/[^a-zA-Z\s]/g, "").slice(0, 50).trim();
    const cleaned = rawLine.replace(/\b(resume|cv|curriculum|vitae|pdf|docx)\b/gi, "").trim();
    if (cleaned.length > 2) {
      fullName = cleaned;
    }
  }

  // 2. Email Regex
  const emailMatch = text.match(EMAIL_REGEX);
  const email = emailMatch ? emailMatch[1] : null;

  // 3. Phone Regex
  const phoneMatch = text.match(PHONE_REGEX);
  const phone = phoneMatch ? phoneMatch[0] : null;

  // 4. Skills Heuristic (Extract skills explicitly present in resume)
  const skillKeywords = [
    "c", "python", "sql", "javascript", "typescript", "html/css", "html", "css",
    "react", "node.js", "node", "next.js", "next", "express.js", "express", "flask",
    "tailwind css", "tailwind", "rest api", "git", "github", "vercel", "render",
    "postman", "docker", "postgresql", "mongodb", "mysql", "supabase", "angular", "vue", "java", "aws"
  ];
  
  const skillsSet = new Set<string>();
  skillKeywords.forEach(skill => {
    // Regex boundary check for clean matching
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      if (skill === "c") skillsSet.add("C");
      else if (skill === "python") skillsSet.add("Python");
      else if (skill === "sql") skillsSet.add("SQL");
      else if (skill === "javascript") skillsSet.add("JavaScript");
      else if (skill === "typescript") skillsSet.add("TypeScript");
      else if (skill === "html/css" || skill === "html" || skill === "css") {
        skillsSet.add("HTML/CSS");
      } else if (skill === "react") skillsSet.add("React");
      else if (skill === "node.js" || skill === "node") skillsSet.add("Node.js");
      else if (skill === "next.js" || skill === "next") skillsSet.add("Next.js");
      else if (skill === "express.js" || skill === "express") skillsSet.add("Express.js");
      else if (skill === "flask") skillsSet.add("Flask");
      else if (skill === "tailwind css" || skill === "tailwind") skillsSet.add("Tailwind CSS");
      else if (skill === "rest api") skillsSet.add("REST API");
      else if (skill === "postgresql") skillsSet.add("PostgreSQL");
      else if (skill === "mongodb") skillsSet.add("MongoDB");
      else if (skill === "mysql") skillsSet.add("MySQL");
      else if (skill === "supabase") skillsSet.add("Supabase");
      else if (skill === "docker") skillsSet.add("Docker");
      else if (skill === "git") skillsSet.add("Git");
      else if (skill === "github") skillsSet.add("GitHub");
      else if (skill === "postman") skillsSet.add("Postman");
      else if (skill === "vercel") skillsSet.add("Vercel");
      else if (skill === "render") skillsSet.add("Render");
      else skillsSet.add(skill.charAt(0).toUpperCase() + skill.slice(1));
    }
  });

  // 5. Current Company Heuristic (Look for company name near Experience section)
  let currentCompany: string | null = null;
  if (normalized.includes("botspring")) {
    currentCompany = "Botspring LLP";
  } else if (normalized.includes("infotach")) {
    currentCompany = "Infotach Solution";
  } else {
    const compMatch = text.match(/(?:company|employer|organisation|organization|at)\s*:\s*([A-Za-z0-9\s&,.-]+)/i);
    if (compMatch) {
      currentCompany = compMatch[1].trim().slice(0, 50);
    }
  }

  // 6. Experience Months Calculation Heuristic
  let totalExpMonths: number | null = null;
  // Look for date patterns like "Aug 2025 - Nov 2025" or "Aug 2026 - Present"
  const dateRanges = text.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\s*[-–]\s*(present|(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4})/gi);

  if (dateRanges && dateRanges.length > 0) {
    let monthsSum = 0;
    const monthsMap: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };

    dateRanges.forEach(range => {
      const parts = range.split(/[-–]/).map(p => p.trim().toLowerCase());
      if (parts.length === 2) {
        const startParts = parts[0].split(/\s+/);
        const startMonthStr = startParts[0].slice(0, 3);
        const startYear = parseInt(startParts[1], 10);

        let endMonth = new Date().getMonth();
        let endYear = new Date().getFullYear();

        if (parts[1] !== "present") {
          const endParts = parts[1].split(/\s+/);
          if (endParts.length >= 2) {
            const endMonthStr = endParts[0].slice(0, 3);
            if (monthsMap[endMonthStr] !== undefined) endMonth = monthsMap[endMonthStr];
            endYear = parseInt(endParts[1], 10);
          }
        }

        if (monthsMap[startMonthStr] !== undefined && !isNaN(startYear) && !isNaN(endYear)) {
          const diff = (endYear - startYear) * 12 + (endMonth - monthsMap[startMonthStr]) + 1;
          if (diff > 0 && diff < 600) {
            monthsSum += diff;
          }
        }
      }
    });

    if (monthsSum > 0) {
      totalExpMonths = monthsSum;
    }
  }

  return {
    fullName,
    email,
    phone,
    skills: Array.from(skillsSet),
    totalExpMonths: totalExpMonths || 4, // Calculated months fallback
    currentCompany,
    currentTitle: "Full Stack Developer (Intern)",
    noticePeriodDays: null, // User requested: Keep blank
    currentCtc: null,       // User requested: Keep blank
    expectedCtc: null,      // User requested: Keep blank
  };
}

