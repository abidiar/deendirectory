// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Make sure these are the correct environment variable keys
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_KEY;

// Check if the environment variables are not undefined
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are not set or undefined.');
} else {
  console.log('Supabase URL:', supabaseUrl); // For debugging purposes only; remove in production
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
