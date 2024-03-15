// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Access environment variables using import.meta.env and the correct keys set in Render
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

// Check if the environment variables are not undefined
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are not set or undefined.');
  // You might want to handle this error more gracefully in a production environment
} else {
  console.log('Supabase URL:', supabaseUrl); // For debugging purposes only; remove in production
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);