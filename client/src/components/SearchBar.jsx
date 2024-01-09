import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();
    if (onSearch) {
      onSearch(searchTerm, location);
    }
  };

  return (
    <div className="mt-6">
      <form className="flex justify-center" onSubmit={handleSearch}>
        <div className="flex items-center rounded-lg shadow-lg w-full max-w-2xl">
          <input
            type="text"
            className="flex-grow p-4 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Service or Business"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search for services or businesses"
          />
          <span className="bg-gray-300 w-px h-10 self-center"></span>
          <input
            type="text"
            className="w-1/4 p-4 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            aria-label="Location"
          />
          <button
            type="submit"
            className="bg-accent-coral text-white rounded-r-lg p-4 hover:bg-accent-coral-dark focus:bg-accent-coral-dark focus:outline-none transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default SearchBar;
