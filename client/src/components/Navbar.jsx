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
  const businessDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

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
              {/* Business Dropdown for regular screens */}
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
              {/* User Dropdown for regular screens */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={toggleUserDropdown}
                  className={`text-lg text-gray-600 hover:text-gray-800 ${isUserDropdownOpen ? 'text-blue-500' : ''}`}
                >
                  For Users
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 20 20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </button>
                {isUserDropdownOpen && (
                  <div className="absolute right-0 z-50 mt-2 py-2 w-48 bg-white rounded shadow-xl">
                    <EnhancedLink to="/user-sign-in" className={`block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 ${location.pathname === '/user-sign-in' ? 'bg-gray-100' : ''}`}>
                      User Sign In
                    </EnhancedLink>
                    <EnhancedLink to="/user-sign-up" className={`block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 ${location.pathname === '/user-sign-up' ? 'bg-gray-100' : ''}`}>
                      User Sign Up
                    </EnhancedLink>
                  </div>
                )}
              </div>
              {/* Conditionally render Sign Out or User Sign In/Up based on auth state */}
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
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
