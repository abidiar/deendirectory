import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { LocationContext } from '../context/LocationContext'; // Ensure this path matches your file structure

function SearchBar() {
  const navigate = useNavigate();
  const { location: currentLocation } = useContext(LocationContext); // Use the current location from context
  const [searchTerm, setSearchTerm] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [isHalalCertified, setIsHalalCertified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async (event) => {
    event.preventDefault();

    if (!searchTerm.trim()) {
      setSearchError('Please enter a search term');
      setIsLoading(false);
      return;
    }

    const searchLocation = locationInput.trim() || currentLocation;
    if (!searchLocation) {
      setSearchError('Location is required. Please enable location services or enter a location.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSearchError('');

    const searchParams = new URLSearchParams({
      searchTerm: searchTerm.trim(),
      location: searchLocation,
      isHalalCertified: isHalalCertified.toString()
    });

    navigate(`/search-results?${searchParams.toString()}`);
    setIsLoading(false);
  };

  return (
    <div className="mt-6">
      <form className="flex flex-col justify-center" onSubmit={handleSearch}>
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
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            aria-label="Location"
          />
          <button
            type="submit"
            className="bg-accent-coral text-white rounded-r-lg p-4 hover:bg-accent-coral-dark focus:bg-accent-coral-dark focus:outline-none transition-colors duration-200"
            disabled={isLoading}
          >
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
        <div className="flex justify-center mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-gray-600 mr-2"
              checked={isHalalCertified}
              onChange={(e) => setIsHalalCertified(e.target.checked)}
            />
            <span className="text-gray-700">Halal Certified Only</span>
          </label>
        </div>
        {isLoading && <div className="text-center">Loading...</div>}
        {searchError && <div className="text-red-500 text-center">{searchError}</div>}
      </form>
    </div>
  );
}

export default SearchBar;
