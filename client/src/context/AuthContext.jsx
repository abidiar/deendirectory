import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

// Explicitly export AuthContext here
export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const session = supabase.auth.session();
    setUser(session?.user ?? null);
    setLoading(false);

    const subscription = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.data.unsubscribe(); // Correct unsubscribe method!
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      const { error } = await supabase.auth.signIn({ email, password });
      if (error) throw error;
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const signUp = async (email, password) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const value = {
    authError,
    signUp,
    signIn,
    signOut: () => supabase.auth.signOut(),
    user,
    setUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
