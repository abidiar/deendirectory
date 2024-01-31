import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { LocationContext } from '../context/LocationContext';

function SearchBar() {
  const navigate = useNavigate();
  const { location: currentLocation } = useContext(LocationContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [isHalalCertified, setIsHalalCertified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  useEffect(() => {
    // If currentLocation is an object and has a name, use it as the default location input
    if (currentLocation && currentLocation.name) {
      setLocationInput(currentLocation.name);
    }
  }, [currentLocation]);

  const handleSearch = async (event) => {
    event.preventDefault();
  
    if (!searchTerm.trim()) {
      setSearchError('Please enter a search term');
      setIsLoading(false);
      return;
    }
  
    setIsLoading(true);
    setSearchError('');
  
    // If the user has entered a location, use it; otherwise, use the current location.
    const searchLocation = locationInput.trim() ? locationInput.trim() : (currentLocation && currentLocation.name);
  
    // Ensure a location is available for the search.
    if (!searchLocation) {
      setSearchError('Location is required. Please enable location services or enter a location.');
      setIsLoading(false);
      return;
    }
  
    // Fetch coordinates for the entered location if locationInput is used.
    let latitude, longitude;
    if (locationInput.trim()) {
      const coords = await fetchCoordinates(searchLocation); // Implement this function to geocode the locationInput.
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
