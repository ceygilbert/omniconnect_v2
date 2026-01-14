
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const URL_KEY = 'omni_supabase_url';
const ANON_KEY = 'omni_supabase_anon_key';

let cachedClient: SupabaseClient | null = null;

export const getSupabaseConfig = () => {
  return {
    url: process.env.SUPABASE_URL || localStorage.getItem(URL_KEY) || '',
    anonKey: process.env.SUPABASE_ANON_KEY || localStorage.getItem(ANON_KEY) || ''
  };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  localStorage.setItem(URL_KEY, url);
  localStorage.setItem(ANON_KEY, anonKey);
  cachedClient = null; // Reset cache so next getSupabase() creates a new client
};

export const isSupabaseConfigured = () => {
  const { url, anonKey } = getSupabaseConfig();
  return !!(url && anonKey);
};

export const getSupabase = (): SupabaseClient => {
  if (cachedClient) return cachedClient;

  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey) {
    throw new Error("Supabase is not configured. Please provide your URL and Anon Key.");
  }

  cachedClient = createClient(url, anonKey);
  return cachedClient;
};

// For legacy compatibility where 'supabase' was exported as a constant
// This will throw the specific error the user encountered IF they haven't configured it yet.
// However, our App.tsx will now check isSupabaseConfigured() first.
export const supabase = (function() {
  try {
    return getSupabase();
  } catch (e) {
    // Return a dummy proxy to avoid immediate crash on import
    return new Proxy({} as any, {
      get: () => {
        throw new Error("Supabase is not configured. Use getSupabase() after ensuring configuration.");
      }
    });
  }
})();
