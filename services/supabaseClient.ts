import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Platform } from 'react-native';

// Use environment variables for Supabase credentials
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const errorMessage = `
⚠️ Supabase environment variables are not set!

Please create a .env file in the root directory with:
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

Get these values from: https://app.supabase.com → Your Project → Settings → API
  `;
  console.error(errorMessage);
  
  // For web platform, show alert
  if (Platform.OS === 'web') {
    alert('Supabase environment variables are not set. Please check your .env file.\n\nSee console for details.');
  }
}

// Create Supabase client only if we have valid credentials
// Use a dummy client with empty strings as fallback to prevent crashes
let supabase: SupabaseClient;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} else {
  // Create a dummy client to prevent crashes, but it won't work
  // This allows the app to load but will fail on actual API calls
  console.warn('⚠️ Using dummy Supabase client. Please set environment variables.');
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export { supabase };