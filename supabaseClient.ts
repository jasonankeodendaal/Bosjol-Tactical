
import { createClient } from '@supabase/supabase-js';

let supabaseUrl = '';
let supabaseAnonKey = '';

// Safely attempt to access Vite environment variables
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

// Fallback to process.env for Node/Webpack/Sandboxes
if (!supabaseUrl || !supabaseAnonKey) {
  try {
    if (typeof process !== 'undefined' && process.env) {
      supabaseUrl = process.env.VITE_SUPABASE_URL || '';
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
