// auth.js
import { supabase } from '../services/supabaseClient';

export const signUp = async (email, password) => {
  const { user, session, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return { user, session };
};

export const signIn = async (email, password) => {
  const { user, session, error } = await supabase.auth.signIn({
    email,
    password,
  });

  if (error) throw error;
  return { user, session };
};
