import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from './StarRating';

function Card({ id, title, description, _Url, averageRating, isHalalCertified, category, location, phoneNumber, hours }) {
  // Placeholder image URL (replace with your own placeholder image URL if needed)
  const placeholderImage = '/path/to/placeholder-image.jpg';

  // Function to truncate description text
  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <Link to={`/business/${id}`} className="no-underline hover:underline">
      <div className="max-w-sm rounded overflow-hidden shadow-lg bg-neutral-light transition-transform transform hover:-translate-y-1 hover:shadow-2xl">
      <img className="w-full object-cover h-48" src={image_url} alt={`Image for ${title}`} />
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2 text-primary-dark">{title}</div>
          <p className="text-neutral-dark text-base">{truncateText(description, 100)}</p>
          {category && <p className="text-neutral-dark text-base">Category: {category}</p>}
          {location && <p className="text-neutral-dark text-base">Location: {location}</p>}
          {phoneNumber && <p className="text-neutral-dark text-base">Contact: {phoneNumber}</p>}
          {hours && <p className="text-neutral-dark text-base">Hours: {hours}</p>}
          {averageRating && (
            <div className="mt-2">
              <StarRating rating={averageRating} />
            </div>
          )}
          {isHalalCertified && (
            <div className="mt-2 bg-accent-green text-white text-sm rounded-full px-3 py-1">
              Halal Certified
            </div>
          )}
        </div>
        {/* Additional content or buttons can be added here */}
      </div>
    </Link>
  );
}

export default Card;
