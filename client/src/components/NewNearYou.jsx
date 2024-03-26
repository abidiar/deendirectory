import React, { useState, useEffect } from 'react';
import Card from './Card';

function NewNearYou() {
  const [services, setServices] = useState([]);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(success, error);
  }, []);

  function success(position) {
    const { latitude, longitude } = position.coords;
    fetchNewNearYouServices(latitude, longitude);
  }

  function error() {
    setLocationError('Unable to retrieve your location');
  }

  function fetchNewNearYouServices(latitude, longitude) {
    const limit = 5;
    // Corrected to use template string syntax
    const fetchUrl = `https://deendirectorybackend.onrender.com/api/services/new-near-you/?latitude=${latitude}&longitude=${longitude}&limit=${limit}`;

    fetch(fetchUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setServices(data);
        } else {
          console.error('Data is not an array', data);
        }
      })
      .catch(err => {
        console.error('Failed to fetch services', err);
        setLocationError('Failed to fetch services');
      });
  }

  return (
    <section className="py-6">
      <h2 className="text-2xl font-bold text-primary-dark mb-4">New Near You</h2>
      {locationError ? (
        <div className="text-accent-coral">Error: {locationError}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.isArray(services) ? (
            services.map(service => (
              <Card key={service.id} {...service} />
            ))
          ) : (
            <div>No new services available.</div>
          )}
        </div>
      )}
    </section>
  );
}

export default NewNearYou;
  