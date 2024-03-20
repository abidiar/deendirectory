// Babysitters.jsx
import React, { useState, useEffect } from 'react';
import Card from './Card';

function Babysitters() {
  const [babysitters, setBabysitters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('https://deendirectorybackend.onrender.com/api/services/babysitters')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch babysitters');
        }
        return response.json();
      })
      .then(data => {
        setBabysitters(data);
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
      {babysitters.map(babysitter => (
        <Card 
          key={babysitter.id}
          id={babysitter.id}
          title={babysitter.name}
          description={babysitter.description}
          imageUrl={babysitter.image || '/placeholder-babysitter.jpg'}
        />
      ))}
    </div>
  );
}

export default Babysitters;
