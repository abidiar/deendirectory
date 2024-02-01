// Navbar.js
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  let navigate = useNavigate();
  const linkStyle = "text-primary-dark hover:text-primary-light px-3 py-2 rounded-md text-sm font-medium";

  // Toggle the mobile menu open/closed
  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-dark hover:text-primary-light cursor-pointer">
              DeenDirectory
            </Link>
          </div>
          <div className="hidden sm:block">
            {/* Desktop Menu Items */}
            <button onClick={() => navigate('/add-service')} className={linkStyle}>
              Add Businesses/Services
            </button>
            {/* ... other desktop links ... */}
          </div>
          <div className="sm:hidden">
            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMobileMenu}
              type="button" 
              className="inline-flex items-center justify-center p-2 rounded-md text-primary-dark hover:text-primary-light hover:bg-neutral-light focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-light" 
              aria-controls="mobile-menu" 
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, shown when isOpen is true */}
      {isOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Mobile Menu Items */}
            <button onClick={() => navigate('/add-service')} className={`${linkStyle} text-base`}>
              Add Businesses/Services
            </button>
            {/* ... other mobile links ... */}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
