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
  const pageSize = 10;
  const query = useQuery();
  const searchTerm = query.get('searchTerm');
  const location = query.get('location');
  const latitude = query.get('latitude');
  const longitude = query.get('longitude');
  const page = parseInt(query.get('page') || '1', 10);
  const queriedPageSize = parseInt(query.get('pageSize') || `${pageSize}`, 10);
  const { backendUrl } = useContext(LocationContext);
  const navigate = useNavigate();

  // State for filters
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState('');
  const [distance, setDistance] = useState('');

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
    if (page) {
      searchUrl += `&page=${page}`;
    }
    if (queriedPageSize) {
      searchUrl += `&pageSize=${queriedPageSize}`;
    }

    if (appliedFilters) {
      // If filters are applied, update the URL to reflect changes
      navigate(`/search?searchTerm=${encodeURIComponent(searchTerm)}&category=${category}&rating=${rating}&distance=${distance}&page=${page}&pageSize=${queriedPageSize}`);
    }

    fetch(searchUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.results) {
        setSearchResults(data.results);
        setTotalPages(Math.ceil(data.total / queriedPageSize));
      } else {
        setSearchError('No results found.');
      }
      setIsLoading(false);
    })
    .catch(error => {
      setSearchError('Error fetching search results: ' + error.message);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchSearchResults(); // Initial fetch without applying filters
  }, []); // Dependency array is empty to only fetch on mount

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
              image_Url={result.image || '/placeholder-image.jpg'}
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
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
        />
      )}
    </Box>
  );
}

export default SearchResultsPage;
