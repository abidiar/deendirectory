import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import EnhancedLink from './EnhancedLink';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const businessDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    setUser(supabase.auth.session);
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session);
    });

    return () => authListener.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(event.target)) {
        setIsBusinessDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  const handleMobileMenuToggle = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header>
      <nav className="bg-white px-2 sm:px-4 py-2.5 rounded shadow">
        <div className="container flex flex-wrap justify-between items-center mx-auto">
          <EnhancedLink to="/" className="text-xl font-bold">DeenDirectory</EnhancedLink>
          <button onClick={handleMobileMenuToggle} className="menu-button text-gray-500 md:hidden">
            {/* Mobile menu toggle icon */}
          </button>
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative" ref={businessDropdownRef}>
              <button
                onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
                className="text-gray-500 hover:text-gray-600 flex items-center"
              >
                For Businesses {/* Dropdown Icon */}
              </button>
              {isBusinessDropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 py-2 w-48 bg-white rounded shadow-xl">
                  <EnhancedLink to="/business-sign-in?mode=signin">Business Sign In</EnhancedLink>
                  <EnhancedLink to="/business-sign-in?mode=signup">Business Sign Up</EnhancedLink>
                  <EnhancedLink to="/claim-business">Claim Your Business</EnhancedLink>
                </div>
              )}
            </div>
            {user ? (
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-600">Sign Out</button>
            ) : (
              <EnhancedLink to="/user-sign-in" className="text-sm text-gray-500 hover:text-gray-600 hidden md:block">User Sign In/Up</EnhancedLink>
            )}
          </div>
          {isMobileMenuOpen && (
            <div className="absolute top-0 right-0 z-50 w-full p-5 bg-white rounded-lg shadow-lg lg:hidden" ref={mobileMenuRef}>
              <button onClick={handleMobileMenuToggle} className="absolute top-0 right-0 mt-4 mr-4">
                {/* Close icon */}
              </button>
              <ul className="space-y-4">
                {/* Conditional rendering for authenticated users */}
                {user ? (
                  <li>
                    <button onClick={handleLogout}>Sign Out</button>
                  </li>
                ) : (
                  <>
                    <li><EnhancedLink to="/user-sign-in">User Sign In/Up</EnhancedLink></li>
                    <li><EnhancedLink to="/business-sign-in">Business Sign In/Up</EnhancedLink></li>
                    <li><EnhancedLink to="/claim-business">Claim Your Business</EnhancedLink></li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
