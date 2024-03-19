// ProfessionalCallToAction.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProfessionalCallToAction() {
  let navigate = useNavigate();

  return (
    <div className="bg-neutral-light py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-heading font-bold text-primary-dark mb-4">Are you a community professional or service provider?</h2>
          <p className="mb-6 text-neutral-dark">Connect with the community and grow your business.</p>
          <button 
            className="bg-accent-coral text-white font-bold py-2 px-6 rounded hover:bg-accent-coral-dark transition-colors duration-200"
            onClick={() => navigate('/business-sign-in')}
          >
            Join Our Network
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalCallToAction;
