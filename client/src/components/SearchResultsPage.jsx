import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LocationContext } from '../context/LocationContext';
import Filters from './Filters';
import BusinessCard from './BusinessCard';
import Pagination from './Pagination';
import { CircularProgress, Box } from '@mui/material';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResultsPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchError, setSearchError] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { backendUrl } = useContext(LocationContext);
  const navigate = useNavigate();
  const query = useQuery();
  const searchTerm = query.get('searchTerm');

  const fetchSearchResults = async () => {
    setIsLoading(true);

    const searchUrl = new URL(`${backendUrl}/api/search`);
    const params = {
      searchTerm: searchTerm,
      // Add other query parameters here as needed
      page: currentPage,
      pageSize: 10, // Set the page size or use a state variable if you need it dynamic
    };
    searchUrl.search = new URLSearchParams(params).toString();

    try {
      const response = await fetch(searchUrl);
      const data = await response.json();
      if (data.data) {
        setSearchResults(data.data);
        setTotalPages(Math.ceil(data.totalRows / 10)); // Adjust pageSize accordingly if needed
      } else {
        setSearchError('No results found.');
      }
    } catch (error) {
      setSearchError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults(); // Fetch results when the page is first loaded or when currentPage changes
  }, [currentPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <Box className="bg-neutral-light min-h-screen p-4">
      <Filters searchTerm={searchTerm} />

      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <CircularProgress />
        </div>
      ) : searchError ? (
        <div className="text-center text-red-500">{searchError}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((result, index) => (
              <BusinessCard
                key={result.id}
                {...result}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              className="mt-4"
            />
          )}
        </>
      )}
    </Box>
  );
}

export default SearchResultsPage;
