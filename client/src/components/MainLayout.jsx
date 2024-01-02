import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from './Hero';
import FeaturedCategories from './FeaturedCategories';
import NewNearYou from './NewNearYou';
import ProfessionalCallToAction from './ProfessionalCallToAction';

function MainLayout() {
  let navigate = useNavigate();

  const handleSearch = (searchTerm, location) => {
    navigate(`/search-results?searchTerm=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(location)}`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Hero onSearch={handleSearch} />
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
