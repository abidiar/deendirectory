import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import EnhancedLink from './EnhancedLink';
import SearchBar from './SearchBar';

const Navbar = ({ onSearch, backendUrl }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const businessDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
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
      if (authListener && typeof authListener.unsubscribe === 'function') {
        authListener.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (businessDropdownRef.current && !businessDropdownRef.current.contains(event.target)) {
        setIsBusinessDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false);
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

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(prevState => !prevState);
  };

  const toggleBusinessDropdown = () => {
    setIsBusinessDropdownOpen(prevState => !prevState);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(prevState => !prevState);
  };

  return (
    <header className="relative z-20">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <EnhancedLink to="/" className="text-2xl font-bold text-gray-800">
              DeenDirectory
            </EnhancedLink>
            <div className="hidden md:block">
              <SearchBar onSearch={onSearch} backendUrl={backendUrl} />
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative" ref={businessDropdownRef}>
                <button
                  onClick={toggleBusinessDropdown}
                  className="text-gray-600 hover:text-gray-800 flex items-center text-lg"
                >
                  For Businesses
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </button>
                {isBusinessDropdownOpen && (
                  <div className="absolute right-0 z-50 mt-2 py-2 w-48 bg-white rounded shadow-xl">
                    <EnhancedLink to="/business-sign-in" className={location.pathname === '/business-sign-in' ? 'text-blue-500' : ''}>
                      Business Sign In
                    </EnhancedLink>
                    <EnhancedLink to="/business-sign-up" className={location.pathname === '/business-sign-up' ? 'text-blue-500' : ''}>
                      Business Sign Up
                    </EnhancedLink>
                    <EnhancedLink to="/claim-or-add-business" className={location.pathname === '/claim-or-add-business' ? 'text-blue-500' : ''}>
                      Claim or Add Your Business
                    </EnhancedLink>
                  </div>
                )}
              </div>
              {user ? (
                <button onClick={handleLogout} className="text-lg text-gray-600 hover:text-gray-800">
                  Sign Out
                </button>
              ) : (
                <>
                  <EnhancedLink to="/user-sign-in" className={`text-lg text-gray-600 hover:text-gray-800 ${location.pathname === '/user-sign-in' ? 'text-blue-500' : ''}`}>
                    User Sign In
                  </EnhancedLink>
                  <EnhancedLink to="/user-sign-up" className={`text-lg text-gray-600 hover:text-gray-800 ${location.pathname === '/user-sign-up' ? 'text-blue-500' : ''}`}>
                    User Sign Up
                  </EnhancedLink>
                </>
              )}
              <button
                onClick={handleMobileMenuToggle}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
                aria-label="Toggle menu"
              >
                <svg className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden" ref={mobileMenuRef}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={toggleUserDropdown}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                >
                  Users
                  <svg
                    className={`ml-1 w-4 h-4 inline-block transition-transform duration-200 ${
                      isUserDropdownOpen ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </button>
                {isUserDropdownOpen && (
                  <div className="mt-2 py-2 w-full bg-white rounded shadow-xl">
                    {user ? (
                      <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50">
                        Sign Out
                      </button>
                    ) : (
                      <>
                        <EnhancedLink
                          to="/user-sign-in"
                          className={`block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 ${location.pathname === '/user-sign-in' ? 'bg-gray-100' : ''}`}
                        >
                          User Sign In
                        </EnhancedLink>
                        <EnhancedLink
                          to="/user-sign-up"
                          className={`block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 ${location.pathname === '/user-sign-up' ? 'bg-gray-100' : ''}`}
                        >
                          User Sign Up
                        </EnhancedLink>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  onClick={toggleBusinessDropdown}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                >
                  For Businesses
                  <svg
                    className={`ml-1 w-4 h-4 inline-block transition-transform duration-200 ${
                      isBusinessDropdownOpen ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </button>
                {isBusinessDropdownOpen && (
                  <div className="mt-2 py-2 w-full bg-white rounded shadow-xl">
                    <EnhancedLink
                      to="/business-sign-in"
                      className={`block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 ${location.pathname === '/business-sign-in' ? 'bg-gray-100' : ''}`}
                    >
                      Business Sign In
                    </EnhancedLink>
                    <EnhancedLink
                      to="/business-sign-up"
                      className={`block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 ${location.pathname === '/business-sign-up' ? 'bg-gray-100' : ''}`}
                    >
                      Business Sign Up
                    </EnhancedLink>
                    <EnhancedLink
                      to="/claim-or-add-business"
                      className={`block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 ${location.pathname === '/claim-or-add-business' ? 'bg-gray-100' : ''}`}
                    >
                      Claim or Add Your Business
                    </EnhancedLink>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      <div className="w-full md:hidden mt-2 px-4">
        <SearchBar onSearch={onSearch} backendUrl={backendUrl} />
      </div>
    </header>
  );
};

export default Navbar;