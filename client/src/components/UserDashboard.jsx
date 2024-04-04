import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

function UserDashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email);

        // Fetch the user profile details based on the user's email
        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('email', user.email)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error.message);
        } else {
          setUserName(userProfile.name);
        }
      } else {
        // If no user is found, redirect to the sign-in page
        navigate('/user-sign-in');
      }
    };

    fetchUserDetails();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      navigate('/'); // Redirect to the home page or any other appropriate page
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4">
      <header className="w-full max-w-7xl mx-auto py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto mt-8">
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome, {userName || 'user'}!</h2>
          <p>Email: {email}</p>
        </section>

        {/* Add more sections for user-specific features */}
        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Saved Services</h2>
          {/* Add functionality to display and manage saved services */}
        </section>

        <section className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Booking History</h2>
          {/* Add functionality to display and manage booking history */}
        </section>

        {/* ... */}
      </main>

      <footer className="w-full max-w-7xl mx-auto py-6 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} DeenDirectory. All rights reserved.
      </footer>
    </div>
  );
}

export default UserDashboard;