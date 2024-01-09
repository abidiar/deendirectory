import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function CategoryPage() {
  const [services, setServices] = useState([]);
  const { categoryId } = useParams();

  useEffect(() => {
    fetch(`https://deendirectorybackend.onrender.com/api/category/${categoryId}/services`)
      .then(response => response.json())
      .then(data => {
        setServices(data);
      })
      .catch(error => console.error('Error fetching services:', error));
  }, [categoryId]);

  return (
    <div className="bg-neutral-light">
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-heading font-bold text-primary-dark mb-8">Services in Category</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <Link to={`/business/${service.id}`} className="no-underline text-neutral-dark">
                <div className="p-6">
                  <h3 className="text-2xl font-heading font-bold text-primary-dark mb-4">{service.name}</h3>
                  <p className="text-sm text-neutral-dark mb-3">{service.description}</p>
                  {/* Additional details and interactive elements can be added here */}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryPage;
