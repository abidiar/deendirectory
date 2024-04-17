import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Card from './Card';
import MyMap from './MyMap';
import Pagination from './Pagination';
import { LocationContext } from '../context/LocationContext';
import { fetchSearchResults } from '../services/searchService';
import Skeleton from './Skeleton';
import ErrorBoundary from './ErrorBoundary';
import { Helmet } from 'react-helmet'; // Assuming you have React Helmet installed
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

  // Fetching data with debouncing to minimize unnecessary calls
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
      setTotalPages(Math.ceil(totalRows / 10)); // Adjust the number per page as needed
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

  // Handling page changes without full page reloads
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Dynamic title and meta tags for SEO
  const seoTitle = `Search Results for ${searchTerm || 'All'} | DeenDirectory`;
  const seoDescription = `Find the best local Muslim businesses and services related to ${searchTerm || 'everything'} on DeenDirectory.`;

  return (
    <ErrorBoundary>
      {/* SEO Optimization */}
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
      </Helmet>

      <Box className="container mx-auto p-4 lg:flex">
        <div className="lg:flex-grow lg:pr-4">
          {isLoading ? (
            <Skeleton count={5} />
          ) : searchError ? (
            <Typography color="error">{searchError}</Typography>
          ) : (
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {searchResults.map((business) => {
    // Directly use the category from the business object
    const category = business.category;

    // Determine if the business is Halal certified. Ensure the comparison is made against a string.
    const isHalalCertified = typeof category === 'string' && category.toLowerCase() === 'food' && business.is_halal_certified;

    return (
      <Card
        key={business.id}
        id={business.id}
        title={business.name}
        description={business.description}
        imageUrl={business.imageUrl}
        averageRating={business.average_rating}
        isHalalCertified={isHalalCertified}
        category={category} // directly pass the category string
        phoneNumber={business.phone_number}
        hours={business.hours}
      />
    );
  })}
</div>
          )}
          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              aria-label="Search results pagination" // Accessibility improvement
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
