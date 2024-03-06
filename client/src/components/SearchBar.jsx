import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { LocationContext } from '../context/LocationContext';
import { useClickAway } from 'react-use';

function SearchBar() {
  const navigate = useNavigate();
  const { location: currentLocation, backendUrl } = useContext(LocationContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [isHalalCertified, setIsHalalCertified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searchError, setSearchError] = useState('');

  const ref = useRef(null); // Ref for the search bar container

  useClickAway(ref, () => {
    // Close suggestions when clicking outside the search bar
    setSuggestions([]);
  });

  useEffect(() => {
    if (currentLocation && currentLocation.name) {
      setLocationInput(currentLocation.name);
    }
  }, [currentLocation]);

  const fetchCoordinates = async (location) => {
    try {
      const response = await fetch(`${backendUrl}/api/geocode?location=${encodeURIComponent(location)}`);
  
      // Check if the response is okay and is of type 'application/json'
      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        if (data.latitude && data.longitude) {
          return { latitude: data.latitude, longitude: data.longitude };
        } else {
          console.error('Geocoding failed:', data.error || 'No response data');
          return null;
        }
      } else {
        // Handle non-JSON responses or unsuccessful requests
        console.error('Non-JSON response or request failed', response.status, response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error in fetching coordinates:', error);
      return null;
    }
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!searchTerm.trim()) {
      setSearchError('Please enter a search term');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSearchError('');

    const searchLocation = locationInput.trim() || (currentLocation && currentLocation.name);
    if (!searchLocation) {
      setSearchError('Location is required. Please enable location services or enter a location.');
      setIsLoading(false);
      return;
    }

    let latitude, longitude;
    if (locationInput.trim()) {
      const coords = await fetchCoordinates(searchLocation);
      if (coords) {
        latitude = coords.latitude;
        longitude = coords.longitude;
      } else {
        setSearchError('Unable to find location. Please check the entered location.');
        setIsLoading(false);
        return;
      }
    } else if (currentLocation && currentLocation.latitude && currentLocation.longitude) {
      latitude = currentLocation.latitude;
      longitude = currentLocation.longitude;
    }

    const searchParams = new URLSearchParams({
      searchTerm: searchTerm.trim(),
      location: searchLocation,
      isHalalCertified: isHalalCertified.toString()
    });

    if (latitude && longitude) {
      searchParams.append('latitude', latitude);
      searchParams.append('longitude', longitude);
    }

    navigate(`/search-results?${searchParams.toString()}`);
    setIsLoading(false);
  };

  const fetchSuggestions = async (term) => {
    if (!term.trim()) return;
  
    // Assuming you have a backend endpoint for fetching suggestions
    try {
      const response = await fetch(`${backendUrl}/api/suggestions?term=${encodeURIComponent(term)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      } else {
        console.error('Failed to fetch suggestions');
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  return (
<div className="mt-6 relative" ref={ref}> {/* Container for the search bar */}
  <form className="flex flex-col justify-center" onSubmit={handleSearch}>
    <div className="flex items-center rounded-lg shadow-lg w-full max-w-2xl"> {/* Search bar container */}
          <input
            type="text"
            className="flex-grow p-4 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Service or Business"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchSuggestions(e.target.value);
            }}
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
          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
      <ul className="absolute z-10 w-full bg-white shadow-lg rounded-md border border-gray-200 overflow-auto top-full left-0 mt-1">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors duration-150 ease-in-out"
                onClick={() => {
                  setSearchTerm(suggestion);
                  setSuggestions([]);
                }}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
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
