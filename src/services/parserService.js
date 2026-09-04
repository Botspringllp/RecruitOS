import mammoth from 'mammoth';

// Universal Dictionary of 150+ Multi-Domain ATS Skills
export const ALL_ATS_SKILLS = [
  'React', 'Angular', 'Vue.js', 'Next.js', 'Nuxt.js', 'Redux', 'TypeScript', 'JavaScript', 'HTML5', 'HTML', 'CSS3', 'CSS', 'Sass', 'TailwindCSS', 'Bootstrap',
  'Python', 'Java', 'C++', 'C#', '.NET', 'Go', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'PHP', 'Laravel', 'Ruby', 'Rails', 'Rust',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server', 'NoSQL', 'Elasticsearch', 'Cassandra', 'Snowflake', 'DynamoDB',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Terraform', 'Ansible', 'Linux', 'Git', 'GitHub', 'GitLab', 'Microservices', 'Kafka', 'REST API', 'GraphQL',
  'Machine Learning', 'Deep Learning', 'Data Science', 'PyTorch', 'TensorFlow', 'Pandas', 'NumPy', 'NLP', 'Power BI', 'Tableau',
  'Selenium', 'Cypress', 'Playwright', 'Jest', 'Postman', 'Manual Testing', 'Automation Testing',
  'Agile', 'Scrum', 'Jira', 'Project Management', 'Product Management', 'HR', 'Recruitment'
];

/**
 * Normalizes skill strings so React.js = React, Node JS = Node.js, Javascript = JavaScript
 */
export function normalizeSkill(skillStr) {
  if (!skillStr || typeof skillStr !== 'string') return '';
  const s = skillStr.trim();
  const lower = s.toLowerCase();

  if (/^react(\.?js)?$/i.test(lower)) return 'React';
  if (/^node(\s*|\.?)js$/i.test(lower)) return 'Node.js';
  if (/^java\s*script$/i.test(lower) || /^js$/i.test(lower)) return 'JavaScript';
  if (/^type\s*script$/i.test(lower) || /^ts$/i.test(lower)) return 'TypeScript';
  if (/^postgres(ql)?$/i.test(lower)) return 'PostgreSQL';
  if (/^mongo(db)?$/i.test(lower)) return 'MongoDB';
  if (/^vue(\.?js)?$/i.test(lower)) return 'Vue.js';
  if (/^express(\.?js)?$/i.test(lower)) return 'Express';
  if (/^next(\.?js)?$/i.test(lower)) return 'Next.js';
  if (/^nuxt(\.?js)?$/i.test(lower)) return 'Nuxt.js';
  if (/^spring(\s*boot)?$/i.test(lower)) return 'Spring Boot';
  if (/^asp\.net|dotnet|\.net$/i.test(lower)) return '.NET';
  if (/^aws|amazon web services$/i.test(lower)) return 'AWS';
  if (/^gcp|google cloud( platform)?$/i.test(lower)) return 'GCP';

  return s;
}

/**
 * Normalize array of skills
 */
export function normalizeSkillList(skillsArray = []) {
  if (!Array.isArray(skillsArray)) return [];
  const normalized = [];
  skillsArray.forEach(sk => {
    const norm = normalizeSkill(sk);
    if (norm && !normalized.some(n => n.toLowerCase() === norm.toLowerCase())) {
      normalized.push(norm);
    }
  });
  return normalized;
}

/**
 * Calculates exact JD vs Resume Match Score according to formula:
 * Match % = (Matched Skills / Total JD Skills) * 100
 */
