import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function FeaturedCategories() {
  const [categories, setCategories] = useState([]);
  const defaultImage = 'path_to_your_default_image'; // Update this path

  // Fetch categories regardless of the location
  const fetchCategories = (latitude, longitude) => {
    const latLngQuery = latitude && longitude ? `?lat=${latitude}&lng=${longitude}` : '';
    fetch(`https://deendirectorybackend.onrender.com/api/categories/featured${latLngQuery}`)
      .then(response => response.json())
      .then(data => {
        setCategories(data);
      })
      .catch(error => console.error('Error fetching featured categories:', error));
  };

  // Fetch default categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Try to fetch categories based on the user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          fetchCategories(latitude, longitude);
        },
        error => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-heading font-bold mb-6 text-primary-dark">Featured Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
      {categories.map((category) => (
        <div key={category.id} className="group relative">
          <Link to={`/category/${category.id}`} className="block overflow-hidden rounded-lg shadow-lg">
            <img
              src={category.imageUrl || defaultImage}
              alt={category.name}
              className="w-full h-48 object-cover transition-opacity duration-300 group-hover:opacity-75"
            />
              <div className="absolute bottom-0 left-0 right-0 bg-primary-dark bg-opacity-75 px-4 py-2">
                <h3 className="font-heading font-bold text-center text-white">{category.name}</h3>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <div className="text-right">
        <Link to="/categories" className="text-primary hover:text-primary-dark transition-colors">
          View all categories
        </Link>
      </div>
    </div>
  );
}

export default FeaturedCategories;
