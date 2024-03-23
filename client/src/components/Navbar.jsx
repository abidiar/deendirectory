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
    const handleClickOutsideBusiness = (event) => {
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(event.target)) {
        setIsBusinessDropdownOpen(false);
      }
    };
    const handleClickOutsideMobileMenu = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideBusiness);
    document.addEventListener('mousedown', handleClickOutsideMobileMenu);

    return () => {
      document.removeEventListener('mousedown', handleClickOutsideBusiness);
      document.removeEventListener('mousedown', handleClickOutsideMobileMenu);
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
        <div className="container flex justify-between items-center mx-auto">
          <EnhancedLink to="/" className="text-base">DeenDirectory</EnhancedLink>
          <div className="flex items-center space-x-4">
            <button onClick={handleMobileMenuToggle} className="menu-button text-gray-500 md:hidden text-base">
              {/* SVG for mobile menu button */}
            </button>
            <div className="relative hidden md:block" ref={businessDropdownRef}>
              <button
                onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
                className="text-gray-500 hover:text-gray-600 flex items-center text-base"
              >
                For Businesses
                <svg className={`w-4 h-4 ml-2 transition-transform duration-200 ${isBusinessDropdownOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              {isBusinessDropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 py-2 w-48 bg-white rounded shadow-xl">
                  <EnhancedLink to="/business-sign-in?mode=signin" className="text-base">Business Sign In</EnhancedLink>
                  <EnhancedLink to="/business-sign-in?mode=signup" className="text-base">Business Sign Up</EnhancedLink>
                  <EnhancedLink to="/claim-business" className="text-base">Claim Your Business</EnhancedLink>
                </div>
              )}
            </div>
            {user ? (
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-600 text-base">Sign Out</button>
            ) : (
              <EnhancedLink to="/user-sign-in" className="text-base">User Sign In/Up</EnhancedLink>
            )}
          </div>
          <div className={`fixed top-0 inset-x-0 p-2 transition transform origin-top-right z-50 ${isMobileMenuOpen ? 'block' : 'hidden'}`} ref={mobileMenuRef}>
            <div className="rounded-lg shadow-md bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
              <div className="px-5 pt-4 flex items-center justify-between">
                <div className="-mr-2">
                  <button onClick={handleMobileMenuToggle} className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Close main menu</span>
                    {/* SVG for closing mobile menu */}
                  </button>
                </div>
              </div>
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <EnhancedLink to="/user-sign-in" className="text-base">User Sign In/Up</EnhancedLink>
                <EnhancedLink to="/business-sign-in" className="text-base">Business Sign In/Up</EnhancedLink>
                <EnhancedLink to="/claim-business" className="text-base">Claim Your Business</EnhancedLink>
                {/* Additional mobile menu items */}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
