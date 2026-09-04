import mammoth from 'mammoth';

// Universal Dictionary of 150+ Multi-Domain ATS Skills
export const ALL_ATS_SKILLS = [
  // Web & Frontend
  'React', 'Angular', 'Vue.js', 'Vue', 'Next.js', 'Nuxt.js', 'Redux', 'TypeScript', 'JavaScript', 'HTML5', 'HTML', 'CSS3', 'CSS', 'Sass', 'TailwindCSS', 'Tailwind', 'Bootstrap', 'jQuery',
  // Backend & Core Languages
  'Python', 'Java', 'C++', 'C#', '.NET', 'ASP.NET', 'Go', 'Golang', 'Node.js', 'NodeJS', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Spring', 'PHP', 'Laravel', 'Ruby', 'Rails', 'Rust', 'Scala',
  // Database & Storage
  'SQL', 'PostgreSQL', 'Postgres', 'MySQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server', 'NoSQL', 'Elasticsearch', 'Cassandra', 'Snowflake', 'DynamoDB',
  // Cloud & DevOps
  'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'Terraform', 'Ansible', 'Linux', 'Git', 'GitHub', 'GitLab', 'Microservices', 'Kafka', 'RabbitMQ', 'REST API', 'GraphQL',
  // Data Science & AI/ML
  'Machine Learning', 'Deep Learning', 'Data Science', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy', 'NLP', 'Computer Vision', 'Power BI', 'Tableau', 'Excel',
  // Software QA / Testing
  'Selenium', 'Cypress', 'Playwright', 'Jest', 'Mocha', 'JUnit', 'Postman', 'Manual Testing', 'Automation Testing',
  // Management & Soft Skills
  'Agile', 'Scrum', 'Jira', 'Project Management', 'Product Management', 'HR', 'Recruitment', 'Sales', 'Marketing', 'SEO'
];

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

        // Try DecompressStream for compressed PDF FlateDecode stream blocks
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

        // Fallback ASCII text extraction if extractedText is short
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
  "fullName": "string (Candidate's actual first and last name - ignore words like RESUME, CV, CURRICULUM VITAE, NAUKRI, CONFIDENTIAL, ORIGINAL)",
  "email": "string (Primary valid email address e.g. candidate@domain.com)",
  "phone": "string (Primary valid mobile number with country code, e.g. +91 9876543210)",
  "currentCompany": "string or null (Current or most recent company/employer)",
  "currentTitle": "string or null (Current or most recent job title)",
  "totalExpYears": number (Total years of work experience as number e.g. 5.5, or 0 if unknown),
  "currentCtc": number or null (Current annual CTC in absolute numbers e.g. 2400000, or null),
  "expectedCtc": number or null (Expected annual CTC in absolute numbers e.g. 3200000, or null),
  "currency": "string (e.g. INR, USD, default INR)",
  "noticePeriodDays": number (Notice period in days e.g. 15, 30, 60, 90. Default 30 if not mentioned),
  "location": "string or null (City / Location)",
  "skills": ["string"] (Array of specific technical, domain, database, cloud, framework, or tool skills present in candidate's resume),
  "summary": "string or null (2-3 sentence executive professional summary)",
  "workHistory": [
    {
      "company": "string",
      "title": "string",
      "duration": "string"
    }
  ]
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
        console.log('✨ [Gemini AI Parser] Successfully parsed resume candidate profile:', parsedJson.fullName, parsedJson.email, parsedJson.phone, parsedJson.skills);
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
      if (!detectedSkills.includes(skill)) {
        detectedSkills.push(skill);
      }
    }
  });

  if (detectedSkills.length === 0 && /full stack/i.test(title)) {
    detectedSkills.push('React', 'Node.js', 'Express', 'JavaScript', 'HTML', 'CSS', 'MongoDB', 'REST API', 'Git');
  } else if (detectedSkills.length === 0 && /java/i.test(title)) {
    detectedSkills.push('Java', 'Spring Boot', 'REST API', 'SQL', 'Hibernate', 'Microservices', 'Git');
  } else if (detectedSkills.length === 0 && /python/i.test(title)) {
    detectedSkills.push('Python', 'Django', 'FastAPI', 'REST API', 'PostgreSQL', 'Docker', 'Git');
  }

  const allRequiredSkills = detectedSkills.length > 0
    ? detectedSkills
    : ['React', 'Node.js', 'Express', 'JavaScript', 'HTML', 'CSS', 'MongoDB', 'REST API', 'Git'];

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
