import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import EnhancedLink from './EnhancedLink';
import SearchBar from './SearchBar';

const Navbar = ({ onSearch, backendUrl }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const businessDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      const session = await supabase.auth.getSession();
      setUser(session?.data?.user ?? null);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener?.unsubscribe();
    };
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
          <EnhancedLink to="/" className="text-xl font-bold">
            DeenDirectory
          </EnhancedLink>
          <div className="flex-grow md:ml-4">
            <SearchBar onSearch={onSearch} backendUrl={backendUrl} />
          </div>
          <button onClick={handleMobileMenuToggle} className="menu-button text-gray-500 md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative" ref={businessDropdownRef}>
              <button
                onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
                className="text-gray-500 hover:text-gray-600 flex items-center"
              >
                For Businesses
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </button>
              {isBusinessDropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 py-2 w-48 bg-white rounded shadow-xl">
                  <EnhancedLink to="/business-sign-in">Business Sign In</EnhancedLink>
                  <EnhancedLink to="/business-sign-up">Business Sign Up</EnhancedLink>
                  <EnhancedLink to="/claim-business">Claim Your Business</EnhancedLink>
                </div>
              )}
            </div>
            {user ? (
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-600">
                Sign Out
              </button>
            ) : (
              <>
                <EnhancedLink to="/user-sign-in" className="text-sm text-gray-500 hover:text-gray-600">
                  User Sign In
                </EnhancedLink>
                <EnhancedLink to="/user-sign-up" className="text-sm text-gray-500 hover:text-gray-600">
                  User Sign Up
                </EnhancedLink>
              </>
            )}
          </div>
          {isMobileMenuOpen && (
            <div className="absolute top-0 right-0 z-50 w-full p-5 bg-white rounded-lg shadow-lg lg:hidden" ref={mobileMenuRef}>
              <button onClick={handleMobileMenuToggle} className="absolute top-0 right-0 mt-4 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <ul className="space-y-4">
                {user ? (
                  <li>
                    <button onClick={handleLogout}>Sign Out</button>
                  </li>
                ) : (
                  <>
                    <li>
                      <EnhancedLink to="/user-sign-in">User Sign In</EnhancedLink>
                    </li>
                    <li>
                      <EnhancedLink to="/user-sign-up">User Sign Up</EnhancedLink>
                    </li>
                    <li>
                      <EnhancedLink to="/business-sign-in">Business Sign In</EnhancedLink>
                    </li>
                    <li>
                      <EnhancedLink to="/business-sign-up">Business Sign Up</EnhancedLink>
                    </li>
                    <li>
                      <EnhancedLink to="/claim-business">Claim Your Business</EnhancedLink>
                    </li>
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