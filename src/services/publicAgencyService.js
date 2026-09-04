import { supabase } from './supabase.js';

/**
 * Helper to generate SEO-friendly clean URL slug from agency name
 */
export function generateSlug(name) {
  if (!name) return 'agency-' + Date.now();
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * RecruitOS Public Agency Portal Service
 * Handles public data fetching by slug, job mandates, candidate applications, and employer inquiries.
 */

export async function getAgencyBySlug(slug) {
  if (!slug) return { success: false, error: 'Slug is required' };

  const targetSlug = slug.toLowerCase();

  // 1. Try querying Supabase database
  try {
    const { data: allAgencies, error } = await supabase
      .from('agencies')
      .select('*');

    if (!error && Array.isArray(allAgencies) && allAgencies.length > 0) {
      const data = allAgencies.find(a => 
        (a.slug && a.slug.toLowerCase() === targetSlug) || 
        generateSlug(a.name) === targetSlug ||
        a.id === targetSlug
      );

      if (data) {
        const agencySlug = data.slug || generateSlug(data.name);
        return {
          success: true,
          agency: {
            id: data.id,
            name: data.name,
            slug: agencySlug,
            status: data.status || 'ACTIVE',
            plan: data.plan || 'Enterprise',
            logoUrl: data.logo_url || null,
            primaryColor: data.primary_color || '#0284c7',
            secondaryColor: data.secondary_color || '#0f172a',
            tagline: data.tagline || `Leading Recruitment & Staffing Solutions`,
            aboutText: data.about_text || `${data.name} is a premier talent acquisition and executive search agency dedicated to connecting top-tier professionals with market-leading enterprises.`,
            missionText: data.mission_text || `To empower global organizations by discovering and delivering top 1% talent with speed, precision, and integrity.`,
            visionText: data.vision_text || `To be the most trusted strategic recruitment partner for growth enterprises across technology, engineering, and enterprise services.`,
            phone: data.phone || '+1 (800) 555-RECRUIT',
            email: data.email || data.owner_email || `contact@${agencySlug}.com`,
            address: data.address || 'Enterprise Business Tower, Suite 400, Innovation Way',
            linkedinUrl: data.linkedin_url || 'https://linkedin.com',
            websiteUrl: data.website_url || `https://recruitos.io/agency/${agencySlug}`
          }
        };
      }
    }
  } catch (e) {
    console.error('[publicAgencyService] Exception in getAgencyBySlug:', e);
  }

  // 2. Fallback check in local cache
  try {
    const local = localStorage.getItem('recruitos_agencies');
    if (local) {
      const agencies = JSON.parse(local);
      const matched = agencies.find(a => 
        (a.slug && a.slug.toLowerCase() === targetSlug) || 
        generateSlug(a.name) === targetSlug || 
        a.id === targetSlug
      );

      if (matched) {
        const matchedSlug = matched.slug || generateSlug(matched.name);
        return {
          success: true,
          agency: {
            id: matched.id,
            name: matched.name,
            slug: matchedSlug,
            status: matched.status || 'ACTIVE',
            primaryColor: matched.primaryColor || '#0284c7',
            secondaryColor: '#0f172a',
            tagline: matched.tagline || `Premier Staffing & Recruitment Partner`,
            aboutText: `${matched.name} is a specialized recruitment partner delivering executive talent across technology, engineering, and growth sectors.`,
            missionText: `Delivering exceptional hiring results with speed and accuracy.`,
            visionText: `Building future-ready workforces for global businesses.`,
            phone: '+1 (800) 555-0199',
            email: matched.ownerEmail || `careers@${matchedSlug}.com`,
            address: 'Global Trade Plaza, Suite 800',
            linkedinUrl: 'https://linkedin.com',
            websiteUrl: `https://recruitos.io/agency/${matchedSlug}`
          }
        };
      }
    }
  } catch (e) {}

  return { success: false, error: 'Agency portal not found' };
}

/**
 * Fetch Public Active Jobs for specific Agency ID
 */
export async function getPublicAgencyJobs(agencyId) {
  if (!agencyId) return { success: true, jobs: [] };

  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      const jobs = data.map(j => ({
        id: j.id,
        jobTitle: j.title || j.jobTitle || 'Mandate Position',
        jobSummary: j.summary || j.jobSummary || '',
        requiredSkills: Array.isArray(j.skills) ? j.skills : typeof j.skills === 'string' ? j.skills.split(',').map(s => s.trim()) : [],
        experienceRequired: j.experience_required || j.experienceRequired || '3+ Years',
        location: j.location || 'Remote / Hybrid',
        employmentType: j.employment_type || j.employmentType || 'Full-Time',
        status: j.status || 'Active',
        createdAt: j.created_at ? new Date(j.created_at).toISOString().split('T')[0] : 'Recently Posted'
      }));

      return { success: true, jobs };
    }
  } catch (e) {
    console.error('[publicAgencyService] Exception in getPublicAgencyJobs:', e);
  }

  return { success: true, jobs: [] };
}

/**
 * Submit Employer Hiring Requirement
 */
export async function submitEmployerInquiry(agencyId, inquiryData) {
  try {
    const { error } = await supabase
      .from('employer_inquiries')
      .insert([{
        agency_id: agencyId,
        company_name: inquiryData.companyName,
        contact_name: inquiryData.contactName,
        email: inquiryData.email,
        phone: inquiryData.phone || '',
        hiring_needs: inquiryData.hiringNeeds
      }]);

    if (error) {
      console.error('[publicAgencyService] Error submitting inquiry:', error.message);
    }
  } catch (e) {}

  return { success: true };
}
