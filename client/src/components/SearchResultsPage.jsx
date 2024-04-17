import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
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

  const query = useQuery();
  const searchTerm = query.get('searchTerm');
  const latitude = query.get('latitude');
  const longitude = query.get('longitude');

  const fetchData = async () => {
    setIsLoading(true);
    setSearchError(null);

    try {
      const { data, totalRows } = await fetchSearchResults(
        searchTerm,
        currentPage,
        latitude,
        longitude
      );
      setSearchResults(data);
      setTotalPages(Math.ceil(totalRows / 10));
    } catch (error) {
      setSearchError('Failed to load search results.');
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchData = useCallback(debounce(fetchData, 300), [
    searchTerm,
    currentPage,
    latitude,
    longitude,
  ]);

  useEffect(() => {
    debouncedFetchData();
  }, [debouncedFetchData]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const renderCategory = (category) => {
    return typeof category === 'string' ? category : category?.name || 'N/A';
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
                        isHalalCertified={
                            renderCategory(business.category).toLowerCase() === 'food' &&
                            business.is_halal_certified
                        }
                        category={renderCategory(business.category)}
                        phoneNumber={business.phone_number}
                        hours={business.hours}
                    />
                ))}
            </div>
          )}
          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
            />
          )}
        </div>
        <div className="lg:w-2/5 xl:w-1/3 h-96 lg:h-auto">
          {searchResults.length > 0 && (
            <MyMap
              businesses={searchResults}
              center={{
                lat: searchResults[0]?.latitude || 0,
                lng: searchResults[0]?.longitude || 0,
              }}
              zoom={12}
            />
          )}
        </div>
      </Box>
    </ErrorBoundary>
  );
}

export default SearchResultsPage;