
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

// Initialize the Supabase client only if credentials are available
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => !!supabase;
