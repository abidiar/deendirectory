import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { LocationContext } from '../context/LocationContext';
import { useClickAway } from 'react-use';
import styles from './searchbar.module.css';

function SearchBar() {
  const navigate = useNavigate();
  const { location: currentLocation } = useContext(LocationContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searchError, setSearchError] = useState('');

  const ref = useRef(null);

  useClickAway(ref, () => {
    setSuggestions([]);
  });

  useEffect(() => {
    if (currentLocation && currentLocation.name) {
      setLocationInput(currentLocation.name);
    }
  }, [currentLocation]);

  const fetchCoordinates = async (location) => {
    try {
      const response = await fetch(`/api/geocode?location=${encodeURIComponent(location)}`);

      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        if (data.latitude && data.longitude) {
          return { latitude: data.latitude, longitude: data.longitude };
        } else {
          console.error('Geocoding failed:', data.error || 'No response data');
          return null;
        }
      } else {
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

    try {
      const response = await fetch(`/api/suggestions?term=${encodeURIComponent(term)}`);
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
    <div className={styles.searchBarWrapper} ref={ref}>
      <form className={styles.searchForm} onSubmit={handleSearch}>
        <div className={styles.searchInputContainer}>
          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Find cleaner, web developer, seo, babysitter, etc."
              value={searchTerm}
              onChange={(e) => {
                const newSearchTerm = e.target.value;
                setSearchTerm(newSearchTerm);
                if (newSearchTerm.trim()) {
                  fetchSuggestions(newSearchTerm);
                } else {
                  setSuggestions([]);
                }
              }}
              aria-label="Search for services or businesses"
            />
            {suggestions.length > 0 && (
              <ul className={styles.suggestionsDropdown}>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className={styles.suggestionItem}
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
          <span className={styles.separator}></span>
          <input
            type="text"
            className={styles.locationInput}
            placeholder="Location"
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            aria-label="Location"
          />
          <button type="submit" className={styles.searchButton} disabled={isLoading}>
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
        {isLoading && <div className={styles.loadingMessage}>Loading...</div>}
        {searchError && <div className={styles.errorMessage}>{searchError}</div>}
      </form>
    </div>
  );
}

export default SearchBar;