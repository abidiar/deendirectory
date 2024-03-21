import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabaseClient'; // Adjust the path as necessary

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBusinessDropdownOpen, setIsBusinessDropdownOpen] = useState(false);
  const businessDropdownRef = useRef(null);

  useOutsideAlerter(businessDropdownRef, () => setIsBusinessDropdownOpen(false));

  useEffect(() => {
    setUser(supabase.auth.session);
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session);
    });
    return () => authListener.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setIsMenuOpen(false);
    } else {
      console.error('Error signing out:', error.message);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header>
      <nav className="bg-white px-2 sm:px-4 py-2.5 shadow-md">
        <div className="container flex flex-wrap justify-between items-center mx-auto">
          <Link to="/" className="flex items-center">
            <span className="self-center text-lg font-semibold whitespace-nowrap dark:text-white">DeenDirectory</span>
          </Link>
          <div className="relative" ref={businessDropdownRef}>
            <button onClick={() => setIsBusinessDropdownOpen(!isBusinessDropdownOpen)} className="text-gray-700 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Yelp for Business
            </button>
            {isBusinessDropdownOpen && (
              <div className="absolute right-0 w-56 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none">
                <div className="py-1">
                  <Link to="/add-service" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Add Business/Service</Link>
                  <Link to="/claim-business" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Claim Your Business</Link>
                  <Link to="/business-login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Business Owner Login</Link>
                  <Link to="/business-learn-more" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Learn More</Link>
                </div>
              </div>
            )}
          </div>
          <button onClick={toggleMenu} className="inline-flex items-center p-2 text-sm rounded-lg md:hidden hover:bg-gray-100 focus:outline-none" aria-expanded={isMenuOpen}>
            {/* Icon for mobile menu */}
          </button>
          <div className={`${isMenuOpen ? 'block' : 'hidden'} w-full md:block md:w-auto`} id="mobile-menu">
            <ul className="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
              {user ? (
                <>
                  <li>
                    <Link to="/dashboard" className="block py-2 pr-4 pl-3 text-gray-700 rounded md:p-0">Dashboard</Link>
                  </li>
                  <li>
                    <button onClick={handleSignOut} className="block py-2 pr-4 pl-3 text-gray-700 rounded md:p-0">Sign Out</button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/sign-in" className="block py-2 pr-4 pl-3 text-gray-700 rounded md:p-0">Sign In</Link>
                  </li>
                  <li>
                    <Link to="/sign-up" className="block py-2 pr-4 pl-3 text-gray-700 rounded md:p-0">Sign Up</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

function useOutsideAlerter(ref, onOutsideClick) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        onOutsideClick();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, onOutsideClick]);
}
