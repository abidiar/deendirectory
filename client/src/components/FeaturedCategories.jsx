import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const mainCategories = [
  'Home Services',
  'Professional Services',
  'Financial Services',
  'Health Services',
  'Personal Care Services',
];

// Placeholder data for subcategories
const subCategoriesData = {
  'Home Services': [
    { name: 'Babysitters', imageUrl: '/images/subcategories/home/babysitter.jpg', route: '/home-services/babysitters' },
    { name: 'Cleaners', imageUrl: '/images/subcategories/home/cleaners.jpg', route: '/home-services/cleaners' },
    { name: 'Landscaping', imageUrl: '/images/subcategories/home/landscaping.jpg', route: '/home-services/landscaping' },
    { name: 'Handyman', imageUrl: '/images/subcategories/home/handyman.jpg', route: '/home-services/handyman' },
    { name: 'Pest Control', imageUrl: '/images/subcategories/home/pest-control.jpg', route: '/home-services/pest-control' },
  ],
  'Professional Services': [
    { name: 'Legal Consulting', imageUrl: '/images/subcategories/professional/legalconsulting.jpg', route: '/professional-services/legal-consulting' },
    { name: 'Event Planning', imageUrl: '/images/subcategories/professional/event-planning.jpg', route: '/professional-services/event-planning' },
    { name: 'Marketing', imageUrl: '/images/subcategories/professional/marketing.jpg', route: '/professional-services/marketing' },
    { name: 'IT Support', imageUrl: '/images/subcategories/professional/it-support.jpg', route: '/professional-services/it-support' },
    { name: 'Design Services', imageUrl: '/images/subcategories/professional/design-services.jpg', route: '/professional-services/design-services' },
  ],
  'Financial Services': [
    { name: 'Tax Preparation', imageUrl: '/images/subcategories/financial/tax-preparation.jpg', route: '/financial-services/tax-preparation' },
    { name: 'Investment Planning', imageUrl: '/images/subcategories/financial/investment-planning.jpg', route: '/financial-services/investment-planning' },
    { name: 'Insurance', imageUrl: '/images/subcategories/financial/insurance.jpg', route: '/financial-services/insurance' },
    { name: 'Loans & Mortgages', imageUrl: '/images/subcategories/financial/loans-mortgages.jpg', route: '/financial-services/loans-mortgages' },
    { name: 'Retirement Planning', imageUrl: '/images/subcategories/financial/retirement-planning.jpg', route: '/financial-services/retirement-planning' },
  ],
  'Health Services': [
    { name: 'Dental Care', imageUrl: '/images/subcategories/health/dental-care.jpg', route: '/health-services/dental-care' },
    { name: 'Physical Therapy', imageUrl: '/images/subcategories/health/physical-therapy.jpg', route: '/health-services/physical-therapy' },
    { name: 'Mental Health', imageUrl: '/images/subcategories/health/mental-health.jpg', route: '/health-services/mental-health' },
    { name: 'Nutritionists', imageUrl: '/images/subcategories/health/nutritionists.jpg', route: '/health-services/nutritionists' },
    { name: 'Home Care', imageUrl: '/images/subcategories/health/home-care.jpg', route: '/health-services/home-care' },
  ],
  'Personal Care Services': [
    { name: 'Hair Salons', imageUrl: '/images/subcategories/personal/hair-salons.jpg', route: '/personal-care/hair-salons' },
    { name: 'Spa & Massage', imageUrl: '/images/subcategories/personal/spa-massage.jpg', route: '/personal-care/spa-massage' },
    { name: 'Nail Salons', imageUrl: '/images/subcategories/personal/nail-salons.jpg', route: '/personal-care/nail-salons' },
    { name: 'Skin Care', imageUrl: '/images/subcategories/personal/skin-care.jpg', route: '/personal-care/skin-care' },
    { name: 'Personal Training', imageUrl: '/images/subcategories/personal/personal-training.jpg', route: '/personal-care/personal-training' },
  ],
};

function FeaturedCategories() {
  const [activeCategory, setActiveCategory] = useState(mainCategories[0]);
  const [activeSubCategories, setActiveSubCategories] = useState(subCategoriesData[activeCategory]);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setActiveSubCategories(subCategoriesData[category]);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-heading font-bold mb-6 text-primary-dark">Categories</h2>
      <div className="flex overflow-x-auto mb-6">
        {mainCategories.map((category, index) => (
          <button
            key={index}
            onClick={() => handleCategoryClick(category)}
            className={`whitespace-nowrap px-4 py-2 font-semibold rounded-full mr-2 ${
              activeCategory === category ? 'bg-primary text-white' : 'bg-neutral-light text-primary-dark'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {activeSubCategories.map((subCategory, index) => (
          <div key={index} className="relative group mb-6">
            {/* Bottom margin for spacing */}
            <Link to={subCategory.route}>
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