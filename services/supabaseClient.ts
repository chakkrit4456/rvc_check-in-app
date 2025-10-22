import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wkyiathlmwllkjvdhgzt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndreWlhdGhsbXdsbGtqdmRoZ3p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTIwMjYsImV4cCI6MjA3NjYyODAyNn0.S4xuKW-iKJUa1EIbhyGZ00jtBvqhFhZYZ5AVb72rdfg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);