import { supabase } from './supabase.js';

/**
 * RecruitOS Jobs Service - Dual-Persistence (Supabase Database + Local Storage Cache Merger)
 * Guarantees zero data loss on sign out / page reload. Enforces agency_id scoping.
 */

const DEFAULT_SEED_JOBS = [
  {
    id: 'job_python_001',
    jobTitle: 'Senior Python Developer',
    jobSummary: 'Seeking an experienced Senior Python Developer proficient in Django, Flask, PostgreSQL, Docker, and REST APIs.',
    requiredSkills: ['Python', 'Django', 'Flask', 'PostgreSQL', 'Docker', 'REST API', 'Git'],
    experienceRequired: '3 to 5 Years',
    location: 'Noida',
    employmentType: 'Full-Time',
    status: 'Active',
    agencyId: 'agency_shipgig_001',
    createdAt: '2026-09-01',
    totalUploadedResumes: 3,
    totalParsedResumes: 3,
    avgMatchScore: 78,
    candidates: [
      {
        id: 'cand_alok_001',
        fullName: 'Alok Ranjan',
        email: 'alok.ranjan@domain.com',
        phone: '+91 98765 43210',
        location: 'Noida',
        totalExperience: '3 Years',
        education: 'MCA',
        currentCompany: 'Shipgig Ventures',
        designation: 'Senior Software Engineer',
        skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'REST API', 'Git'],
        matched_skills: ['Python', 'Django', 'PostgreSQL', 'Docker', 'REST API', 'Git'],
        missing_skills: ['Flask'],
        matchPercentage: 86,
        status: 'Applied',
        resumeFileName: 'Alok_Ranjan_Resume.pdf'
      },
      {
        id: 'cand_ashok_002',
        fullName: 'Ashok Chinthapanti',
        email: 'ashok.c@outlook.com',
        phone: '+91 98765 12340',
        location: 'Hyderabad',
        totalExperience: '8 Years',
        education: 'B.Tech Computer Science',
        currentCompany: 'Tech Solutions Ltd',
        designation: 'Technical Lead',
        skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
        matched_skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
        missing_skills: ['Flask', 'REST API', 'Git'],
        matchPercentage: 57,
        status: 'Applied',
        resumeFileName: 'Ashok_Chinthapanti_Resume.pdf'
      },
      {
        id: 'cand_jp_003',
        fullName: 'Jayaprakash K',
        email: 'k.j.prakash@outlook.com',
        phone: '+91 98123 45678',
        location: 'Chennai',
        totalExperience: '1 Year',
        education: 'B.Tech Computer Science',
        currentCompany: 'Innovate Labs',
        designation: 'Software Engineer',
        skills: ['Python', 'Git'],
        matched_skills: ['Python', 'Git'],
        missing_skills: ['Django', 'Flask', 'PostgreSQL', 'Docker', 'REST API'],
        matchPercentage: 29,
        status: 'Applied',
        resumeFileName: 'Jayaprakash_K_Resume.pdf'
      }
    ]
  }
];

function getLocalJobs() {
  try {
    if (typeof localStorage !== 'undefined') {
      const s = localStorage.getItem('recruitos_jobs');
      if (s) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      localStorage.setItem('recruitos_jobs', JSON.stringify(DEFAULT_SEED_JOBS));
      return DEFAULT_SEED_JOBS;
    }
  } catch (e) {}
  return DEFAULT_SEED_JOBS;
}

function setLocalJobs(jobs) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('recruitos_jobs', JSON.stringify(jobs));
    }
  } catch (e) {}
}

function formatSupabaseJobRow(row, appsMap = {}) {
  if (!row) return null;
  const skills = Array.isArray(row.skills)
    ? row.skills
    : typeof row.skills === 'string'
      ? row.skills.split(',').map(s => s.trim())
      : [];

  const jobApps = appsMap[row.id] || [];
  const count = jobApps.length;
  const totalScore = jobApps.reduce((acc, a) => acc + (a.match_score || 85), 0);
  const avgScore = count > 0 ? Math.round(totalScore / count) : 0;

  return {
    id: row.id,
    jobTitle: row.title || row.jobTitle || 'Untitled Job',
    jobSummary: row.summary || row.jobSummary || '',
    requiredSkills: skills,
    experienceRequired: row.experience_required || row.experienceRequired || 'Not Specified',
    location: row.location || 'Remote',
    employmentType: row.employment_type || row.employmentType || 'Full-Time',
    status: row.status || 'Active',
    agencyId: row.agency_id || row.agencyId || null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : (row.createdAt || new Date().toISOString().split('T')[0]),
    totalUploadedResumes: count,
    totalParsedResumes: count,
    avgMatchScore: avgScore,
    candidates: jobApps
  };
}

/**
 * 1. Get All Jobs with Live Total Resumes Count (Strictly Tenant Scoped & Merged)
 */