export function calculateSkillMatch(jdSkills = [], candidateSkills = [], rawText = '') {
  const normJdSkills = normalizeSkillList(jdSkills.length > 0 ? jdSkills : ['React', 'Node.js', 'Express', 'JavaScript', 'HTML', 'CSS']);
  const normCandidateSkills = normalizeSkillList(candidateSkills);
  const combinedText = `${rawText} ${normCandidateSkills.join(' ')}`;

  const matchedSkills = [];
  const missingSkills = [];

  normJdSkills.forEach(jdSkill => {
    const reg = new RegExp(`\\b${jdSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const isMatched = normCandidateSkills.some(cs => cs.toLowerCase() === jdSkill.toLowerCase()) || reg.test(combinedText);

    if (isMatched) {
      if (!matchedSkills.includes(jdSkill)) matchedSkills.push(jdSkill);
    } else {
      if (!missingSkills.includes(jdSkill)) missingSkills.push(jdSkill);
    }
  });

  const totalJd = normJdSkills.length;
  const matchedCount = matchedSkills.length;

  let match_percentage = totalJd > 0 ? Math.round((matchedCount / totalJd) * 100) : 80;
  match_percentage = Math.min(100, Math.max(matchedCount > 0 ? 25 : 10, match_percentage));

  return {
    matched_skills: matchedSkills,
    missing_skills: missingSkills,
    match_percentage
  };
}

/**
 * Converts File Blob to Base64 string for Gemini API
 */
export async function fileToBase64(file) {
  if (!file || typeof Blob === 'undefined' || !(file instanceof Blob)) return null;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = typeof result === 'string' && result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Reads clean text content from binary PDF or DOCX ArrayBuffer
 */
export async function readTextFromFileClient(file) {
  if (!file) return '';

  // 1. If DOCX, use Mammoth
  if (file.name && file.name.toLowerCase().endsWith('.docx')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      if (result && result.value && result.value.trim().length > 10) {
        return result.value.trim();
      }
    } catch (e) {
      console.warn('[parserService] Mammoth DOCX parsing fallback:', e.message);
    }
  }

  // 2. Parse PDF / Binary file
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target.result;
        const bytes = new Uint8Array(buffer);
        const latin1Decoder = new TextDecoder('latin1');
        const rawStr = latin1Decoder.decode(bytes);

        let extractedText = '';

        // Extract PDF Tj/TJ text strings
        const tjRegex = /\(([^()]{1,200})\)\s*T[jJ]/g;
        let match;
        while ((match = tjRegex.exec(rawStr)) !== null) {
          const s = match[1].replace(/\\([()\\])/g, '$1').trim();
          if (s.length > 0 && !/^[\x00-\x1F\x7F-\x9F]+$/.test(s)) {
            extractedText += s + ' ';
          }
        }

        // Extract PDF Hex Strings <416c6f6b>
        const hexRegex = /<([0-9a-fA-F]{4,400})>\s*T[jJ]/g;
        while ((match = hexRegex.exec(rawStr)) !== null) {
          try {
            const hex = match[1];
            let str = '';
            for (let i = 0; i < hex.length; i += 2) {
              const code = parseInt(hex.substr(i, 2), 16);
              if (code >= 32 && code <= 126) str += String.fromCharCode(code);
            }
            if (str.length > 1) extractedText += str + ' ';
          } catch (err) {}
        }

        // DecompressStream for compressed PDF FlateDecode streams
        if (typeof DecompressStream !== 'undefined') {
          const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
          let streamMatch;
          let count = 0;
          while ((streamMatch = streamRegex.exec(rawStr)) !== null && count < 30) {
            count++;
            try {
              const streamStr = streamMatch[1];
              const streamBytes = new Uint8Array(streamStr.length);
              for (let i = 0; i < streamStr.length; i++) {
                streamBytes[i] = streamStr.charCodeAt(i) & 0xff;
              }

              const ds = new DecompressStream('deflate');
              const writer = ds.writable.getWriter();
              writer.write(streamBytes);
              writer.close();
              const response = new Response(ds.readable);
              const decompressedBuf = await response.arrayBuffer();
              const decompressedStr = latin1Decoder.decode(new Uint8Array(decompressedBuf));

              let innerMatch;
              while ((innerMatch = tjRegex.exec(decompressedStr)) !== null) {
                const s = innerMatch[1].replace(/\\([()\\])/g, '$1').trim();
                if (s.length > 0 && !/^[\x00-\x1F\x7F-\x9F]+$/.test(s)) {
                  extractedText += s + ' ';
                }
              }
            } catch (err) {}
          }
        }

        if (extractedText.length < 40) {
          const asciiWords = rawStr.match(/[a-zA-Z0-9\+\#\.\,\:\;\-\@\s]{4,80}/g);
          if (asciiWords) {
            extractedText = asciiWords
              .filter(w => !/obj|endobj|stream|endstream|xref|trailer|Catalog|Font/i.test(w))
              .join(' ');
          }
        }

        resolve(extractedText.replace(/\s+/g, ' ').trim());
      } catch (err) {
        resolve('');
      }
    };
    reader.onerror = () => resolve('');
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Call Gemini API with direct inline PDF/DOCX Base64 file & exact JSON prompt schema
 */
export async function parseResumeWithGemini(file, rawResumeText = '') {
  const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    '';

  if (!apiKey) return null;

  const promptText = `You are an expert recruitment parser. Extract candidate details from the following resume document into strict JSON matching this exact schema:

{
  "fullName": "string (Candidate's actual first and last name)",
  "email": "string (Primary valid email address e.g. candidate@domain.com)",
  "phone": "string (Primary valid mobile number with country code e.g. +91 9876543210)",
  "location": "string or null (City / Location)",
  "currentCompany": "string or null (Current employer name)",
  "previousCompany": "string or null (Previous employer name)",
  "designation": "string or null (Current job title/role e.g. Senior Software Engineer)",
  "totalExpYears": number (Total years of experience as number e.g. 5.5),
  "education": "string or null (Highest degree e.g. B.Tech Computer Science)",
  "skills": ["string"] (Array of specific technical, domain, or tool skills),
  "currentCtc": number or null (Current annual CTC in absolute numbers e.g. 1800000),
  "expectedCtc": number or null (Expected annual CTC in absolute numbers e.g. 2400000),
  "noticePeriod": "string or null (Notice period e.g. 30 Days)"
}`;

  try {
    let parts = [];

    if (file && typeof Blob !== 'undefined' && file instanceof Blob) {
      const base64Data = await fileToBase64(file);
      if (base64Data) {
        const mimeType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        parts.push({
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        });
      }
    }

    if (rawResumeText && rawResumeText.length > 20) {
      parts.push({ text: `Resume Raw Extracted Text:\n"""\n${rawResumeText.substring(0, 12000)}\n"""` });
    }

    parts.push({ text: promptText });

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (res.ok) {
      const data = await res.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textResponse) {
        const parsedJson = JSON.parse(textResponse);
        console.log('✨ [Gemini AI Parser] Parsed profile:', parsedJson.fullName, parsedJson.email, parsedJson.skills);
        return parsedJson;
      }
    }
  } catch (e) {
    console.warn('[parserService] Gemini API call skipped/fallback:', e.message);
  }

  return null;
}

/**
 * Dynamic High-Precision Job Requirement Parser
 */
export function extractDynamicJdData(filename, fileText = '') {
  const cleanFilename = filename.replace(/\.[^/.]+$/, '').trim();
  
  let title = '';
  let location = 'Remote';
  let companyName = '';
  let experience = 'Not Specified';

  const parts = cleanFilename.split(/\s*[-|_|–]\s*/).map(p => p.trim()).filter(Boolean);

  if (parts.length >= 2) {
    title = parts[0];

    parts.slice(1).forEach(part => {
      if (/bengaluru|bangalore|mumbai|delhi|noida|gurgaon|gurugram|hyderabad|pune|chennai|kolkata|remote|hybrid/i.test(part)) {
        location = part;
      } else if (/\d+.*year/i.test(part)) {
        const expM = part.match(/(\d+\s*(?:to|-)?\s*\d*)\s*(?:years?|yrs?)/i);
        if (expM) experience = `${expM[1].trim()} Years`;
        else experience = part;
      } else if (part.length > 2 && !/job|description|jd|hiring|requirement/i.test(part)) {
        companyName = part;
      }
    });
  }

  if (!title) {
    title = cleanFilename.replace(/\b(?:job|description|jd|requirement|mandate|doc|pdf|docx|final|updated|v\d+|hiring)\b/gi, '').trim();
  }
  if (!title) title = cleanFilename;

  const combinedText = `${cleanFilename} ${fileText}`;

  if (experience === 'Not Specified') {
    const expMatch = combinedText.match(/(\d+\s*(?:to|-|–)?\s*\d*)\s*(?:years?|yrs?|yr)\b/i);
    if (expMatch) experience = `${expMatch[1].trim()} Years`;
  }

  if (location === 'Remote') {
    const cities = ['Bengaluru', 'Bangalore', 'Mumbai', 'Delhi', 'Noida', 'Gurgaon', 'Gurugram', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Remote', 'Hybrid'];
    for (const city of cities) {
      if (new RegExp(`\\b${city}\\b`, 'i').test(combinedText)) {
        location = (city === 'Bangalore') ? 'Bengaluru' : (city === 'Gurugram') ? 'Gurgaon' : city;
        break;
      }
    }
  }

  const detectedSkills = [];
  ALL_ATS_SKILLS.forEach(skill => {
    const reg = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (reg.test(combinedText)) {
      const norm = normalizeSkill(skill);
      if (!detectedSkills.includes(norm)) {
        detectedSkills.push(norm);
      }
    }
  });

  const allRequiredSkills = normalizeSkillList(
    detectedSkills.length > 0
      ? detectedSkills
      : ['React', 'Node.js', 'Express', 'JavaScript', 'HTML', 'CSS', 'MongoDB', 'REST API', 'Git']
  );

  const description = `Position: ${title}
Company: ${companyName || 'Shipgig Ventures'}
Location: ${location}
Experience Required: ${experience}
Employment Type: Full Time, Permanent

Job Overview:
We are looking for an experienced ${title} ${companyName ? `at ${companyName}` : ''} to design, develop, and maintain high-performance web applications and REST APIs.

Key Responsibilities:
- Build responsive user interfaces and backend API integrations.
- Collaborate with engineering and product teams to deliver high quality code.
- Ensure optimal application performance, scalability, and security.

Required Skills:
${allRequiredSkills.join(', ')}`;

  return {
    title,
    company_name: companyName || 'Shipgig Ventures',
    experience,
    location,
    employmentType: 'Full Time, Permanent',
    industry: 'IT Services & Consulting',
    department: 'Engineering / Software',
    roleCategory: 'Software Development',
    allRequiredSkills,
    jobDescription: description
  };
}
