import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import Card from './Card';
import Pagination from './Pagination';
import { LocationContext } from '../context/LocationContext'; // Ensure this path matches your file structure

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResultsPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10); // Default pageSize
  const query = useQuery();
  const searchTerm = query.get('searchTerm');
  const location = query.get('location');
  const latitude = query.get('latitude');
  const longitude = query.get('longitude');
  const page = parseInt(query.get('page') || '1', 10);
  const queriedPageSize = parseInt(query.get('pageSize') || `${pageSize}`, 10);
  const { backendUrl } = useContext(LocationContext);

  useEffect(() => {
    console.log("Search Term: ", searchTerm); // Log search term
    if (!searchTerm) {
      setSearchError('Search term is missing.');
      return;
    }

    setIsLoading(true);
    let searchUrl = `${backendUrl}/api/search?searchTerm=${encodeURIComponent(searchTerm)}`;

    console.log("Search URL: ", searchUrl); // Log constructed search URL

    fetch(searchUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log("Fetched Data: ", data); // Log the data fetched from the API
        if (data.results) {
          setSearchResults(data.results);
          setTotalPages(Math.ceil(data.total / queriedPageSize));
        } else {
          setSearchError('No results found.');
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Fetch Error: ', error); // Log any fetch errors
        setSearchError('Error fetching search results: ' + error.message);
        setIsLoading(false);
      });
  }, [searchTerm, location, latitude, longitude, backendUrl, page, queriedPageSize]);

  return (
    <div>
      {isLoading && <div>Loading search results...</div>}
      {searchError && <div className="text-red-500">{searchError}</div>}
      {!isLoading && searchResults && searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map(result => {
            console.log("Mapping result: ", result); // Log each result before mapping
            return (
              <Card
                key={result.id}
                id={result.id}
                title={result.name}
                description={result.description}
                imageUrl={result.image || '/placeholder-image.jpg'}
                averageRating={result.average_rating}
                isHalalCertified={result.is_halal_certified}
              />
            );
          })}
        </div>
      )}
      {!isLoading && !searchError && searchResults && searchResults.length === 0 && (
        <div>No results found.</div>
      )}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
        />
      )}
    </div>
  );
}

export default SearchResultsPage;
