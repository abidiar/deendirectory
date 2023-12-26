// CategoryList.js
import React from 'react';
import CategoryItem from './CategoryItem'; // Make sure to import CategoryItem correctly

// Subcategories should be provided for each category
const categoriesWithSub = [
  { name: 'Home Services', subcategories: ['Plumbing', 'Electrical'] },
  { name: 'Handymen', subcategories: ['Repairs', 'Installations'] },
  { name: 'Junk Hauling', subcategories: ['Waste', 'Recycling'] },
  { name: 'Event Planning Services', subcategories: ['Weddings', 'Corporate Events'] },
  { name: 'Articles & Resources', subcategories: ['How-to', 'Guides' ] },
  // ... other categories with their subcategories
];

function CategoryList() {
  return (
    <div className="bg-neutral-light py-3 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start space-x-4">
          {categoriesWithSub.map((category, index) => (
            <CategoryItem key={index} name={category.name} subcategories={category.subcategories} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryList;
