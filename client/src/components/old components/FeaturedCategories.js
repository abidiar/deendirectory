// FeaturedCategories.js
const FeaturedCategories = () => {
  // Placeholder categories, you should replace with actual data
  const categories = [
    { name: 'Handyperson', image: '/path-to-handyperson-image.jpg' },
    // ... other categories
  ];

  return (
    <div className="flex justify-around flex-wrap my-6">
      {categories.map((category, index) => (
        <div key={index} className="max-w-sm rounded overflow-hidden shadow-lg my-2">
          <img className="w-full" src={category.image} alt={category.name} />
          <div className="px-6 py-4">
            <div className="font-bold text-xl mb-2">{category.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeaturedCategories;