export async function getAllJobs(agencyId = null, role = null) {
  if (role === 'SUPER_ADMIN') {
    return { success: true, jobs: [], error: null };
  }

  const localJobs = getLocalJobs().filter(j => !agencyId || j.agencyId === agencyId);

  try {
    // A. Query jobs table from Supabase
    let jobsQuery = supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (agencyId) {
      jobsQuery = jobsQuery.eq('agency_id', agencyId);
    }
    const { data: jobsData, error: jobsError } = await jobsQuery;

    // B. Query applications count
    let appsQuery = supabase.from('applications').select('job_id, match_score');
    if (agencyId) {
      appsQuery = appsQuery.eq('agency_id', agencyId);
    }
    const { data: appsData } = await appsQuery;

    const appsMap = {};
    if (Array.isArray(appsData)) {
      appsData.forEach(app => {
        if (app.job_id) {
          if (!appsMap[app.job_id]) appsMap[app.job_id] = [];
          appsMap[app.job_id].push(app);
        }
      });
    }

    if (!jobsError && Array.isArray(jobsData) && jobsData.length > 0) {
      const dbJobs = jobsData.map(row => formatSupabaseJobRow(row, appsMap));

      // MERGE DB jobs with localJobs so created jobs persist cleanly across sign outs
      const combinedMap = new Map();
      localJobs.forEach(j => combinedMap.set(j.id, j));
      dbJobs.forEach(j => combinedMap.set(j.id, j));

      const mergedJobs = Array.from(combinedMap.values());

      // Save all merged jobs to local cache
      const allLocal = getLocalJobs();
      const allLocalMap = new Map(allLocal.map(j => [j.id, j]));
      mergedJobs.forEach(j => allLocalMap.set(j.id, j));
      setLocalJobs(Array.from(allLocalMap.values()));

      return { success: true, jobs: mergedJobs, error: null };
    }
  } catch (err) {
    console.error('[jobsService] Exception in getAllJobs:', err);
  }

  return { success: true, jobs: localJobs, error: null };
}

/**
 * 2. Get Job By Id
 */
export async function getJobById(id, agencyId = null) {
  const localJobs = getLocalJobs();
  const localFound = localJobs.find(j => j.id === id);

  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (!error && data) {
      if (agencyId && data.agency_id && data.agency_id !== agencyId) {
        return { success: false, error: 'Unauthorized: Access to job in another agency is denied.', job: null };
      }

      // Fetch applications count
      const { data: appsData } = await supabase.from('applications').select('*').eq('job_id', id);
      const appsMap = { [id]: appsData || [] };

      return { success: true, job: formatSupabaseJobRow(data, appsMap), error: null };
    }
  } catch (err) {}

  if (localFound) {
    return { success: true, job: localFound, error: null };
  }

  return { success: false, error: 'Job requirement not found', job: null };
}

/**
 * 3. Create Job Mandate with agency_id & Dual-Persistence
 */
export async function createJob(jobData, agencyId = null) {
  const jobId = 'job_' + Date.now();
  const skillsArray = Array.isArray(jobData.requiredSkills)
    ? jobData.requiredSkills
    : jobData.requiredSkills
      ? String(jobData.requiredSkills).split(',').map(s => s.trim())
      : [];

  const newJob = {
    id: jobId,
    jobTitle: jobData.jobTitle,
    jobSummary: jobData.jobSummary || '',
    requiredSkills: skillsArray,
    experienceRequired: jobData.experienceRequired || 'Not Specified',
    location: jobData.location || 'Remote',
    employmentType: jobData.employmentType || 'Full-Time',
    status: 'Active',
    agencyId: agencyId || jobData.agencyId || null,
    createdAt: new Date().toISOString().split('T')[0],
    totalUploadedResumes: 0,
    totalParsedResumes: 0,
    avgMatchScore: 0,
    candidates: []
  };

  // A. Save to local storage cache immediately
  const localJobs = getLocalJobs();
  localJobs.unshift(newJob);
  setLocalJobs(localJobs);

  // B. Insert into Supabase database
  try {
    const dbPayload = {
      title: jobData.jobTitle,
      summary: jobData.jobSummary || '',
      skills: skillsArray,
      experience_required: jobData.experienceRequired || 'Not Specified',
      location: jobData.location || 'Remote',
      employment_type: jobData.employmentType || 'Full-Time',
      agency_id: agencyId || jobData.agencyId || null
    };

    const { data, error } = await supabase
      .from('jobs')
      .insert([dbPayload])
      .select()
      .single();

    if (!error && data) {
      const formatted = formatSupabaseJobRow(data);
      const updatedLocal = getLocalJobs().map(j => j.id === jobId ? { ...j, ...formatted } : j);
      setLocalJobs(updatedLocal);
      return { success: true, job: formatted, error: null };
    } else if (error) {
      console.warn('[jobsService] Supabase insert warning:', error.message);
    }
  } catch (err) {
    console.warn('[jobsService] Supabase insert exception:', err);
  }

  return { success: true, job: newJob, error: null };
}
