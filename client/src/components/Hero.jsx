import React from 'react';
import SearchBar from './SearchBar';

const Hero = ({ onSearch, backendUrl }) => {
  return (
    <div className="relative bg-cover bg-center rounded-lg overflow-hidden" style={{ height: '50vh', backgroundImage: "url('/images/heroimage1.jpg')" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center p-4 bg-black bg-opacity-50">
        <h1 className="text-5xl font-bold text-white mb-4 leading-tight">Find trusted community businesses and services near you.</h1>
        {/* Ensure there's no margin or padding affecting the SearchBar placement */}
        <div className="mt-0">
          <SearchBar onSearch={onSearch} backendUrl={backendUrl} />
        </div>
      </div>
    </div>
  );
};

export default Hero;
