import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from './Hero';
import FeaturedCategories from './FeaturedCategories';
import NewNearYou from './NewNearYou';
import ProfessionalCallToAction from './ProfessionalCallToAction';
import { LocationContext } from '../context/LocationContext';

function MainLayout() {
  const { location, backendUrl } = useContext(LocationContext);
  let navigate = useNavigate();

  const handleLocationError = (err) => {
    console.error(err);
    // Update your state or UI to show the error message as needed
  };

  const handleSearch = (searchTerm, locationInput) => {
    if (locationInput) {
      navigate(`/search-results?searchTerm=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(locationInput)}`);
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        navigate(`/search-results?searchTerm=${encodeURIComponent(searchTerm)}&latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`);
      }, handleLocationError);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Hero onSearch={handleSearch} backendUrl={backendUrl} />
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
