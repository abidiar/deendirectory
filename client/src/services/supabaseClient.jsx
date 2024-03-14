// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // Supabase project URL from Vite environment variable
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY; // Supabase anon key from Vite environment variable

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
