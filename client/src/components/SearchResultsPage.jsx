// SearchResultsPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Card from './Card'; // Assuming you have a Card component to display each service

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

  useEffect(() => {
    if (searchTerm && location) {
      setIsLoading(true);
      setSearchError('');
      const searchUrl = `https://deendirectorybackend.onrender.com/api/search?searchTerm=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(location)}`;

      fetch(searchUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          if (data.message) {
            // No results found, set an empty array for searchResults
            setSearchResults([]);
            setSearchError(data.message);
          } else {
            // Data found, update searchResults
            setSearchResults(data);
          }
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Search request failed:', error);
          setSearchError('Failed to fetch search results');
          setIsLoading(false);
        });
    }
  }, [searchTerm, location]);

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      {searchError && <div className="text-red-500">{searchError}</div>}
      {!isLoading && !searchError && searchResults.length === 0 && (
        <div>No results found.</div>
      )}
      {!isLoading && searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map(result => (
            <Card 
              key={result.id}
              title={result.name}
              description={result.description}
              imageUrl={result.image || '/placeholder-image.jpg'} // Use a placeholder if no image is provided
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResultsPage;
