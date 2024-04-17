import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import StarRating from './StarRating';

const Card = ({ id, title, description, imageUrl, averageRating, isHalalCertified, category, phoneNumber, hours }) => {
  const placeholderImage = 'https://via.placeholder.com/150';

  const truncateText = (text, maxLength) => {
    if (typeof text === 'string' && text.length > maxLength) {
      return text.substring(0, maxLength) + '...';
    }
    return text;
  };

  const handleImageError = (e) => {
    e.target.src !== placeholderImage && (e.target.src = placeholderImage);
  };

  return (
    <Link to={`/business/${id}`} className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative w-full pt-[100%] overflow-hidden">
        <img
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={imageUrl || placeholderImage}
          alt={`Image for ${title}`}
          onError={handleImageError}
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2 text-gray-800">{truncateText(title, 50)}</h3>
        <p className="text-gray-600 text-sm mb-2">{truncateText(description, 100)}</p>
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