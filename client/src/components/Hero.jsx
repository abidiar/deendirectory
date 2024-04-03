import React from 'react';

const Hero = () => {
  return (
    <section className="relative bg-cover bg-center rounded-lg overflow-hidden" style={{ height: '50vh', backgroundImage: "url('/images/heroimage1.jpg')" }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center p-4 bg-black bg-opacity-50">
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 leading-tight">
          Find trusted community businesses and services near you.
        </h1>
      </div>
    </section>
  );
};

export default Hero;