import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function CategoryPage() {
  const [services, setServices] = useState([]);
  const { categoryId } = useParams();

  useEffect(() => {
    // Fetch services in the selected category and its subcategories
    fetch(`https://deendirectorybackend.onrender.com/api/category/${categoryId}/services`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Services not found');
        }
        return response.json();
      })
      .then(data => {
        setServices(data);
      })
      .catch(error => console.error('Error fetching services:', error));
  }, [categoryId]);

  // Render services
  return (
    <div>
      <h2>Services in Category</h2>
      {services.map(service => (
        <div key={service.id}>
          <h3>{service.name}</h3>
          <p>{service.description}</p>
          {/* Render additional service details here */}
        </div>
      ))}
    </div>
  );
}

export default CategoryPage;
