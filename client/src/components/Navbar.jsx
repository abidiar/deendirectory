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

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(prevState => !prevState);
  };
  
  return (
    <header>
      <nav className="bg-gray-100 px-4 py-3 shadow">
        <div className="container flex items-center justify-between mx-auto">
          <EnhancedLink to="/" className="text-2xl font-bold text-gray-800 hover:text-gray-600">
            DeenDirectory
          </EnhancedLink>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex flex-grow justify-center">
              <SearchBar onSearch={onSearch} backendUrl={backendUrl} />
            </div>
            <div className="relative" ref={businessDropdownRef}>
              <button
                onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)}
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
                  <EnhancedLink to="/claim-business" className={location.pathname === '/claim-business' ? 'text-blue-500' : ''}>
                    Claim Your Business
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
            <button onClick={handleMobileMenuToggle} className="md:hidden text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4">
            <SearchBar onSearch={onSearch} backendUrl={backendUrl} />
          </div>
        )}
      </nav>
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg p-4" ref={mobileMenuRef}>
          <ul className="space-y-4">
            {user ? (
              <li>
                <button onClick={handleLogout} className="text-lg text-gray-600 hover:text-gray-800">
                  Sign Out
                </button>
              </li>
            ) : (
              <>
                <li>
                  <EnhancedLink to="/user-sign-in" className="text-lg text-gray-600 hover:text-gray-800">
                    User Sign In
                  </EnhancedLink>
                </li>
                <li>
                  <EnhancedLink to="/user-sign-up" className="text-lg text-gray-600 hover:text-gray-800">
                    User Sign Up
                  </EnhancedLink>
                </li>
                <li>
                  <EnhancedLink to="/business-sign-in" className="text-lg text-gray-600 hover:text-gray-800">
                    Business Sign In
                  </EnhancedLink>
                </li>
                <li>
                  <EnhancedLink to="/business-sign-up" className="text-lg text-gray-600 hover:text-gray-800">
                    Business Sign Up
                  </EnhancedLink>
                </li>
                <li>
                  <EnhancedLink to="/claim-business" className="text-lg text-gray-600 hover:text-gray-800">
                    Claim Your Business
                  </EnhancedLink>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;