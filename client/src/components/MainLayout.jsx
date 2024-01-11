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

  const handleSearch = (searchTerm, locationInput) => {
    console.log('Received search term in MainLayout:', searchTerm);
    console.log('Received location input in MainLayout:', locationInput);

    // Additional check to ensure searchTerm is a string and not empty
    if (typeof searchTerm !== 'string' || !searchTerm.trim()) {
      console.error('Search term is missing or invalid:', searchTerm);
      // Update your UI to reflect this error
      return;
    }

    if (locationInput) {
      navigate(`/search-results?searchTerm=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(locationInput)}`);
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        navigate(`/search-results?searchTerm=${encodeURIComponent(searchTerm)}&latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`);
      }, (err) => {
        console.error('Geolocation error:', err);
        // Update state or UI to handle the error instead of alert
        // setError('Unable to retrieve your location. Please enter it manually.');
      });
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
