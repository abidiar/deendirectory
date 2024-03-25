import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import EnhancedLink from './EnhancedLink';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
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
    const handleClickOutsideBusiness = (event) => {
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(event.target)) {
        setIsBusinessDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideBusiness);
    return () => document.removeEventListener('mousedown', handleClickOutsideBusiness);
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
        <div className="container flex justify-between items-center mx-auto">
          <EnhancedLink to="/" className="text-lg font-semibold whitespace-nowrap dark:text-white">DeenDirectory</EnhancedLink>
          <button onClick={handleMobileMenuToggle} className="menu-button text-gray-500 hover:text-gray-600 md:hidden">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-16 6h16"></path></svg>
          </button>
          <div className="hidden w-full md:block md:w-auto" ref={businessDropdownRef}>
              <button onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)} className="text-gray-500 hover:text-gray-600">
                  For Businesses
              </button>
              {isBusinessDropdownOpen && (
                <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded shadow-xl">
                    <EnhancedLink to="/business-sign-in?mode=signin">Business Sign In</EnhancedLink>
                    <EnhancedLink to="/business-sign-in?mode=signup">Business Sign Up</EnhancedLink>
                    <EnhancedLink to="/claim-business">Claim Your Business</EnhancedLink>
                </div>
              )}
              {user ? (
                <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-600">Sign Out</button>
              ) : (
                <EnhancedLink to="/user-sign-in">User Sign In/Up</EnhancedLink>
              )}
          </div>
        </div>
      </nav>
      {/* Mobile menu and backdrop here */}
    </header>
  );
};

export default Navbar;
