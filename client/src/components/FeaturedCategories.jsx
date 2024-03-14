import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function FeaturedCategories() {
  const [categories, setCategories] = useState([]);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // Fetch categories with optional location parameters
    const fetchCategories = (lat, lng) => {
      let url = 'https://deendirectorybackend.onrender.com/api/categories/featured';
      if (lat && lng) {
        url += `?lat=${lat}&lng=${lng}`;
      }
      fetch(url)
        .then(response => response.json())
        .then(data => {
          setCategories(data);
        })
        .catch(error => console.error('Error fetching featured categories:', error));
    };

    // Initially fetch categories without location
    fetchCategories();

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
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

  // If location is updated, refetch categories with location
  useEffect(() => {
    if (location) {
      fetchCategories(location.latitude, location.longitude);
    }
  }, [location]);

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-heading font-bold mb-6 text-primary-dark">Featured Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {categories.map((category) => (
          <div key={category.id} className="group relative">
            <Link to={`/category/${category.id}`} className="block overflow-hidden rounded-lg shadow-lg">
              <img
                src={category.imageUrl || 'default-category-image.jpg'} // Replace with your default image if no imageUrl is present
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
