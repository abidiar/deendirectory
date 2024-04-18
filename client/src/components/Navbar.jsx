import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import EnhancedLink from './EnhancedLink';
import SearchBar from './SearchBar';

const Navbar = ({ onSearch, backendUrl }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
            <div className="hidden md:flex items-center space-x-4">
              <EnhancedLink to="/business-sign-in" className="text-gray-600 hover:text-gray-800 text-lg">
                Business Sign In
              </EnhancedLink>
              <EnhancedLink to="/business-sign-up" className="text-gray-600 hover:text-gray-800 text-lg">
                Business Sign Up
              </EnhancedLink>
              <EnhancedLink to="/claim-or-add-business" className="text-gray-600 hover:text-gray-800 text-lg">
                Claim or Add Your Business
              </EnhancedLink>
              {user ? (
                <button onClick={handleLogout} className="text-lg text-gray-600 hover:text-gray-800">
                  Sign Out
                </button>
              ) : (
                <>
                  <EnhancedLink to="/user-sign-in" className="text-lg text-gray-600 hover:text-gray-800">
                    User Sign In
                  </EnhancedLink>
                  <EnhancedLink to="/user-sign-up" className="text-lg text-gray-600 hover:text-gray-800">
                    User Sign Up
                  </EnhancedLink>
                </>
              )}
            </div>
            <button
              onClick={handleMobileMenuToggle}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
              aria-label="Toggle menu"
            >
              <svg className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              <svg className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden" ref={mobileMenuRef}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {user ? (
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50">
                  Sign Out
                </button>
              ) : (
                <>
                  <EnhancedLink
                    to="/user-sign-in"
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 ${location.pathname === '/user-sign-in' ? 'bg-gray-100' : ''}`}
                  >
                    User Sign In
                  </EnhancedLink>
                  <EnhancedLink
                    to="/user-sign-up"
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 ${location.pathname === '/user-sign-up' ? 'bg-gray-100' : ''}`}
                  >
                    User Sign Up
                  </EnhancedLink>
                </>
              )}
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <span className="text-base font-medium text-gray-800">For Businesses</span>
                  </div>
                  <div className="ml-auto">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <EnhancedLink
                    to="/business-sign-in"
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 ${location.pathname === '/business-sign-in' ? 'bg-gray-100' : ''}`}
                  >
                    Business Sign In
                  </EnhancedLink>
                  <EnhancedLink
                    to="/business-sign-up"
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 ${location.pathname === '/business-sign-up' ? 'bg-gray-100' : ''}`}
                  >
                    Business Sign Up
                  </EnhancedLink>
                  <EnhancedLink
                    to="/claim-or-add-business"
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 ${location.pathname === '/claim-or-add-business' ? 'bg-gray-100' : ''}`}
                  >
                    Claim or Add Your Business
                  </EnhancedLink>
                </div>
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