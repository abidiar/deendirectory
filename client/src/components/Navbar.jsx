// Navbar.js
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary-dark hover:text-primary-light cursor-pointer">DeenDirectory</span>
          </div>
          <div className="sm:hidden">
            <button 
              type="button" 
              className="inline-flex items-center justify-center p-2 rounded-md text-primary-dark hover:text-primary-light hover:bg-neutral-light focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-inset" 
              aria-controls="mobile-menu" 
              aria-expanded="false"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>
          <div className={`${isOpen ? 'block' : 'hidden'} sm:block sm:ml-6`}>
            <div className="flex space-x-4">
              <a href="#" className="text-primary-dark hover:text-primary-light px-3 py-2 rounded-md text-sm font-medium">For Businesses/Services</a>
              {/* Additional links */}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, shown when isOpen is true */}
      <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <a href="#" className="text-primary-dark hover:text-primary-light block px-3 py-2 rounded-md text-base font-medium">For Businesses/Services</a>
          {/* Additional links */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
