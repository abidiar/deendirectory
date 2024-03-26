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
      <h2 className="text-2xl font-bold mb-6 text-primary-dark">Featured Categories</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mb-6">
        {categories.map(category => (
          <Link key={category.id} to={`/category/${category.id}`} className="group block bg-white rounded-lg shadow hover:shadow-md transition-all p-4 flex items-center justify-center text-center">
            <div className="w-full">
              <div className="text-primary-dark text-3xl mx-auto">{getCategoryIcon(category.name)}</div>
              <h3 className="mt-2 text-sm font-bold">{category.name}</h3>
            </div>
          </Link>
        ))}
      </div>
      <div className="text-right">
        <Link to="/categories" className="text-primary-dark hover:text-primary transition-colors">View all categories</Link>
      </div>
    </section>
  );
}

export default FeaturedCategories;
