
import { createClient } from '@supabase/supabase-js';

let supabaseUrl = '';
let supabaseAnonKey = '';

// Safely attempt to access Vite environment variables
// This check prevents "Cannot read properties of undefined (reading 'VITE_SUPABASE_URL')" errors
try {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    // @ts-ignore
    supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }
} catch (e) {
  // Ignore errors accessing import.meta
}

// Fallback to process.env for Node/Webpack/Sandboxes (e.g. Vercel builds or server-side rendering contexts)
if (!supabaseUrl || !supabaseAnonKey) {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env) {
      // @ts-ignore
      supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      // @ts-ignore
      supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
    }
  } catch (e) {
    // Ignore errors accessing process
  }
}

// Validate that anon key is not empty and not accidentally set to a URL
const isValidAnonKey = (key: string) => {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  // An anon key is a JWT string, never a URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    console.error("CONFIGURATION ERROR: Your VITE_SUPABASE_ANON_KEY is set to a URL instead of a JWT anon key. Please copy the anon public key from Supabase Project Settings -> API.");
    return false;
  }
  return trimmed.length > 20;
};

// Initialize the Supabase client only if valid credentials are available
export const supabase = (supabaseUrl && isValidAnonKey(supabaseAnonKey))
  ? createClient(supabaseUrl.trim(), supabaseAnonKey.trim())
  : null;

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => !!supabase;
