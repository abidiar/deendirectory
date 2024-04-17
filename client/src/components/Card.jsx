import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import StarRating from './StarRating';

// Card component with enhancements for layout and SEO
const Card = ({ id, title, description, imageUrl, averageRating, isHalalCertified, category, phoneNumber, hours }) => {
  const placeholderImage = 'https://via.placeholder.com/150';

  // Function to truncate text to a specified length
  const truncateText = (text, maxLength) => {
    if (typeof text === 'string' && text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  // Function to handle image loading errors
  const handleImageError = (e) => {
    e.target.onerror = null; // Prevents infinite callback loop
    e.target.src = placeholderImage;
  };

  // SEO friendly image alt text
  const imageAltText = `Learn more about ${title}, a ${category} business${isHalalCertified ? ', Halal certified' : ''}.`;

  return (
    <Link to={`/business/${id}`} className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative w-full h-64 overflow-hidden"> {/* Fixed height for uniformity */}
        <img
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={imageUrl || placeholderImage}
          alt={imageAltText} // SEO friendly alt text
          onError={handleImageError}
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h2 className="text-lg font-bold mb-2 text-gray-800">{truncateText(title, 50)}</h2> {/* Use h2 for SEO */}
        <p className="text-gray-600 text-sm mb-2">{truncateText(description, 150)}</p> {/* Show more text */}
        {category && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">
            #{category}
          </span>
        )}
        {phoneNumber && <div className="text-gray-800 text-sm mt-1">📞 {phoneNumber}</div>}
        {hours && <div className="text-gray-800 text-sm mt-1">⏰ {hours}</div>}
        {averageRating !== undefined && (
          <div className="mt-2">
            <StarRating rating={averageRating} />
          </div>
        )}
        {isHalalCertified && (
          <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold mt-2 px-2.5 py-0.5 rounded dark:bg-green-200 dark:text-green-900">
            Halal Certified
          </span>
        )}
      </div>
    </Link>
  );
};

// PropTypes for type checking
Card.propTypes = {
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
  averageRating: PropTypes.number,
  isHalalCertified: PropTypes.bool,
  category: PropTypes.string,
  phoneNumber: PropTypes.string,
  hours: PropTypes.string,
};

export default Card;
