import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

function DashboardComponent() {
  const navigate = useNavigate();

  // This function handles the sign-out process directly with Supabase
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      // Redirect the user to the homepage after sign out
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>
      {/* Here we display a generic welcome message as we're not fetching the user info from the context */}
      <p>Welcome to the Dashboard!</p>
      {/* Other dashboard content goes here */}
      <button
        onClick={handleSignOut}
        className="mt-4 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Sign Out
      </button>
    </div>
  );
}

export default DashboardComponent;