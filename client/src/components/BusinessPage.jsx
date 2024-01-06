// BusinessPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function BusinessPage() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    fetch(`https://deendirectorybackend.onrender.com/api/business/${id}`)
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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>{business.name}</h1>
      <p>{business.description}</p>
      {/* Add more details you want to display */}
    </div>
  );
}

export default BusinessPage;
