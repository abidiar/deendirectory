import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from './Hero';
import FeaturedCategories from './FeaturedCategories';
import NewNearYou from './NewNearYou';
import ProfessionalCallToAction from './ProfessionalCallToAction';
import { LocationContext } from '../context/LocationContext';

function MainLayout() {
  const { backendUrl } = useContext(LocationContext);
  let navigate = useNavigate();

  const handleSearch = (searchTerm, locationInput) => {
    if (!searchTerm.trim()) {
      alert("Please enter a valid search term."); // Consider using a more user-friendly feedback mechanism
      return;
    }
    if (locationInput) {
      navigate(`/search-results?searchTerm=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(locationInput)}`);
    } else {
      navigator.geolocation.getCurrentPosition((position) => {
        navigate(`/search-results?searchTerm=${encodeURIComponent(searchTerm)}&latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`);
      }, (err) => {
        console.error('Geolocation error:', err.message);
        alert('Unable to retrieve your location. Please enter it manually.'); // Consider using a more user-friendly feedback mechanism
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
