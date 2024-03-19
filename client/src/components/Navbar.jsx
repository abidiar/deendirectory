import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient'; // Adjust the path as necessary

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setSession(supabase.auth.session);
    setLoadingSession(false);
    
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
    });
    
    return () => {
    if (subscription) subscription.unsubscribe();
    };
    }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setIsMenuOpen(false); // Close the menu if sign-out was successful
    } else {
      console.error('Sign-out error:', error.message);
      // Optionally, inform the user of the error
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header>
      <nav className="bg-white px-2 sm:px-4 py-2.5 shadow-md">
        <div className="container flex flex-wrap justify-between items-center mx-auto">
          <Link to="/" className="flex items-center">
            <span className="self-center text-lg font-semibold whitespace-nowrap dark:text-white">DeenDirectory</span>
          </Link>
          <button onClick={toggleMenu} data-collapse-toggle="mobile-menu" type="button" className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200" aria-controls="mobile-menu" aria-expanded={isMenuOpen} aria-label="Toggle navigation">
            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
          <div className={`${isMenuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`} id="mobile-menu">
            <ul className="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
              {user ? (
                <>
                  <li>
                    <Link to="/add-service" onClick={() => setIsMenuOpen(false)} className="block py-2 pr-4 pl-3 text-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0">Add Business/Service</Link>
                  </li>
                  <li>
                    <button onClick={handleSignOut} className="py-2 pr-4 pl-3 text-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0">Sign Out</button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/user-sign-in" onClick={() => setIsMenuOpen(false)} className="block py-2 pr-4 pl-3 text-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0">Sign In/Up (Users)</Link>
                  </li>
                  <li>
                    <Link to="/business-sign-in" onClick={() => setIsMenuOpen(false)} className="block py-2 pr-4 pl-3 text-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0">Sign In/Up (Businesses)</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
