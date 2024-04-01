import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const BusinessSignIn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Determine mode from URL query parameters
  const searchParams = new URLSearchParams(location.search);
  const isSignupMode = searchParams.get('mode') === 'signup';

  // Set the initial mode based on query parameter
  const [isSigningUp, setIsSigningUp] = useState(isSignupMode);

  useEffect(() => {
    // Update the mode if the URL changes
    setIsSigningUp(searchParams.get('mode') === 'signup');
  }, [location, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    try {
      if (isSigningUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          console.error('Error during sign-up:', error);
          setAuthError(error.message);
        } else {
          console.log('Business user signed up successfully:', data);

          if (data && data.user && data.user.id) {
            // Insert the business user data into the "business_profiles" table
            const { data: insertData, error: insertError } = await supabase
              .from('business_profiles')
              .insert({ id: data.user.id, email: data.user.email, user_type: 'business' });

            if (insertError) {
              console.error('Error inserting business user data:', insertError);
              setAuthError('An error occurred while creating the business account');
            } else {
              console.log('Business user data inserted successfully:', insertData);
              setAuthSuccess('Sign-up successful! Please check your email to verify your account.');
              // Reset form fields
              setEmail('');
              setPassword('');
            }
          } else {
            console.error('Business user data not available after sign-up');
            setAuthError('An error occurred while creating the business account');
          }
        }
      } else {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setAuthError(signInError.message);
        } else {
          // Retrieve the user type from the business_profiles table
          const { data: profileData, error: profileError } = await supabase
            .from('business_profiles')
            .select('user_type')
            .eq('id', signInData.user.id)
            .single();

          if (profileError) {
            console.error('Error retrieving user type:', profileError);
            setAuthError('An error occurred while retrieving user type');
          } else {
            const userType = profileData.user_type;

            if (userType === 'business') {
              setAuthSuccess('Sign-in successful! Redirecting...');
              // Redirect to the business dashboard
              setTimeout(() => {
                navigate('/dashboard');
              }, 1500);
            } else {
              setAuthError('Invalid user type. Please use the regular user sign-in page.');
            }
          }
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
            {isSigningUp ? 'Business Sign Up' : 'Business Sign In'}
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
              onClick={() => {
                setIsSigningUp(!isSigningUp);
                navigate(`/business-sign-in?mode=${!isSigningUp ? 'signup' : 'signin'}`);
              }}
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

export default BusinessSignIn;