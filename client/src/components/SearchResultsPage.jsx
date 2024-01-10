import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Card from './Card'; // Assuming you have a Card component for displaying each service

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResultsPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const query = useQuery();
  const searchTerm = query.get('searchTerm');
  const location = query.get('location');
  const latitude = query.get('latitude');
  const longitude = query.get('longitude');

  useEffect(() => {
    // Check if the required query parameters are present
    if (!searchTerm) {
      setSearchError('Search term is missing.');
      return;
    }

    setIsLoading(true);
    let searchUrl = `https://deendirectorybackend.onrender.com/api/search?searchTerm=${encodeURIComponent(searchTerm)}`;

    // Check if location or latitude and longitude are present and add them to the search URL
    if (location) {
      searchUrl += `&location=${encodeURIComponent(location)}`;
    } else if (latitude && longitude) {
      searchUrl += `&latitude=${latitude}&longitude=${longitude}`;
    }

    fetch(searchUrl)
    .then(response => {
      if (!response.ok) {
        return response.json().then(errorData => {
          throw new Error(`HTTP ${response.status}: ${errorData.message || response.statusText}`);
        });
      }
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data)) {
        setSearchError('Data format is incorrect, expected an array of results.');
        setIsLoading(false);
      } else {
        setSearchResults(data);
        setIsLoading(false);
      }
    })
    .catch(error => {
      console.error('Search request failed:', error);
      setSearchError(error.message);
      setIsLoading(false);
    });
}, [searchTerm, location, latitude, longitude]);

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {searchError && <div className="text-red-500">{searchError}</div>}
      {!isLoading && searchResults && searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map(result => (
            <Card
              key={result.id}
              id={result.id}
              title={result.name}
              description={result.description}
              imageUrl={result.image || '/placeholder-image.jpg'} // Replace with actual image property if available
            />
          ))}
        </div>
      )}
      {!isLoading && !searchError && searchResults && searchResults.length === 0 && <div>No results found.</div>}
    </div>
  );
}

export default SearchResultsPage;
