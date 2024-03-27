import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserSignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false); // Toggle between sign-in and sign-up
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
  
    try {
      const response = await fetch('/api/user/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          isSignUp: isSigningUp,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setAuthError(data.message || 'An error occurred');
      } else {
        // Navigate upon successful sign-in or sign-up
        navigate('/');
      }
    } catch (error) {
      console.error('Error during user authentication:', error);
      setAuthError('An error occurred');
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
