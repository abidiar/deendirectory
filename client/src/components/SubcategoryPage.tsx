import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function SubcategoryPage() {
  const [services, setServices] = useState([]);
  const [subcategory, setSubcategory] = useState({});
  const { subcategoryId } = useParams();

  useEffect(() => {
    // Fetch subcategory details
    fetch(`https://deendirectorybackend.onrender.com/api/subcategories/${subcategoryId}`)
      .then(response => response.json())
      .then(data => {
        setSubcategory(data);
      })
      .catch(error => console.error('Error fetching subcategory details:', error));

    // Fetch services for the subcategory
    fetch(`https://deendirectorybackend.onrender.com/api/services/subcategory/${subcategoryId}`)
    .then(response => response.json())
    .then(data => {
      setServices(data);
    })
    .catch(error => console.error('Error fetching services:', error));
}, [subcategoryId]);

return (
  <div className="container mx-auto px-4 py-6">
    <h2 className="text-2xl font-heading font-bold mb-6 text-primary-dark">
      {subcategory.name ? `Services in ${subcategory.name}` : 'Services'}
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
      {services.map(service => (
        <div key={service.id} className="group relative">
          {/* Render each service here */}
          <div className="p-4 border rounded-lg shadow-lg">
            <h3 className="font-heading font-bold">{service.name}</h3>
            {/* Additional service details can be rendered here */}
          </div>
        </div>
      ))}
    </div>
  </div>
);
}

export default SubcategoryPage;