import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  const handleLinkClick = useCallback((route) => {
    console.log(`Link clicked for route: ${route}`);
    closeDropdown('user');
    closeDropdown('business');
  }, []);

  const handleLogout = async () => {
    console.log('Logout button clicked');
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  const toggleDropdown = (key) => {
    console.log(`Toggling dropdown: ${key}`);
    setIsDropdownOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const closeDropdown = (key) => {
    console.log(`Closing dropdown: ${key}`);
    setIsDropdownOpen((prev) => ({ ...prev, [key]: false }));
  };

  return (
    <header className="relative z-20">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <EnhancedLink to="/" className="text-2xl font-bold text-primary-dark">
              DeenDirectory
            </EnhancedLink>
            <div className="hidden lg:block">
              <SearchBar onSearch={onSearch} backendUrl={backendUrl} />
            </div>
            <div className="hidden lg:flex space-x-8">
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('user')}
                  className="text-lg text-gray-600 hover:text-primary-dark flex items-center focus:outline-none"
                  aria-expanded={isDropdownOpen.user}
                  aria-haspopup="true"
                >
                  For Users
                  <FontAwesomeIcon
                    icon={isDropdownOpen.user ? faChevronUp : faChevronDown}
                    className="ml-1"
                  />
                </button>
                {isDropdownOpen.user && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                    ref={dropdownRefs.user}
                  >
                    {user ? (
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                        role="menuitem"
                      >
                        Sign Out
                      </button>
                    ) : (
                      <>
                        <EnhancedLink
                          to="/user-sign-in"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                          role="menuitem"
                          onClick={() => handleLinkClick('/user-sign-in')}
                        >
                          User Sign In
                        </EnhancedLink>
                        <EnhancedLink
                          to="/user-sign-up"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                          role="menuitem"
                          onClick={() => handleLinkClick('/user-sign-up')}
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
                  className="text-lg text-gray-600 hover:text-primary-dark flex items-center focus:outline-none"
                  aria-expanded={isDropdownOpen.business}
                  aria-haspopup="true"
                >
                  For Businesses
                  <FontAwesomeIcon
                    icon={isDropdownOpen.business ? faChevronUp : faChevronDown}
                    className="ml-1"
                  />
                </button>
                {isDropdownOpen.business && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="business-menu"
                    ref={dropdownRefs.business}
                  >
                    <EnhancedLink
                      to="/business-sign-in"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                      role="menuitem"
                      onClick={() => handleLinkClick('/business-sign-in')}
                    >
                      Business Sign In
                    </EnhancedLink>
                    <EnhancedLink
                      to="/business-sign-up"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                      role="menuitem"
                      onClick={() => handleLinkClick('/business-sign-up')}
                    >
                      Business Sign Up
                    </EnhancedLink>
                    <EnhancedLink
                      to="/claim-or-add-business"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                      role="menuitem"
                      onClick={() => handleLinkClick('/claim-or-add-business')}
                    >
                      Claim or Add Your Business
                    </EnhancedLink>
                  </div>
                )}
              </div>
            </div>
            <div className="lg:hidden">
              {/* Mobile menu button */}
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded={isDropdownOpen.user || isDropdownOpen.business}
                onClick={() => {
                  console.log('Mobile menu button clicked');
                  setIsDropdownOpen((prev) => ({
                    user: !prev.user,
                    business: !prev.business,
                  }));
                }}
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon when menu is closed. */}
                <svg
                  className={`${
                    isDropdownOpen.user || isDropdownOpen.business ? 'hidden' : 'block'
                  } h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                {/* Icon when menu is open. */}
                <svg
                  className={`${
                    isDropdownOpen.user || isDropdownOpen.business ? 'block' : 'hidden'
                  } h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state. */}
        <div
          className={`${
            isDropdownOpen.user || isDropdownOpen.business ? 'block' : 'hidden'
          } lg:hidden`}
          id="mobile-menu"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="relative">
              <button
                onClick={() => toggleDropdown('user')}
                className="text-lg text-gray-600 hover:text-primary-dark flex items-center focus:outline-none w-full text-left px-4 py-2"
                aria-expanded={isDropdownOpen.user}
                aria-haspopup="true"
              >
                For Users
                <FontAwesomeIcon
                  icon={isDropdownOpen.user ? faChevronUp : faChevronDown}
                  className="ml-1"
                />
              </button>
              {isDropdownOpen.user && (
                <div
                  className="mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-mobile"
                  ref={dropdownRefs.user}
                >
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                      role="menuitem"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <>
                      <EnhancedLink
                        to="/user-sign-in"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                        role="menuitem"
                        onClick={() => handleLinkClick('/user-sign-in')}
                      >
                        User Sign In
                      </EnhancedLink>
                      <EnhancedLink
                        to="/user-sign-up"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                        role="menuitem"
                        onClick={() => handleLinkClick('/user-sign-up')}
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
                className="text-lg text-gray-600 hover:text-primary-dark flex items-center focus:outline-none w-full text-left px-4 py-2"
                aria-expanded={isDropdownOpen.business}
                aria-haspopup="true"
              >
                For Businesses
                <FontAwesomeIcon
                  icon={isDropdownOpen.business ? faChevronUp : faChevronDown}
                  className="ml-1"
                />
              </button>
              {isDropdownOpen.business && (
                <div
                  className="mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="business-menu-mobile"
                  ref={dropdownRefs.business}
                >
                  <EnhancedLink
                    to="/business-sign-in"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                    role="menuitem"
                    onClick={() => handleLinkClick('/business-sign-in')}
                  >
                    Business Sign In
                  </EnhancedLink>
                  <EnhancedLink
                    to="/business-sign-up"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                    role="menuitem"
                    onClick={() => handleLinkClick('/business-sign-up')}
                  >
                    Business Sign Up
                  </EnhancedLink>
                  <EnhancedLink
                    to="/claim-or-add-business"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none"
                    role="menuitem"
                    onClick={() => handleLinkClick('/claim-or-add-business')}
                  >
                    Claim or Add Your Business
                  </EnhancedLink>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      <div className="w-full lg:hidden mt-2 px-4">
        <SearchBar onSearch={onSearch} backendUrl={backendUrl} />
      </div>
    </header>
  );
};

export default Navbar;