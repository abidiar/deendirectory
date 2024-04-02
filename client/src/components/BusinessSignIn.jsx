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
  const searchParams = new URLSearchParams(location.search);
  const isSignupMode = searchParams.get('mode') === 'signup';
  const [isSigningUp, setIsSigningUp] = useState(isSignupMode);

  useEffect(() => {
    setIsSigningUp(searchParams.get('mode') === 'signup');
  }, [location]);

  const handleInvalidUserType = async () => {
    setAuthError('Invalid user type. Please use the regular user sign-in page.');
    await supabase.auth.signOut();
    navigate('/user-sign-in'); // Redirect to regular sign-in page
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
          .from('business_profiles')
          .select('user_type')
          .eq('id', user.id)
          .single();

        if (profileResponse.error || !profileResponse.data || profileResponse.data.user_type !== 'business') {
          handleInvalidUserType();
          return;
        }

        if (isSigningUp) {
          console.log('Business user signed up successfully:', user);

          // Placeholder: Prompt user to complete their business profile.
          // For example, ask for business name, contact details, etc.
          // This data could be collected from a form in your application.
          const businessDetails = {
            business_name: "Placeholder Business Name", // Replace with actual data
            contact_info: "Placeholder Contact Info", // Replace with actual data
            services_offered: "Placeholder Services", // Replace with actual data
            // ... any other business-related information
          };

          const { data, error: insertError } = await supabase
            .from('business_profiles')
            .insert({
              ...businessDetails,
              id: user.id,
              email: user.email,
              user_type: 'business'
            });

          if (insertError) {
            console.error('Error inserting business user data:', insertError);
            setAuthError('An error occurred while creating the business account');
          } else {
            console.log('Business user data inserted successfully:', data);
            setAuthSuccess('Sign-up successful! Please check your email to verify your account.');
            setEmail('');
            setPassword('');
          }
        } else {
          setAuthSuccess('Sign-in successful! Redirecting...');
          setTimeout(() => {
            navigate('/dashboard/business');
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