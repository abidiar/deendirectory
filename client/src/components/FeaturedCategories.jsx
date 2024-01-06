import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function FeaturedCategories() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubCategories, setActiveSubCategories] = useState([]);

  useEffect(() => {
    // Fetch categories from API
    fetch('https://deendirectorybackend.onrender.com/api/categories')
      .then(response => response.json())
      .then(data => {
        setCategories(data);
        // Ensure data[0] and data[0].subcategories are defined and are arrays
        if (data.length > 0 && Array.isArray(data[0].subcategories)) {
          setActiveCategory(data[0].name);
          setActiveSubCategories(data[0].subcategories);
        }
      })
      .catch(error => console.error('Error fetching categories:', error));
  }, []);

  const handleCategoryClick = (categoryName) => {
    const selectedCategory = categories.find(category => category.name === categoryName);
    setActiveCategory(categoryName);
    // Ensure selectedCategory.subcategories is defined and is an array
    setActiveSubCategories(Array.isArray(selectedCategory?.subcategories) ? selectedCategory.subcategories : []);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-heading font-bold mb-6 text-primary-dark">Categories</h2>
      <div className="flex overflow-x-auto mb-6">
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => handleCategoryClick(category.name)}
            className={`whitespace-nowrap px-4 py-2 font-semibold rounded-full mr-2 ${
              activeCategory === category.name ? 'bg-primary text-white' : 'bg-neutral-light text-primary-dark'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {activeSubCategories.map((subCategory, index) => (
          <div key={index} className="relative group mb-6">
            <Link to={`/category/${subCategory.id}`}> {/* Update link to use category ID */}
              <img
                src={subCategory.imageUrl}
                alt={subCategory.name}
                className="w-full h-48 object-cover rounded-lg group-hover:opacity-75 mb-2"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-primary-dark bg-opacity-75 p-4">
                <h3 className="font-heading font-bold text-center text-white">{subCategory.name}</h3>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeaturedCategories;
