import React from 'react';
import Card from './Card'; // Import the Card component

const PopularServices = () => {
  // Placeholder services, you should replace with actual data
  const services = [
    { 
      id: 1, 
      title: 'Plumbing', 
      description: 'High-quality plumbing services. Rating: 4.5', 
      imageUrl: '/path-to-plumbing-service-image.jpg', 
      price: 'Starting from $50' 
    },
    // ... other services
  ];

  return (
    <div className="my-6">
      <h2 className="text-2xl font-bold text-center mb-4">Popular Services Near You</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card 
            key={service.id} 
            title={service.title} 
            description={`${service.description} - ${service.price}`} 
            imageUrl={service.imageUrl} 
          />
        ))}
      </div>
    </div>
  );
};

export default PopularServices;
