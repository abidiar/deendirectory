import React from 'react';
import SearchBar from './SearchBar';

const Hero = ({ onSearch }) => {
  return (
    <div className="relative bg-cover bg-center rounded-lg overflow-hidden" style={{ height: '50vh', backgroundImage: "url('/images/heroimage1.jpg')" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center p-4 bg-black bg-opacity-50">
        <h1 className="text-5xl font-bold text-white mb-4">Find trusted Muslim professionals near you.</h1>
        <SearchBar onSearch={onSearch} />
      </div>
    </div>
  );
};

export default Hero;
