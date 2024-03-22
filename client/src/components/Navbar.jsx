import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const businessDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    setUser(supabase.auth.session());
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

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen((prevState) => !prevState);
  };

  const hoverColor = '#233E8B'; // Your primary color from the Tailwind config

  return (
    <header>
      <nav className="bg-white px-2 sm:px-4 py-2.5 rounded shadow">
        <div className="container flex justify-between items-center mx-auto">
          <Link
            to="/"
            className="text-lg font-semibold whitespace-nowrap"
            style={{ color: 'inherit', textDecoration: 'inherit' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
          >
            DeenDirectory
          </Link>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleMobileMenuToggle}
              className="menu-button text-gray-500 md:hidden"
              style={{ color: 'inherit' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-16 6h16"></path></svg>
            </button>
            <div className="relative hidden md:block" ref={businessDropdownRef}>
              <button
                onClick={() => setIsBusinessDropdownOpen(open => !open)}
                className="text-gray-500"
                style={{ color: 'inherit' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
              >
                For Businesses
              </button>
              {isBusinessDropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 py-2 w-48 bg-white rounded shadow-xl">
                  <Link
                    to="/business-sign-in?mode=signin"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    style={{ color: 'inherit' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                  >
                    Business Sign In
                  </Link>
                  <Link
                    to="/business-sign-in?mode=signup"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    style={{ color: 'inherit' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                  >
                    Business Sign Up
                  </Link>
                  <Link
                    to="/claim-business"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    style={{ color: 'inherit' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                  >
                    Claim Your Business
                  </Link>
                </div>
              )}
            </div>
            <div className="hidden md:block">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500"
                  style={{ color: 'inherit' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/user-sign-in"
                  className="text-sm text-gray-500"
                  style={{ color: 'inherit', textDecoration: 'inherit' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                >
                  User Sign In/Up
                </Link>
              )}
            </div>
          </div>
          <div className={`fixed top-0 inset-x-0 p-2 transition transform origin-top-right z-50 ${isMobileMenuOpen ? 'block' : 'hidden'}`} ref={mobileMenuRef}>
            <div className="rounded-lg shadow-md bg-white ring-1 ring-black ring-opacity-5 overflow-hidden">
              <div className="px-5 pt-4 flex items-center justify-between">
                <div className="-mr-2">
                  <button onClick={handleMobileMenuToggle} className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Close main menu</span>
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link
                  to="/user-sign-in"
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  style={{ color: 'inherit' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                >
                  User Sign In/Up
                </Link>
                <Link
                  to="/business-sign-in"
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  style={{ color: 'inherit' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                >
                  Business Sign In/Up
                </Link>
                <Link
                  to="/claim-business"
                  className="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                  style={{ color: 'inherit' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = hoverColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'inherit')}
                >
                  Claim Your Business
                </Link>
                {/* Add additional mobile menu items here */}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;