import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function SubcategoryList({ categoryId }) {
  const [subcategories, setSubcategories] = useState([]);

  useEffect(() => {
    fetch(`https://deendirectorybackend.onrender.com/api/categories/${categoryId}/subcategories`)
      .then(response => response.json())
      .then(setSubcategories)
      .catch(console.error);
  }, [categoryId]);

  return (
    <div>
      <h3>Subcategories:</h3>
      <ul>
        {subcategories.map(subcategory => (
          <li key={subcategory.id}>
            <Link to={`/subcategory/${subcategory.id}`}>{subcategory.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SubcategoryList;
