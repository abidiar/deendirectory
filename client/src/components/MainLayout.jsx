import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from './Hero';
import FeaturedCategories from './FeaturedCategories';
import NewNearYou from './NewNearYou';
import ProfessionalCallToAction from './ProfessionalCallToAction';
import { LocationContext } from '../context/LocationContext';

function MainLayout() {
  const { location } = useContext(LocationContext);
  let navigate = useNavigate();

  const handleSearch = (searchTerm, location) => {
    if (location) {
      navigate(`/search-results?searchTerm=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(location)}`);
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        navigate(`/search-results?searchTerm=${encodeURIComponent(searchTerm)}&latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`);
      }, (err) => {
        console.error(err);
        alert('Unable to retrieve your location');
      });
    }
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
