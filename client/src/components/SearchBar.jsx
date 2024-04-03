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
      const response = await fetch(`/api/geocode?location=${encodeURIComponent(location)}`, {
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

  const fetchSuggestions = async (term) => {
    if (!term.trim()) return;

    try {
      const response = await fetch(`/api/suggestions?term=${encodeURIComponent(term)}`, {
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
