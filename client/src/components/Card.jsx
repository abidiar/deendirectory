import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';

function Card({
  id, 
  title, 
  description, 
  imageUrl, 
  averageRating, 
  isHalalCertified, 
  category, 
  location, 
  phoneNumber, 
  hours
}) {
  // A placeholder image from a public domain to ensure a fallback
  const placeholderImage = 'https://via.placeholder.com/150';

  // Function to truncate text that exceeds a certain length
  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Handles image load errors by replacing the src with a placeholder
  const handleImageError = (e) => {
    e.target.src !== placeholderImage && (e.target.src = placeholderImage);
  };

  return (
    <Link to={`/business/${id}`} className="no-underline hover:underline">
      <div className="max-w-sm rounded overflow-hidden shadow-lg bg-neutral-light transition ease-in-out duration-300 hover:-translate-y-1 hover:shadow-xl">
        <img className="w-full object-cover h-48" src={imageUrl || placeholderImage} alt={`Image for ${title}`} onError={handleImageError} />
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2 text-primary-dark">{truncateText(title, 50)}</div>
          <p className="text-neutral-dark text-base">{truncateText(description, 100)}</p>
          {category && <span className="text-accent-sky text-sm mr-2">#{category}</span>}
          {location && <span className="text-accent-coral text-sm mr-2">{location}</span>}
          {phoneNumber && <div className="text-neutral-dark text-sm">📞 {phoneNumber}</div>}
          {hours && <div className="text-neutral-dark text-sm">⏰ {hours}</div>}
          {averageRating !== undefined && (
            <div className="mt-2">
              <StarRating rating={averageRating} />
            </div>
          )}
          {isHalalCertified && (
            <span className="mt-2 inline-block bg-accent-coral text-white text-xs font-bold rounded-full px-3 py-1">
              Halal Certified
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default Card;
