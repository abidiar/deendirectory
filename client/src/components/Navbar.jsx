import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

const Navbar = () => {
  const { user, signOut: contextSignOut } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    if (contextSignOut) contextSignOut(); // Ensure context's signOut is called if it exists
    setIsMenuOpen(false); // Close mobile menu
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white px-2 sm:px-4 py-2.5 shadow-md">
      <div className="container flex flex-wrap justify-between items-center mx-auto">
        <Link to="/" className="flex items-center">
            {/* Logo or Brand name */}
            <span className="self-center text-lg font-semibold whitespace-nowrap dark:text-white">Your Brand</span>
        </Link>
        <button
          onClick={toggleMenu}
          data-collapse-toggle="mobile-menu"
          type="button"
          className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          aria-controls="mobile-menu"
          aria-expanded="false"
        >
          {/* Icon for menu */}
        </button>
        <div className={`${isMenuOpen ? '' : 'hidden'} w-full md:block md:w-auto`} id="mobile-menu">
          <ul className="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
            {user ? (
              <>
                <li>
                  <Link to="/add-service" className="block py-2 pr-4 pl-3 text-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0" aria-current="page" onClick={() => setIsMenuOpen(false)}>Add Business/Service</Link>
                </li>
                <li>
                  <button onClick={handleSignOut} className="py-2 pr-4 pl-3 text-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0">Sign Out</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/sign-in" className="block py-2 pr-4 pl-3 text-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0" onClick={() => setIsMenuOpen(false)}>Sign In (Users)</Link>
                </li>
                <li>
                  <Link to="/business-sign-in" className="block py-2 pr-4 pl-3 text-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0" onClick={() => setIsMenuOpen(false)}>Sign In (Businesses)</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
