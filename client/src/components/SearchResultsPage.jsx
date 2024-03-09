import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from './Card'; // Assume this is your updated Card component
import Pagination from './Pagination'; // Your Pagination component
import { LocationContext } from '../context/LocationContext'; // Import LocationContext
import { Box, CircularProgress, Typography } from '@mui/material';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResultsPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Use context to get the backendUrl (and location if needed)
  const { backendUrl } = useContext(LocationContext);

  const navigate = useNavigate();
  const query = useQuery();

  const searchTerm = query.get('searchTerm');

  // Function to fetch search results from the backend
  const fetchSearchResults = async () => {
    setIsLoading(true);
    setSearchError(null);

    const searchUrl = `${backendUrl}/api/search?searchTerm=${encodeURIComponent(searchTerm)}&page=${currentPage}`;

    try {
      const response = await fetch(searchUrl);
      if (!response.ok) throw new Error('Network response was not ok.');

      const data = await response.json();
      setSearchResults(data.data);
      setTotalPages(Math.ceil(data.totalRows / 10)); // Assuming 10 results per page
    } catch (error) {
      setSearchError('Failed to load search results.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [currentPage, searchTerm, backendUrl]);

  return (
    <Box className="bg-neutral-light min-h-screen">
      <div className="container mx-auto p-4">
        {/* Placeholder for filters */}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-screen">
            <CircularProgress />
          </div>
        ) : searchError ? (
          <Typography color="error" className="text-center">
            {searchError}
          </Typography>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((result, index) => (
              <Card
                key={index}
                id={result.id}
                title={result.name}
                description={result.description}
                imageUrl={result.image_url}
                averageRating={result.average_rating}
                isHalalCertified={result.is_halal_certified}
                category={result.name} // Make sure to provide correct prop based on your data
                location={result.location} // Make sure to provide correct prop based on your data
                phoneNumber={result.phone_number} // Make sure to provide correct prop based on your data
                hours={result.hours} // Make sure to provide correct prop based on your data
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            className="my-4"
          />
        )}
      </div>
    </Box>
  );
}

export default SearchResultsPage;
