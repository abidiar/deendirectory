import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const businessDropdownRef = useRef(null);

  useEffect(() => {
    setUser(supabase.auth.session);
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session);
    });

    // Cleanup on unmount
    return () => {
      authListener.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(event.target)) {
        setIsBusinessDropdownOpen(false);
      }
    };
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  return (
    <header>
      <nav className="bg-white px-2 sm:px-4 py-2.5 rounded shadow">
        <div className="container flex justify-between items-center mx-auto">
          <Link to="/" className="text-lg font-semibold whitespace-nowrap">DeenDirectory</Link>
          <div className="flex items-center space-x-4">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-500 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>

            {/* Business dropdown */}
            <div className="relative" ref={businessDropdownRef}>
              <button onClick={() => setIsBusinessDropdownOpen(open => !open)} className="text-gray-500 hover:text-gray-600">
                For Businesses
              </button>
              {isBusinessDropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 py-2 w-48 bg-white rounded shadow-xl">
                  <Link to="/business-sign-in?mode=signin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Business Sign In</Link>
                  <Link to="/business-sign-in?mode=signup" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Business Sign Up</Link>
                  <Link to="/claim-business" className="block px-4 py-2 text-gray-800 hover:bg-gray-100">Claim Your Business</Link>
                </div>
              )}
            </div>

            {/* User sign in/up or sign out */}
            {user ? (
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-600">Sign Out</button>
            ) : (
              <Link to="/user-sign-in" className="text-sm text-gray-500 hover:text-gray-600">Sign In/Up</Link>
            )}
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <Link to="/user-sign-in" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign In/Up</Link>
              <Link to="/claim-business" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Claim Your Business</Link>
              {user && (
                <button onClick={handleLogout} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sign Out</button>
              )}
              {/* ...additional mobile menu items... */}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
