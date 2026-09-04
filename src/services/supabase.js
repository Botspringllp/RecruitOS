import { createClient } from '@supabase/supabase-js';

// Retrieve Vite / Node Environment Variables safely
export const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL)
  ? import.meta.env.VITE_SUPABASE_URL
  : 'https://qcjabkrksncevuljzwnl.supabase.co';

export const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY)
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjamFia3Jrc25jZXZ1bGp6d25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxOTc4MDMsImV4cCI6MjEwMzc3MzgwM30.HVlzjJ_3JUia-QSJr05C-osTCBiAR448XAqWCZOOq1A';

// Initialize Supabase Client with real auth session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * Health Check Service: On app load, test select from jobs table in Supabase
 */
export async function checkSupabaseHealth() {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id')
      .limit(1);

    if (error) {
      return { healthy: false, error: `Supabase DB Error: ${error.message}` };
    }

    return { healthy: true, error: null, count: data ? data.length : 0 };
  } catch (err) {
    return { healthy: false, error: `Supabase Health Check Error: ${err.message}` };
  }
}
