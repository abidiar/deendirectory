import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function FeaturedCategories() {
  const [categories, setCategories] = useState([]);
  const featuredCategoryIds = '1,8,3,7,5'; // A comma-separated string of the featured category IDs

  useEffect(() => {
    // Fetch specific featured categories from API
    fetch(`https://deendirectorybackend.onrender.com/api/categories?ids=${featuredCategoryIds}`)
      .then(response => response.json())
      .then(data => {
        // Assuming that the API returns categories with a field 'subcategories' for each category
        setCategories(data.filter(category => category.subcategories.length > 0));
      })
      .catch(error => console.error('Error fetching featured categories:', error));
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-heading font-bold mb-6 text-primary-dark">Featured Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {categories.map((category, index) => (
          <div key={index} className="group relative">
            <div className="block overflow-hidden rounded-lg shadow-lg">
              <img
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-48 object-cover transition-opacity duration-300 group-hover:opacity-75"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-primary-dark bg-opacity-75 px-4 py-2">
                <h3 className="font-heading font-bold text-center text-white">{category.name}</h3>
              </div>
            </div>
            <div className="mt-3">
              <strong>Subcategories:</strong>
              <ul className="list-disc pl-5">
                {category.subcategories.map(subcategory => (
                  <li key={subcategory.id}>
                    <Link to={`/subcategory/${subcategory.id}`} className="text-primary hover:text-primary-dark transition-colors">
                      {subcategory.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
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
