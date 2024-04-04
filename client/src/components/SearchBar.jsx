import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { LocationContext } from '../context/LocationContext';
import { useClickAway } from 'react-use';

function SearchBar() {
  const navigate = useNavigate();
  const { location: currentLocation } = useContext(LocationContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searchError, setSearchError] = useState('');

  const ref = useRef(null);
  const suggestionsRef = useRef(null);

  useClickAway(suggestionsRef, () => {
    setSuggestions([]);
  });

  useEffect(() => {
    if (currentLocation && currentLocation.name) {
      setLocationInput(currentLocation.name);
    }
  }, [currentLocation]);

  const fetchCoordinates = async (location) => {
    try {
      const response = await fetch(`https://deendirectorybackend.onrender.com/api/geocode?location=${encodeURIComponent(location)}`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { latitude: data.latitude, longitude: data.longitude };
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

    try {
      const coords = await fetchCoordinates(locationInput.trim());
      if (coords) {
        navigate(`/search-results?searchTerm=${encodeURIComponent(searchTerm.trim())}&latitude=${coords.latitude}&longitude=${coords.longitude}`);
      } else {
        setSearchError('Unable to find location. Please check the entered location.');
      }
    } catch (error) {
      setSearchError('An error occurred during the search.');
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce utility function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const fetchSuggestions = async (term) => {
    if (!term.trim()) return;
    try {
      const response = await fetch(`https://deendirectorybackend.onrender.com/api/suggestions?term=${encodeURIComponent(term)}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Use the debounce function for fetchSuggestions
  const debouncedFetchSuggestions = debounce(fetchSuggestions, 500);

  return (
    <div className="relative flex justify-center my-4 z-10" ref={ref}>
      <form className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full max-w-3xl" onSubmit={handleSearch}>
        <div className="flex flex-col md:flex-row md:flex-grow bg-white rounded-lg shadow-md overflow-hidden">
          <div className="relative flex-grow">
            <input
              type="text"
              className="w-full px-4 py-3 text-lg border-none focus:ring-2 focus:ring-blue-500"
              placeholder="Find services..."
              value={searchTerm}
              onChange={(e) => {
                const newSearchTerm = e.target.value;
                setSearchTerm(newSearchTerm);
                if (newSearchTerm.trim()) {
                  debouncedFetchSuggestions(newSearchTerm);
                } else {
                  setSuggestions([]);
                }
              }}
              aria-label="Search for services or businesses"
            />
            {suggestions.length > 0 && (
              <ul ref={suggestionsRef} className="absolute top-full left-0 right-0 bg-white shadow-md rounded-b-lg mt-1 overflow-auto z-10">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
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
          <div className="flex items-center px-2 md:border-l md:border-gray-200">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gray-500" />
            <input
              type="text"
              className="px-4 py-3 text-lg border-none focus:ring-2 focus:ring-blue-500"
              placeholder="Location"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              aria-label="Location"
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-6 py-3 text-lg text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-300"
          disabled={isLoading}
        >
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </form>
      {isLoading && <div className="text-center">Loading...</div>}
      {searchError && <div className="text-center text-red-500">{searchError}</div>}
    </div>
  );
}

export default SearchBar;
