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
        <div className="container flex justify-between items-center mx-auto">
          <EnhancedLink to="/">DeenDirectory</EnhancedLink>
          <div className="flex items-center space-x-4">
            <button onClick={handleMobileMenuToggle} className="menu-button text-gray-500 md:hidden">
              {/* Mobile menu toggle icon */}
            </button>
            <div className="relative hidden md:block" ref={businessDropdownRef}>
              {/* Business dropdown menu for larger screens */}
            </div>
            {user ? (
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-600 hidden md:block">Sign Out</button>
            ) : (
              <EnhancedLink to="/user-sign-in" className="text-sm text-gray-500 hover:text-gray-600 hidden md:block">User Sign In/Up</EnhancedLink>
            )}
          </div>
          {isMobileMenuOpen && (
            <div className="fixed top-0 inset-x-0 p-2 transition transform origin-top-right z-50 md:hidden" ref={mobileMenuRef}>
              {/* Mobile menu items */}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
