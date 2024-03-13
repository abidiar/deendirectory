import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from './Card';
import MyMap from './MyMap';
import Pagination from './Pagination';
import { LocationContext } from '../context/LocationContext';
import { fetchSearchResults } from '../services/searchService';
import Skeleton from './Skeleton';
import ErrorBoundary from './ErrorBoundary';
import { Box, Typography } from '@mui/material';
import { debounce } from 'lodash';

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

  const fetchData = async () => {
    setIsLoading(true);
    setSearchError(null);

    try {
      const data = await fetchSearchResults(searchTerm, currentPage);
      setSearchResults(data.data);
      setTotalPages(Math.ceil(data.totalRows / 10));
    } catch (error) {
      setSearchError('Failed to load search results.');
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchData = useCallback(debounce(fetchData, 300), [searchTerm, currentPage]);

  useEffect(() => {
    debouncedFetchData();
  }, [debouncedFetchData]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <ErrorBoundary>
      <Box className="container mx-auto p-4 lg:flex">
        <div className="lg:flex-grow lg:pr-4">
          {isLoading ? (
            <Skeleton count={5} />
          ) : searchError ? (
            <Typography color="error">{searchError}</Typography>
          ) : (
            <div className="space-y-4">
              {searchResults.map((business) => (
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
          )}
          {totalPages > 1 && (
            <div className="my-4">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
              />
            </div>
          )}
        </div>
        <div className="lg:w-2/5 xl:w-1/3 h-96 lg:h-auto">
          {searchResults.length > 0 && (
            <MyMap
              businesses={searchResults}
              center={{ lat: searchResults[0]?.latitude || 0, lng: searchResults[0]?.longitude || 0 }}
              zoom={12}
            />
          )}
        </div>
      </Box>
    </ErrorBoundary>
  );
}

export default SearchResultsPage;