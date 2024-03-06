// NewNearYou.jsx
import React, { useState, useEffect } from 'react';
import Card from './Card'; // Import the Card component

function NewNearYou() {
  const [services, setServices] = useState([]);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(success, error);
  }, []);

  function success(position) {
    let { latitude, longitude } = position.coords;
    latitude = parseFloat(latitude.toFixed(6));
    longitude = parseFloat(longitude.toFixed(6));
    fetchNewNearYouServices(latitude, longitude);
  }

  function error() {
    setLocationError('Unable to retrieve your location');
  }

  function fetchNewNearYouServices(latitude, longitude) {
    const limit = 5;
    const fetchUrl = `https://deendirectorybackend.onrender.com/api/services/new-near-you/?latitude=${latitude}&longitude=${longitude}`;

    fetch(fetchUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        return response.json();
      })
      .then(data => {
        setServices(data);
      })
      .catch(err => {
        setLocationError('Failed to fetch services');
      });
  }

  if (locationError) {
    return <div className="text-accent-coral">Error: {locationError}</div>;
  }

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold text-primary-dark mb-4">New Near You</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {services.map((service) => (
          <Card
            key={service.id}
            id={service.id}
            title={service.name}
            description={service.description}
            imageUrl={service.imageUrl} // Replace this with your actual image URL field
          />
        ))}
      </div>
    </div>
  );
}

export default NewNearYou;
