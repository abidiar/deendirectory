import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        // Call a function to convert coordinates to a readable location
        const userLocation = await fetchLocationName(latitude, longitude);
        setLocation(userLocation);
      }, (error) => {
        console.error('Geolocation error:', error);
        setLocationError('Failed to retrieve your location.');
      });
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  // Function to convert coordinates to a readable location
  const fetchLocationName = async (latitude, longitude) => {
    // Example API call (use your own implementation/backend call here)
    const apiKey = 'YOUR_OPENCAGE_API_KEY'; // Replace with your API key
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.results.length > 0) {
        return data.results[0].formatted; // Adjust based on the API response structure
      } else {
        throw new Error('No location found');
      }
    } catch (error) {
      console.error('Error fetching location name:', error);
      return ''; // Return empty string or a default value
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (isValidLocation(location)) {
      if (onSearch) {
        onSearch(searchTerm, location);
      }
    } else {
      setLocationError('Please enter a valid location (e.g., city, state or zip code)');
    }
  };

  const isValidLocation = (location) => {
    const trimmedLocation = location.trim(); // Trim whitespace
    const cityStateRegex = /^[a-zA-Z\s]+,\s[A-Z]{2}$/i; // Case-insensitive
    const zipCodeRegex = /^\d{5}$/;
  
    return cityStateRegex.test(trimmedLocation) || zipCodeRegex.test(trimmedLocation);
  };

  return (
    <div className="mt-6">
      <form className="flex justify-center" onSubmit={handleSearch}>
        <div className="flex items-center rounded-lg shadow-lg w-full max-w-2xl">
          <input
            type="text"
            className={`flex-grow p-4 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary ${
              locationError ? 'border-red-500' : ''
            }`} // Add border color for visual feedback
            placeholder="Service or Business"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search for services or businesses"
          />
          <span className="bg-gray-300 w-px h-10 self-center"></span>
          <input
            type="text"
            className={`w-1/4 p-4 focus:outline-none focus:ring-2 focus:ring-primary ${
              locationError ? 'border-red-500' : ''
            }`}
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
        {locationError && <div className="text-red-500 text-sm">{locationError}</div>}
      </form>
    </div>
  );
}

export default SearchBar;
