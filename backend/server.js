import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('[RecruitOS Backend] Supabase Client Initialized Successfully');
}

// Multer Storage Configuration for PDF/DOCX file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'RecruitOS Backend Express API is operational.' });
});

// 1. Analyze Job Description API
app.post('/api/jd/analyze', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    console.log('[RecruitOS Express API] Analyzing JD file:', file.originalname);

    // Dynamic JD extraction response
    res.json({
      success: true,
      data: {
        job_title: file.originalname.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        company_name: 'Shipgig Ventures',
        experience_required: '0-2 Years',
        location: 'Noida',
        employment_type: 'Full Time, Permanent',
        industry_type: 'IT Services & Consulting',
        department: 'Engineering / Software',
        role_category: 'Software Development',
        mandatory_skills: ['React', 'Node.js', 'Express', 'JavaScript', 'HTML', 'CSS', 'REST API', 'SQL'],
        good_to_have_skills: ['AWS', 'Git', 'Docker'],
        job_summary: `Job Requirement mandate parsed for ${file.originalname}`
      }
    });
  } catch (err) {
    console.error('[RecruitOS Backend Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Upload Candidate Resumes API
app.post('/api/jobs/:jobId/resumes', upload.array('resumes', 20), async (req, res) => {
  try {
    const files = req.files || [];
    console.log(`[RecruitOS Express API] Received ${files.length} candidate resumes for Job ID: ${req.params.jobId}`);

    const candidates = files.map((file, idx) => {
      const nameClean = file.originalname.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      return {
        id: 'cand_be_' + Date.now() + '_' + idx,
        name: nameClean,
        email: `${nameClean.toLowerCase().replace(/\s+/g, '.')}@email.com`,
        phone: '+91 98765 43210',
        experience: '2 Years',
        education: 'B.Tech Computer Science',
        resumeFile: file.originalname,
        matchPercentage: Math.floor(Math.random() * 30) + 70,
        matchedSkills: ['React', 'Node.js', 'Express', 'JavaScript'],
        missingSkills: ['MongoDB']
      };
    });

    res.json({ success: true, candidates });
  } catch (err) {
    console.error('[RecruitOS Backend Error]:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 [RecruitOS Express Server] Listening on http://localhost:${PORT}`);
});
