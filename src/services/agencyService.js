import { supabase } from './supabase.js';
import { createUser } from './authService.js';

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
 * Local Storage Fallback Cache Helper
 */
function getLocalAgencies() {
  try {
    if (typeof localStorage !== 'undefined') {
      const s = localStorage.getItem('recruitos_agencies');
      if (s) return JSON.parse(s);
    }
  } catch (e) {}
  return [];
}

function setLocalAgencies(agencies) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('recruitos_agencies', JSON.stringify(agencies));
    }
  } catch (e) {}
}

export function clearMockAgencies() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('recruitos_agencies');
    }
  } catch (e) {}
}

/**
 * 1. Get All Agencies (Supabase Database + Local Cache Merger)
 */
export async function getAllAgencies() {
  const localAgencies = getLocalAgencies();
  try {
    const { data, error } = await supabase
      .from('agencies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[agencyService] Supabase fetch error:', error.message || error);
    }

    if (!error && Array.isArray(data)) {
      const dbAgencies = data.map(a => ({
        id: a.id,
        name: a.name,
        slug: a.slug || generateSlug(a.name),
        status: a.status || 'ACTIVE',
        plan: a.plan || 'Enterprise',
        createdAt: a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        lastActivityAt: a.last_activity_at ? new Date(a.last_activity_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        ownerName: a.owner_name || 'Agency Owner',
        ownerEmail: a.owner_email || `owner@${a.name.toLowerCase().replace(/\s+/g, '')}.com`,
        totalUsers: a.total_users || 1,
        logoUrl: a.logo_url || null,
        primaryColor: a.primary_color || '#0284c7',
        tagline: a.tagline || 'Connecting Top Talent with Leading Organizations'
      }));

      // Merge DB agencies with localAgencies so new agencies are never lost
      const combinedMap = new Map();
      localAgencies.forEach(a => combinedMap.set(a.id, a));
      dbAgencies.forEach(a => combinedMap.set(a.id, a));

      const mergedAgencies = Array.from(combinedMap.values());
      setLocalAgencies(mergedAgencies);
      return { success: true, agencies: mergedAgencies };
    }
  } catch (e) {
    console.error('[agencyService] Exception on getAllAgencies:', e);
  }

  return { success: true, agencies: localAgencies };
}

/**
 * 2. Create New Agency & Provision Agency Owner Account in Database
 */
export async function createAgency(agencyData) {
  const agencyId = 'agency_' + Date.now();
  const ownerPassword = agencyData.password || 'password123';
  const slug = generateSlug(agencyData.name);

  const newAgency = {
    id: agencyId,
    name: agencyData.name,
    slug: slug,
    status: agencyData.status || 'ACTIVE',
    plan: agencyData.plan || 'Enterprise',
    createdAt: new Date().toISOString().split('T')[0],
    lastActivityAt: new Date().toISOString().split('T')[0],
    ownerName: agencyData.ownerName || 'Agency Owner',
    ownerEmail: agencyData.ownerEmail.toLowerCase(),
    totalUsers: 1,
    primaryColor: '#0284c7',
    tagline: `Leading ${agencyData.name} Recruitment & Staffing Solutions`
  };

  // A. Update local cache immediately
  const current = getLocalAgencies();
  const updated = [newAgency, ...current.filter(a => a.id !== agencyId)];
  setLocalAgencies(updated);

  // B. Insert into Supabase agencies table (with intelligent fallback handling)
  try {
    // Attempt inserting extended payload first
    const extendedPayload = {
      id: agencyId,
      name: newAgency.name,
      slug: newAgency.slug,
      status: newAgency.status,
      plan: newAgency.plan,
      owner_name: newAgency.ownerName,
      owner_email: newAgency.ownerEmail,
      total_users: 1,
      primary_color: '#0284c7',
      tagline: newAgency.tagline
    };

    let { data, error } = await supabase.from('agencies').insert([extendedPayload]).select();

    // If extended insert fails due to missing columns (PGRST204), fall back to base schema columns
    if (error && error.code === 'PGRST204') {
      console.warn('[agencyService] Supabase column missing, trying base payload insert...');
      const basePayload = {
        id: agencyId,
        name: newAgency.name,
        status: newAgency.status,
        plan: newAgency.plan,
        owner_name: newAgency.ownerName,
        owner_email: newAgency.ownerEmail,
        total_users: 1
      };
      const res = await supabase.from('agencies').insert([basePayload]).select();
      data = res.data;
      error = res.error;
    }

    if (error) {
      console.error('[agencyService] Supabase insert error for agency:', error.message || error);
    } else {
      console.log('[agencyService] Saved agency to Supabase database successfully:', data);
    }
  } catch (e) {
    console.error('[agencyService] Exception on createAgency insert:', e);
  }

  // C. Provision the Agency Owner Account in user profiles
  await createUser({
    name: newAgency.ownerName,
    email: newAgency.ownerEmail,
    password: ownerPassword,
    role: 'AGENCY_OWNER',
    agencyId: agencyId,
    agencyName: newAgency.name,
    status: 'ACTIVE'
  });

  return { 
    success: true, 
    agency: newAgency,
    credentials: {
      email: newAgency.ownerEmail,
      password: ownerPassword
    }
  };
}

