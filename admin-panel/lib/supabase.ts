import { createClient } from '@supabase/supabase-js'

// Use environment variables for Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// NOTE: It is highly recommended to generate TypeScript types automatically from your database schema.
// See https://supabase.com/docs/guides/database/misc/generating-types for instructions.
// The old, manually-defined types have been removed to prevent inconsistencies.

export const supabase = createClient(supabaseUrl, supabaseAnonKey);