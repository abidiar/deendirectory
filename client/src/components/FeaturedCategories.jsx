import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function FeaturedCategories() {
  const [categories, setCategories] = useState([]);
  const featuredCategoryIds = [1, 8, 3, 7, 5]; // The IDs of categories to feature

  useEffect(() => {
    // Function to fetch categories based on location
    const fetchCategories = (latitude, longitude) => {
      fetch(`https://deendirectorybackend.onrender.com/api/categories?lat=${latitude}&lng=${longitude}`)
        .then(response => response.json())
        .then(data => {
          // Filter the categories to only include the featured ones
          const featured = data.filter(category => featuredCategoryIds.includes(category.id));
          setCategories(featured);
        })
        .catch(error => console.error('Error fetching categories:', error));
    };

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          fetchCategories(latitude, longitude);
        },
        error => {
          console.error('Error getting location:', error);
          // Optional: Fetch categories without location if error
          fetchCategories();
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      // Optional: Fetch categories without location if not supported
      fetchCategories();
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-heading font-bold mb-6 text-primary-dark">Featured Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {categories.map((category, index) => (
          <div key={index} className="group relative">
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
