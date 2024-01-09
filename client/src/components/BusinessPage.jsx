import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function BusinessPage() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    fetch(`https://deendirectorybackend.onrender.com/api/services/${id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Business not found');
        }
        return response.json();
      })
      .then(data => {
        setBusiness(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-heading text-primary-dark">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-heading text-accent-coral">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-light min-h-screen">
      <div className="container mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h1 className="text-4xl font-heading font-bold text-primary-dark mb-4">{business.name}</h1>
          <p className="text-neutral-dark">{business.description}</p>
          {/* Add more details you want to display */}
        </div>
        {/* Add other sections or components related to the business here */}
      </div>
    </div>
  );
}

export default BusinessPage;
