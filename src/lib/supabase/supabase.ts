import { createClient } from '@supabase/supabase-js'
// This file is used to create a client for the Supabase database

// Grabs the URL and API key from the .env file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are properly configured
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseAnonKey
  })
  throw new Error('Supabase environment variables are not configured. Please check your .env.local file.')
}

// Creates the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey) 