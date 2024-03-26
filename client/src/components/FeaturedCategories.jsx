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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map(category => (
          <div key={category.id} className="group relative p-4">
            <Link to={`/category/${category.id}`} className="flex flex-col items-center justify-center bg-white rounded-lg shadow hover:shadow-md transition-all">
              <div className="p-6 text-4xl text-primary-dark">{getCategoryIcon(category.name)}</div>
              <h3 className="text-lg font-bold mb-4">{category.name}</h3>
            </Link>
          </div>
        ))}
      </div>
      <div className="text-right">
        <Link to="/categories" className="text-primary-dark hover:text-primary transition-colors">View all categories</Link>
      </div>
    </section>
  );
}

export default FeaturedCategories;
