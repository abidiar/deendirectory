import React, { useState, useEffect } from 'react';

function NewNearYou() {
  const [services, setServices] = useState([]);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(success, error);
  }, []);

  function success(position) {
    const { latitude, longitude } = position.coords;
    console.log(`Latitude: ${latitude}, Longitude: ${longitude}`); // Logging the coordinates
    fetchNewNearYouServices(latitude, longitude);
  }

  function error() {
    setLocationError('Unable to retrieve your location');
  }

  function fetchNewNearYouServices(latitude, longitude) {
    const fetchUrl = `https://deendirectorybackend.onrender.com/api/services/new-near-you/?latitude=${latitude}&longitude=${longitude}`;
    console.log(`Fetching data from: ${fetchUrl}`); // Logging the fetch URL

    fetch(fetchUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Data received:', data); // Log the received data
        setServices(data);
      })
      .catch(err => {
        console.error('Fetch Error:', err);
        setLocationError(`Failed to fetch services: ${err.message}`);
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
