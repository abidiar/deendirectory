import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function BusinessPage() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://deendirectorybackend.onrender.com';

  useEffect(() => {
    setIsLoading(true);
    fetch(`${backendUrl}/api/services/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then(data => {
        setBusiness(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(`Error: ${err.message}`);
        setIsLoading(false);
      });
  }, [id, backendUrl]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!business) {
    return <div>Business not found.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col items-center mb-4">
          <img
            src={business.image_url || '/path/to/placeholder-image.jpg'}
            alt={`Profile for ${business.name}`}
            className="rounded-full h-32 w-32 object-cover"
          />
          <h1 className="text-4xl font-heading font-bold text-primary-dark mt-4">{business.name}</h1>
          {business.is_halal_certified && (
            <span className="bg-accent-green text-white text-sm rounded-full px-3 py-1">Halal Certified</span>
          )}
        </div>
        <p className="text-neutral-dark mb-4">{business.description}</p>
        <div className="text-neutral-dark mb-4">
          <strong>Category:</strong> {business.category ? business.category.name : 'N/A'}
        </div>
        <div className="text-neutral-dark mb-4">
          <strong>Address:</strong> {`${business.street_address}, ${business.city}, ${business.state} ${business.postal_code}, ${business.country}`}
        </div>
        <div className="text-neutral-dark mb-4">
          <strong>Phone Number:</strong> {business.phone_number}
        </div>
        <div className="text-neutral-dark mb-4">
          <strong>Website:</strong> <a href={business.website} target="_blank" rel="noopener noreferrer">{business.website}</a>
        </div>
        <div className="text-neutral-dark">
          <strong>Hours:</strong> {business.hours}
        </div>
        {/* Here you can add more sections like reviews, map location, etc. */}
      </div>
    </div>
  );
}

export default BusinessPage;
