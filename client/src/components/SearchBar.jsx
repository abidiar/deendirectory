import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

function SearchBar({ categories }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [radius, setRadius] = useState('40233.6'); // Default radius 25 miles
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isHalalCertified, setIsHalalCertified] = useState(false);
  const [sort, setSort] = useState('rank'); // Default sort by relevance
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!searchTerm.trim()) {
      setSearchError('Please enter a search term');
      return;
    }
    setIsLoading(true);
    setSearchError('');
    const searchParams = new URLSearchParams({
      searchTerm: searchTerm.trim(),
      location: locationInput,
      radius,
      category: selectedCategory,
      isHalalCertified,
      sort,
      page: 1 // Start from page 1
    });
    navigate(`/search-results?${searchParams.toString()}`);
    setIsLoading(false);
  };

  return (
    <div className="mt-6">
      <form className="flex flex-col justify-center" onSubmit={handleSearch}>
        {/* ... existing search bar input fields ... */}
        {/* Category Dropdown */}
        <select 
          className="form-select form-select-lg mb-3"
          aria-label=".form-select-lg example"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        {/* Radius Input */}
        <input 
          type="number" 
          className="form-control" 
          placeholder="Radius in meters" 
          value={radius} 
          onChange={(e) => setRadius(e.target.value)} />
        {/* Sorting Options */}
        <select 
          className="form-select form-select-lg mb-3"
          aria-label=".form-select-lg example"
          value={sort}
          onChange={(e) => setSort(e.target.value)}>
          <option value="rank">Relevance</option>
          <option value="rating">Rating</option>
          <option value="newest">Newest</option>
        </select>
<button
  type="submit"
  className="bg-accent-coral text-white rounded-lg p-4 hover:bg-accent-coral-dark focus:bg-accent-coral-dark focus:outline-none transition-colors duration-200 disabled:opacity-50"
  disabled={isLoading}
>
  <FontAwesomeIcon icon={faSearch} size="lg" />
  <span className="ml-2">Search</span>
</button>
      </form>
    </div>
  );
}

export default SearchBar;
