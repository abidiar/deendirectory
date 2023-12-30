import React, { useState, useEffect } from 'react';

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
    fetch(`https://deendirectorybackend.onrender.com/services/api/services/new-near-you?latitude=${latitude}&longitude=${longitude}`)
      .then(response => response.json())
      .then(data => setServices(data))
      .catch(err => {
        console.error('Error:', err);
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
        {services.map((service, index) => (
          <div key={service.id} className="max-w-sm rounded overflow-hidden shadow-lg bg-neutral-light p-6">
            <div className="font-bold text-xl mb-2 text-neutral-dark">{service.name}</div>
            <p className="text-neutral-dark text-base">{service.description}</p>
            {/* Additional details can be added here */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewNearYou;
