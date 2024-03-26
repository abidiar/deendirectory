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
          <EnhancedLink to="/" className="text-xl font-bold">DeenDirectory</EnhancedLink>
          <button onClick={handleMobileMenuToggle} className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded lg:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-16 6h16"></path></svg>
          </button>
          <div className="hidden w-full lg:block lg:w-auto" id="mobile-menu">
            <ul className="flex flex-col mt-4 lg:flex-row lg:space-x-8 lg:mt-0 lg:text-sm lg:font-medium">
              <li>
                <EnhancedLink to="/about" className="block py-2 pr-4 pl-3 text-gray-700 rounded lg:bg-transparent lg:p-0">About</EnhancedLink>
              </li>
              {/* More navigation items */}
              {user ? (
                <li>
                  <button onClick={handleLogout} className="block py-2 pr-4 pl-3 text-gray-700 rounded lg:bg-transparent lg:p-0 lg:hover:text-gray-900 hover:bg-gray-50 lg:hover:bg-transparent">Sign Out</button>
                </li>
              ) : (
                <li>
                  <EnhancedLink to="/user-sign-in" className="block py-2 pr-4 pl-3 text-gray-700 rounded lg:bg-transparent lg:p-0 lg:hover:text-gray-900 hover:bg-gray-50 lg:hover:bg-transparent">User Sign In/Up</EnhancedLink>
                </li>
              )}
            </ul>
          </div>
          {isMobileMenuOpen && (
            <div className="absolute top-0 right-0 z-50 w-full p-5 bg-white rounded-lg shadow-lg lg:hidden" ref={mobileMenuRef}>
              <button onClick={handleMobileMenuToggle} className="absolute top-0 right-0 mt-4 mr-4">
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <ul className="space-y-4">
                <li><EnhancedLink to="/user-sign-in">User Sign In/Up</EnhancedLink></li>
                <li><EnhancedLink to="/business-sign-in">Business Sign In/Up</EnhancedLink></li>
                <li><EnhancedLink to="/claim-business">Claim Your Business</EnhancedLink></li>
                {/* Additional mobile menu items */}
                {user
&& (
<li><button onClick={handleLogout}>Sign Out</button></li>
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