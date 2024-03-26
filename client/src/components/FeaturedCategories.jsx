import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaMoneyBillWave, FaSpa, FaUtensils, FaHandshake } from 'react-icons/fa';

function FeaturedCategories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetch('https://deendirectorybackend.onrender.com/api/categories/featured')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setCategories(data))
      .catch(error => console.error('Error fetching featured categories:', error));
  }, []);

  const getCategoryIcon = (categoryName) => {
    const icons = {
      "Home Services": <FaHome />,
      "Financial Services": <FaMoneyBillWave />,
      "Personal Care Services": <FaSpa />,
      "Restaurants": <FaUtensils />,
      "Local Services": <FaHandshake />,
    };
    return icons[categoryName] || <FaHome />; // Fallback icon
  };

  return (
    <section className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-heading font-bold mb-6 text-primary-dark">Featured Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {categories.map(category => (
          <div key={category.id} className="group relative text-center p-4">
            <Link to={`/category/${category.id}`} className="block overflow-hidden rounded-lg shadow-lg flex flex-col items-center justify-center p-4">
              {getCategoryIcon(category.name)}
              <div className="mt-2">
                <h3 className="font-heading font-bold text-primary-dark">{category.name}</h3>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <div className="text-right">
        <Link to="/categories" className="text-primary hover:text-primary-dark transition-colors">View all categories</Link>
      </div>
    </section>
  );
}

export default FeaturedCategories;
