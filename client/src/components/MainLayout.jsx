import React from 'react';
import Hero from './Hero';
import FeaturedCategories from './FeaturedCategories';
import NewNearYou from './NewNearYou';
import ProfessionalCallToAction from './ProfessionalCallToAction';

function MainLayout() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Hero />
      {/* Increased space between Hero and Featured Categories */}
      <div className="my-12"> {/* Adjust 'my-12' to increase or decrease space */}
        <FeaturedCategories />
      </div>
      <hr className="my-8 border-neutral-dark" />
      <NewNearYou />
      <hr className="my-8 border-neutral-dark" />
      <ProfessionalCallToAction /> 
    </div>
  );
}

export default MainLayout;
