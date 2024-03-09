import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from './Card';
import Pagination from './Pagination';
import { LocationContext } from '../context/LocationContext';
import { TextField, MenuItem, Button, Box, Typography, Slider } from '@mui/material';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResultsPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const query = useQuery();
  const searchTerm = query.get('searchTerm');
  const location = query.get('location');
  const latitude = query.get('latitude');
  const longitude = query.get('longitude');
  const { backendUrl } = useContext(LocationContext);
  const navigate = useNavigate();

  const [category, setCategory] = useState('');
  const [rating, setRating] = useState('');
  const [distance, setDistance] = useState('');

  useEffect(() => {
    fetchSearchResults();
  }, [currentPage]); // Refetch when currentPage changes

  const fetchSearchResults = (appliedFilters = false) => {
    setIsLoading(true);
    let searchUrl = `${backendUrl}/api/search?searchTerm=${encodeURIComponent(searchTerm)}&page=${currentPage}&pageSize=${pageSize}`;
    if (category) searchUrl += `&category=${encodeURIComponent(category)}`;
    if (rating) searchUrl += `&rating=${rating}`;
    if (distance) searchUrl += `&distance=${distance}`;
    if (latitude && longitude) searchUrl += `&latitude=${latitude}&longitude=${longitude}`;
    if (location) searchUrl += `&location=${encodeURIComponent(location)}`;

    fetch(searchUrl)
      .then(response => response.json())
      .then(data => {
        setSearchResults(data.data);
        setTotalPages(Math.ceil(data.totalRows / pageSize));
        setIsLoading(false);
      })
      .catch(error => {
        setSearchError('No results found.');
        setIsLoading(false);
      });

    if (appliedFilters) updateURLWithFilters();
  };

  const updateURLWithFilters = () => {
    const filterParams = new URLSearchParams({
      searchTerm: encodeURIComponent(searchTerm),
      category,
      rating,
      distance,
      page: currentPage.toString(),
      pageSize: pageSize.toString(),
    });
    navigate(`/search?${filterParams.toString()}`);
  };

  const handlePageChange = newPage => {
    setCurrentPage(newPage);
  };

  // Your existing code for rendering and handling filters...

  return (
    <Box sx={{ p: 2 }}>
      {/* Filters and search results rendering */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </Box>
  );
}

export default SearchResultsPage;
