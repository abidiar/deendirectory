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
  const [currentPage, setCurrentPage] = useState(1); // Corrected variable name
  const pageSize = 10;
  const query = useQuery();
  const searchTerm = query.get('searchTerm');
  const location = query.get('location');
  const latitude = query.get('latitude');
  const longitude = query.get('longitude');
  const { backendUrl } = useContext(LocationContext);
  const navigate = useNavigate();

  // State for filters
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState('');
  const [distance, setDistance] = useState('');

  const updateURLWithFilters = () => {
    const filterParams = new URLSearchParams({
      searchTerm: encodeURIComponent(searchTerm),
      category: category,
      rating: rating,
      distance: distance,
      page: currentPage.toString(),
      pageSize: pageSize.toString(),
    });
    navigate(`/search?${filterParams.toString()}`);
  };

  const fetchSearchResults = (appliedFilters = false) => {
    setIsLoading(true);

    let searchUrl = `${backendUrl}/api/search?searchTerm=${encodeURIComponent(searchTerm)}`;
    // Append filters to the URL
    if (category) searchUrl += `&category=${encodeURIComponent(category)}`;
    if (rating) searchUrl += `&rating=${rating}`;
    if (distance) searchUrl += `&distance=${distance}`;
    if (latitude && longitude) {
      searchUrl += `&latitude=${latitude}&longitude=${longitude}`;
    }
    if (location) {
      searchUrl += `&location=${encodeURIComponent(location)}`;
    }
    searchUrl += `&page=${currentPage}&pageSize=${pageSize}`;

    fetch(searchUrl)
    .then(response => response.json())
    .then(data => {
      if (data.data) {
        setSearchResults(data.data);
        setTotalPages(Math.ceil(data.totalRows / pageSize));
      } else {
        setSearchError('No results found.');
      }
      setIsLoading(false);
    })
    .catch(error => {
      setSearchError(error.message);
      setIsLoading(false);
    });

    if (appliedFilters) {
      updateURLWithFilters();
    }
  };

  useEffect(() => {
    fetchSearchResults(); // Initial fetch without applying filters
  }, [currentPage]); // Fetch when currentPage changes

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchSearchResults();
  };

  const handleDistanceChange = (event, newValue) => {
    setDistance(newValue);
  };

  const handleApplyFilters = () => {
    fetchSearchResults(true); // Pass true to indicate filters are being applied
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Filters</Typography>
      <TextField
        select
        label="Category"
        value={category}
        onChange={e => setCategory(e.target.value)}
        helperText="Select a category"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
      >
        {/* Map over your categories here */}
        <MenuItem value="food">Food</MenuItem>
        <MenuItem value="service">Service</MenuItem>
      </TextField>

      <TextField
        select
        label="Rating"
        value={rating}
        onChange={e => setRating(e.target.value)}
        helperText="Select minimum rating"
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
      >
        {[1, 2, 3, 4, 5].map((option) => (
          <MenuItem key={option} value={option}>
            {option} Stars
          </MenuItem>
        ))}
      </TextField>

      <Typography gutterBottom>Distance</Typography>
      <Slider
        value={typeof distance === 'number' ? distance : 0}
        onChange={handleDistanceChange}
        aria-labelledby="input-slider"
        min={1}
        max={100}
        valueLabelDisplay="auto"
        sx={{ mb: 3 }}
      />

      <Button variant="contained" color="primary" onClick={handleApplyFilters}>
        Apply Filters
      </Button>

      {isLoading && <div>Loading search results...</div>}
      {searchError && <div className="text-red-500">{searchError}</div>}
      {!isLoading && searchResults && searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map(result => (
            <Card
              key={result.id}
              id={result.id}
              title={result.name}
              description={result.description}
              image_url={result.image_url || '/placeholder-image.jpg'}
              averageRating={result.average_rating}
              isHalalCertified={result.is_halal_certified}
            />
          ))}
        </div>
      )}
      {!isLoading && !searchError && searchResults && searchResults.length === 0 && (
        <div>No results found.</div>
      )}
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