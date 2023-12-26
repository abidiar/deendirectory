// PopularServices.js
const PopularServices = () => {
  // Placeholder services, you should replace with actual data
  const services = [
    { name: 'Plumbing', image: '/path-to-plumbing-service-image.jpg', rating: '4.5', price: 'Starting from $50' },
    // ... other services
  ];

  return (
    <div className="my-6">
      <h2 className="text-2xl font-bold text-center mb-4">Popular Services Near You</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.map((service, index) => (
          <div key={index} className="max-w-sm rounded overflow-hidden shadow-lg">
            <img className="w-full" src={service.image} alt={service.name} />
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">{service.name}</div>
              <p className="text-gray-700 text-base">
                Rating: {service.rating}
              </p>
              <p className="text-gray-700 text-base">
                {service.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularServices;
