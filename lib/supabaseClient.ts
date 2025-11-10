import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Extend the Window interface to expect our config
declare global {
  interface Window {
    APP_CONFIG: {
      supabaseUrl: string;
      supabaseAnonKey: string;
    }
  }
}

const supabaseUrl = window.APP_CONFIG?.supabaseUrl;
const supabaseAnonKey = window.APP_CONFIG?.supabaseAnonKey;

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
} else {
    // This case will be handled gracefully in App.tsx
    console.error("Supabase config not found. The app may have failed to initialize.");
}

export const supabase = supabaseInstance;