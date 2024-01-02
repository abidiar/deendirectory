import React, { useState } from 'react';
import Hero from './Hero';
import FeaturedCategories from './FeaturedCategories';
import NewNearYou from './NewNearYou';
import ProfessionalCallToAction from './ProfessionalCallToAction';

function MainLayout() {
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleSearch = (searchTerm, location) => {
    setIsLoading(true);
    setSearchError('');
    const searchUrl = `https://deendirectorybackend.onrender.com/api/search?searchTerm=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(location)}`;

    fetch(searchUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setSearchResults(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Search request failed:', error);
        setSearchError('Failed to fetch search results');
        setIsLoading(false);
      });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Hero onSearch={handleSearch} />
      {isLoading && <div>Loading...</div>}
      {searchError && <div className="text-red-500">{searchError}</div>}
      {!isLoading && searchResults && (
        <div>
          {/* Render search results here */}
          {searchResults.map(result => (
            <div key={result.id}>
              {/* Display result details */}
            </div>
          ))}
        </div>
      )}
      <div className="my-12">
        <FeaturedCategories />
      </div>
      <hr className="my-8 border-neutral-dark" />
      <NewNearYou />
      <hr className="my-8 border-neutral-dark" />
      <ProfessionalCallToAction />
    </div>
  );
}

export default MainLayout;
