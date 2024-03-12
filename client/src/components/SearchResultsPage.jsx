import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from './Card';
import MyMap from './MyMap';
import Pagination from './Pagination';
import { LocationContext } from '../context/LocationContext';
import { Box, CircularProgress, Typography } from '@mui/material';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResultsPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchError, setSearchError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
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

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Box className="container mx-auto p-4 flex flex-wrap lg:flex-nowrap">
      <div className="w-full lg:w-3/5 xl:w-2/3 p-4">
        {isLoading ? (
          <CircularProgress />
        ) : searchError ? (
          <Typography color="error">{searchError}</Typography>
        ) : (
          <>
            <div className="space-y-4">
            {searchResults.map((business, index) => (
  <Card
    key={business.id}
    id={business.id}
    title={business.name}
    description={business.description}
    imageUrl={business.image_url}
    averageRating={business.average_rating}
    isHalalCertified={business.category && business.category.toLowerCase() === 'food' ? business.is_halal_certified : undefined}
    category={business.category}
    phoneNumber={business.phone_number}
    hours={business.hours}
  />
))}
            </div>
            {totalPages > 1 && (
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                className="my-4"
              />
            )}
          </>
        )}
      </div>
      <div className="w-full lg:w-2/5 xl:w-1/3 p-4 h-96 lg:h-screen">
        {searchResults.length > 0 && (
          <MyMap businesses={searchResults} center={{lat: searchResults[0]?.latitude || 0, lng: searchResults[0]?.longitude || 0}} zoom={12} />
        )}
      </div>
    </Box>
  );
}

export default SearchResultsPage;
