import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function CategoryPage() {
  const [businesses, setBusinesses] = useState([]);
  const { categoryId } = useParams();

  useEffect(() => {
    // Fetch businesses in the selected category and its subcategories
    fetch(`https://deendirectorybackend.onrender.com/api/category/${categoryId}/businesses`)
      .then(response => response.json())
      .then(data => {
        setBusinesses(data);
      })
      .catch(error => console.error('Error fetching businesses:', error));
  }, [categoryId]);

  // Render businesses...
}

export default CategoryPage;
