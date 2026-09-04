import { supabase } from './supabase.js';

let LOCAL_SUBMISSIONS_CACHE = [];

function getLocalSubmissions() {
  try {
    if (typeof localStorage !== 'undefined') {
      const s = localStorage.getItem('recruitos_submissions');
      if (s) return JSON.parse(s);
    }
  } catch (e) {}
  return LOCAL_SUBMISSIONS_CACHE;
}

function setLocalSubmissions(subs) {
  LOCAL_SUBMISSIONS_CACHE = subs;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('recruitos_submissions', JSON.stringify(subs));
    }
  } catch (e) {}
}

/**
 * Creates or updates a Candidate Shortlist & Client Submission record
 */
export async function saveCandidateSubmission(submissionData) {
  const token = submissionData.magic_link_token || 'share_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();

  const record = {
    id: submissionData.id || 'sub_' + Date.now(),
    agency_id: submissionData.agency_id || null,
    job_id: submissionData.job_id || null,
    candidate_id: submissionData.candidate_id || null,
    source_name: submissionData.source_name || 'Naukri',
    date_of_sourcing: submissionData.date_of_sourcing || new Date().toISOString().split('T')[0],
    ready_to_relocate: submissionData.ready_to_relocate || 'Yes',
    relevant_experience: submissionData.relevant_experience || '3 Years',
    current_salary: submissionData.current_salary || submissionData.current_ctc || 1800000,
    expected_salary: submissionData.expected_salary || submissionData.expected_ctc || 2400000,
    notice_period: submissionData.notice_period || '30 Days',
    reason_for_leaving: submissionData.reason_for_leaving || 'Better Growth & Technology',
    offer_in_hand: submissionData.offer_in_hand || 'No',
    status: submissionData.status || 'Approved', // Approved, Hold, Rejected
    last_call_details: submissionData.last_call_details || '',
    magic_link_token: token,
    created_at: submissionData.created_at || new Date().toISOString()
  };

  // 1. Save to Supabase
  try {
    const { data, error } = await supabase
      .from('candidate_submissions')
      .upsert([record])
      .select()
      .single();

    if (!error && data) {
      record.id = data.id;
    }
  } catch (err) {
    console.warn('[submissionsService] Supabase fallback to local:', err.message);
  }

  // 2. Local Fallback
  const current = getLocalSubmissions();
  const idx = current.findIndex(s => s.id === record.id || (s.candidate_id && s.candidate_id === record.candidate_id && s.job_id === record.job_id));
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...record };
  } else {
    current.unshift(record);
  }
  setLocalSubmissions(current);

  return record;
}

/**
 * Gets all submissions for a specific job or agency
 */
export async function getSubmissions(jobId = null, agencyId = null) {
  const localList = getLocalSubmissions();

  try {
    let query = supabase.from('candidate_submissions').select('*').order('created_at', { ascending: false });
    if (jobId) query = query.eq('job_id', jobId);
    if (agencyId) query = query.eq('agency_id', agencyId);

    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      const map = new Map();
      localList.forEach(s => map.set(s.id, s));
      data.forEach(s => map.set(s.id, s));
      const merged = Array.from(map.values());
      setLocalSubmissions(merged);
      return merged;
    }
  } catch (err) {}

  return localList.filter(s => (!jobId || s.job_id === jobId) && (!agencyId || s.agency_id === agencyId));
}

/**
 * Get single submission by Magic Link Token (Public View)
 */
export async function getSubmissionByMagicToken(token) {
  if (!token) return null;

  try {
    const { data, error } = await supabase
      .from('candidate_submissions')
      .select('*')
      .eq('magic_link_token', token)
      .single();

    if (!error && data) return data;
  } catch (e) {}

  const localList = getLocalSubmissions();
  return localList.find(s => s.magic_link_token === token) || null;
}
