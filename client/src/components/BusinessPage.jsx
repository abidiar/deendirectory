import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function BusinessPage() {
  const { id } = useParams();
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    // Fetch the business details based on the id
    // Example: fetch(`https://api.example.com/business/${id}`).then(...);
  }, [id]);

  if (!business) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{business.name}</h1>
      {/* Render other business details */}
    </div>
  );
}

export default BusinessPage;