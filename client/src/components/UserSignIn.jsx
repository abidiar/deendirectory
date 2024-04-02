import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const UserSignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const navigate = useNavigate();

  const handleInvalidUserType = async () => {
    setAuthError('Invalid user type. Please use the business sign-in page.');
    await supabase.auth.signOut();
    navigate('/business-sign-in'); // Redirect to business sign-in page
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      const { user, error } = isSigningUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setAuthError(error.message);
        return;
      }

      if (user && user.id) {
        const profileResponse = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (profileResponse.error || !profileResponse.data || profileResponse.data.user_type !== 'regular') {
          handleInvalidUserType();
          return;
        }

        if (isSigningUp) {
          console.log('User signed up successfully:', user);

          // For a regular user, you might ask for less information than a business user.
          const userDetails = {
            full_name: "Placeholder User Name", // Replace with actual data collected from sign-up form
            // ... any other user-related information
          };

          const { data, error: insertError } = await supabase
            .from('profiles')
            .insert({
              ...userDetails,
              id: user.id,
              email: user.email,
              user_type: 'regular'
            });

          if (insertError) {
            console.error('Error inserting user data:', insertError);
            setAuthError('An error occurred while creating the user account');
          } else {
            console.log('User data inserted successfully:', data);
            setAuthSuccess('Sign-up successful! Please check your email to verify your account.');
            setEmail('');
            setPassword('');
          }
        } else {
          setAuthSuccess('Sign-in successful! Redirecting...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      setAuthError('An error occurred during authentication');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white rounded-lg shadow-md p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSigningUp ? 'User Sign Up' : 'User Sign In'}
          </h2>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          />
          <input
            type="password"
            id="password"
            name="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
          />
          {authError && <div className="text-red-500 text-sm text-center">{authError}</div>}
          {authSuccess && <div className="text-green-500 text-sm text-center">{authSuccess}</div>}
          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSigningUp ? 'Sign Up' : 'Sign In'}
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSigningUp(!isSigningUp)}
              className="text-indigo-600 hover:text-indigo-900 text-sm"
            >
              {isSigningUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserSignIn;