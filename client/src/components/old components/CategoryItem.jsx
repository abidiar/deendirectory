// CategoryItem.js
import React, { useState } from 'react';

const CategoryItem = ({ name, subcategories }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsDropdownVisible(true)}
      onMouseLeave={() => setIsDropdownVisible(false)}
      className="relative inline-block text-left"
    >
      <div className="cursor-pointer px-4 py-2 rounded-md text-sm font-medium text-dark hover:bg-accent-coral focus:outline-none focus:bg-accent-coral">
        {name}
      </div>

      {isDropdownVisible && (
        <div className="absolute z-50 mt-1 w-44 bg-white rounded-md shadow-lg">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {subcategories.map((subcategory, index) => (
              <a
                key={index}
                href="#"
                className="block px-4 py-2 text-sm text-dark hover:bg-accent-coral"
                role="menuitem"
              >
                {subcategory}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryItem;
