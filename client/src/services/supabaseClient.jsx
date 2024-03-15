// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // Supabase project URL from Vite environment variable
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY; // Supabase anon key from Vite environment variable

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Logging for debugging
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey);
console.log('Supabase Client Initialized:', supabase);
console.log('Supabase Client:', supabase);