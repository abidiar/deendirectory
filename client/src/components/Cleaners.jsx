// Cleaners.jsx
import React, { useState, useEffect } from 'react';
import Card from './Card';

function Cleaners() {
  const [cleaners, setCleaners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('https://deendirectorybackend.onrender.com/api/services/cleaners')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch cleaners');
        }
        return response.json();
      })
      .then(data => {
        setCleaners(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cleaners.map(cleaner => (
        <Card 
          key={cleaner.id}
          id={cleaner.id}
          title={cleaner.name}
          description={cleaner.description}
          imageUrl={cleaner.image || '/placeholder-cleaner.jpg'}
        />
      ))}
    </div>
  );
}

export default Cleaners;
