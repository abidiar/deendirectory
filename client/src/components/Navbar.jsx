import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import EnhancedLink from './EnhancedLink';
import SearchBar from './SearchBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const Navbar = ({ onSearch, backendUrl }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState({ business: false, user: false });
  const dropdownRefs = {
    business: useRef(null),
    user: useRef(null),
  };

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
      Object.entries(dropdownRefs).forEach(([key, ref]) => {
        if (ref.current && !ref.current.contains(event.target)) {
          setIsDropdownOpen((prev) => ({ ...prev, [key]: false }));
        }
      });
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

  const toggleDropdown = (key) => {
    setIsDropdownOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const closeDropdown = (key) => {
    setIsDropdownOpen((prev) => ({ ...prev, [key]: false }));
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
            <div className="hidden md:flex space-x-4">
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('user')}
                  className="text-lg text-gray-600 hover:text-gray-800 flex items-center"
                >
                  For Users
                  <FontAwesomeIcon
                    icon={isDropdownOpen.user ? faChevronUp : faChevronDown}
                    className="ml-1"
                  />
                </button>
                {isDropdownOpen.user && (
                  <div className="absolute right-0 z-50 mt-2 py-2 w-48 bg-white rounded shadow-xl text-center" ref={dropdownRefs.user}>
                    {user ? (
                      <button onClick={handleLogout} className="block w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50">
                        Sign Out
                      </button>
                    ) : (
                      <>
                        <EnhancedLink
                          to="/user-sign-in"
                          className="block w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                          onClick={() => closeDropdown('user')}
                        >
                          User Sign In
                        </EnhancedLink>
                        <EnhancedLink
                          to="/user-sign-up"
                          className="block w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                          onClick={() => closeDropdown('user')}
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
                  onClick={() => toggleDropdown('business')}
                  className="text-lg text-gray-600 hover:text-gray-800 flex items-center"
                >
                  For Businesses
                  <FontAwesomeIcon
                    icon={isDropdownOpen.business ? faChevronUp : faChevronDown}
                    className="ml-1"
                  />
                </button>
                {isDropdownOpen.business && (
                  <div className="absolute right-0 z-50 mt-2 py-2 w-48 bg-white rounded shadow-xl text-center" ref={dropdownRefs.business}>
                    <EnhancedLink
                      to="/business-sign-in"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                      onClick={() => closeDropdown('business')}
                    >
                      Business Sign In
                    </EnhancedLink>
                    <EnhancedLink
                      to="/business-sign-up"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                      onClick={() => closeDropdown('business')}
                    >
                      Business Sign Up
                    </EnhancedLink>
                    <EnhancedLink
                      to="/claim-or-add-business"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                      onClick={() => closeDropdown('business')}
                    >
                      Claim or Add Your Business
                    </EnhancedLink>
                  </div>
                )}
              </div>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => toggleDropdown('mobile')}
                className="text-lg text-gray-600 hover:text-gray-800 flex items-center"
              >
                Menu
                <FontAwesomeIcon
                  icon={isDropdownOpen.mobile ? faChevronUp : faChevronDown}
                  className="ml-1"
                />
              </button>
            </div>
          </div>
        </div>
        {isDropdownOpen.mobile && (
          <div className="md:hidden px-4 pt-2 pb-4" ref={dropdownRefs.mobile}>
            <SearchBar onSearch={onSearch} backendUrl={backendUrl} />
            <div className="mt-4">
              <button
                onClick={() => toggleDropdown('user')}
                className="text-lg text-gray-600 hover:text-gray-800 flex items-center"
              >
                For Users
                <FontAwesomeIcon
                  icon={isDropdownOpen.user ? faChevronUp : faChevronDown}
                  className="ml-1"
                />
              </button>
              {isDropdownOpen.user && (
                <div className="mt-2 py-2 bg-white rounded shadow-xl text-center" ref={dropdownRefs.user}>
                  {user ? (
                    <button onClick={handleLogout} className="block w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50">
                      Sign Out
                    </button>
                  ) : (
                    <>
                      <EnhancedLink
                        to="/user-sign-in"
                        className="block w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        onClick={() => closeDropdown('user')}
                      >
                        User Sign In
                      </EnhancedLink>
                      <EnhancedLink
                        to="/user-sign-up"
                        className="block w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                        onClick={() => closeDropdown('user')}
                      >
                        User Sign Up
                      </EnhancedLink>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="mt-4">
              <button
                onClick={() => toggleDropdown('business')}
                className="text-lg text-gray-600 hover:text-gray-800 flex items-center"
              >
                For Businesses
                <FontAwesomeIcon
                  icon={isDropdownOpen.business ? faChevronUp : faChevronDown}
                  className="ml-1"
                />
              </button>
              {isDropdownOpen.business && (
                <div className="mt-2 py-2 bg-white rounded shadow-xl text-center" ref={dropdownRefs.business}>
                  <EnhancedLink
                    to="/business-sign-in"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    onClick={() => closeDropdown('business')}
                  >
                    Business Sign In
                  </EnhancedLink>
                  <EnhancedLink
                    to="/business-sign-up"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    onClick={() => closeDropdown('business')}
                  >
                    Business Sign Up
                  </EnhancedLink>
                  <EnhancedLink
                    to="/claim-or-add-business"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    onClick={() => closeDropdown('business')}
                  >
                    Claim or Add Your Business
                  </EnhancedLink>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;