/**
 * 3. Update Agency Branding Settings (Agency Owner Control)
 */
export async function updateAgencyBranding(agencyId, brandingData) {
  const current = getLocalAgencies();
  const updated = current.map(a => a.id === agencyId ? { ...a, ...brandingData } : a);
  setLocalAgencies(updated);

  try {
    const dbPayload = {
      logo_url: brandingData.logoUrl,
      primary_color: brandingData.primaryColor,
      secondary_color: brandingData.secondaryColor,
      tagline: brandingData.tagline,
      about_text: brandingData.aboutText,
      mission_text: brandingData.missionText,
      vision_text: brandingData.visionText,
      phone: brandingData.phone,
      email: brandingData.email,
      address: brandingData.address,
      linkedin_url: brandingData.linkedinUrl,
      website_url: brandingData.websiteUrl
    };

    const { error } = await supabase
      .from('agencies')
      .update(dbPayload)
      .eq('id', agencyId);

    if (error) {
      console.error('[agencyService] Update branding Supabase error:', error.message);
    }
  } catch (e) {
    console.error('[agencyService] Exception on updateAgencyBranding:', e);
  }

  return { success: true };
}

/**
 * 4. Update Agency Status (Active / Suspended)
 */
export async function updateAgencyStatus(agencyId, newStatus) {
  const current = getLocalAgencies();
  const updated = current.map(a => a.id === agencyId ? { ...a, status: newStatus } : a);
  setLocalAgencies(updated);

  try {
    const { error } = await supabase
      .from('agencies')
      .update({ status: newStatus })
      .eq('id', agencyId);

    if (error) {
      console.error('[agencyService] Update agency status Supabase error:', error.message);
    }
  } catch (e) {}

  return { success: true };
}

/**
 * 5. Soft-Delete Agency (Move to Deleted Agencies Archive)
 */
export async function deleteAgency(agencyId) {
  const current = getLocalAgencies();
  const updated = current.map(a => a.id === agencyId ? { ...a, status: 'DELETED' } : a);
  setLocalAgencies(updated);

  try {
    const { error } = await supabase.from('agencies').update({ status: 'DELETED' }).eq('id', agencyId);
    if (error) console.error('[agencyService] Delete agency error:', error.message);
  } catch (e) {}

  return { success: true };
}

/**
 * 6. Restore Agency from Deleted Agencies Archive
 */
export async function restoreAgency(agencyId) {
  const current = getLocalAgencies();
  const updated = current.map(a => a.id === agencyId ? { ...a, status: 'ACTIVE' } : a);
  setLocalAgencies(updated);

  try {
    const { error } = await supabase.from('agencies').update({ status: 'ACTIVE' }).eq('id', agencyId);
    if (error) console.error('[agencyService] Restore agency error:', error.message);
  } catch (e) {}

  return { success: true };
}
