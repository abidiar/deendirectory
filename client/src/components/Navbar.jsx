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

    return () => {
      authListener.unsubscribe();
    };
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

  // Style for the 'For Businesses' button with hover effect
  const [businessButtonStyle, setBusinessButtonStyle] = useState({
    backgroundColor: 'transparent', // Default background
    color: '#233E8B', // Default text color
    padding: '8px 12px',
    borderRadius: '4px',
  });

  return (
    <header>
      <nav className="bg-white px-2 sm:px-4 py-2.5 rounded shadow">
        <div className="container flex justify-between items-center mx-auto">
          <EnhancedLink to="/">DeenDirectory</EnhancedLink>
          <div className="flex items-center space-x-4">
            <button onClick={handleMobileMenuToggle} className="menu-button text-gray-500 md:hidden">
              {/* SVG for mobile menu button */}
            </button>
            <div className="relative hidden md:block" ref={businessDropdownRef}>
              <button
                onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
                className="text-gray-500"
                style={businessButtonStyle}
                onMouseEnter={() => setBusinessButtonStyle({ ...businessButtonStyle, backgroundColor: '#f0f0f0', color: '#102A43' })}
                onMouseLeave={() => setBusinessButtonStyle({ ...businessButtonStyle, backgroundColor: 'transparent', color: '#233E8B' })}
              >
                For Businesses
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
              <EnhancedLink to="/user-sign-in">User Sign In/Up</EnhancedLink>
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
                <EnhancedLink to="/user-sign-in">User Sign In/Up</EnhancedLink>
                <EnhancedLink to="/business-sign-in">Business Sign In/Up</EnhancedLink>
                <EnhancedLink to="/claim-business">Claim Your Business</EnhancedLink>
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
