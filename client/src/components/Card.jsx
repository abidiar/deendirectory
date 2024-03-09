import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';

function Card({ id, title, description, imageUrl, averageRating, isHalalCertified, category, location, phoneNumber, hours }) {
  // Replace with a valid placeholder image URL
  const placeholderImage = 'https://your-domain.com/path/to/placeholder-image.jpg';

  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const handleImageError = (e) => {
    // Set the placeholder image only if it's different from the current source
    if (e.target.src !== placeholderImage) {
      e.target.src = placeholderImage;
    }
  };

  return (
    <Link to={`/business/${id}`} className="no-underline hover:underline" aria-label={`View details for ${title}`}>
      <div className="max-w-sm rounded overflow-hidden shadow-lg bg-neutral-light transition-transform transform hover:-translate-y-1 hover:shadow-2xl">
        <img className="w-full object-cover h-48" src={imageUrl || placeholderImage} alt={`Image for ${title}`} onError={handleImageError} />
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2 text-primary-dark">{title}</div>
          <p className="text-neutral-dark text-base">{truncateText(description, 100)}</p>
          {category && <p className="text-neutral-dark text-base">Category: {category}</p>}
          {location && <p className="text-neutral-dark text-base">Location: {location}</p>}
          {phoneNumber && <p className="text-neutral-dark text-base">Contact: {phoneNumber}</p>}
          {hours && <p className="text-neutral-dark text-base">Hours: {hours}</p>}
          {averageRating && <StarRating rating={averageRating} />}
          {isHalalCertified && (
            <div className="mt-2 bg-accent-green text-white text-sm rounded-full px-3 py-1">
              Halal Certified
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default Card;
