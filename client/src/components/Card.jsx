import React from 'react';
import { Link } from 'react-router-dom';

function Card({ id, title, description, imageUrl }) {
  return (
    <Link to={`/business/${id}`} className="no-underline">
      <div className="max-w-sm rounded overflow-hidden shadow-lg bg-neutral-light transition-transform transform hover:-translate-y-1 hover:shadow-2xl">
        <img className="w-full object-cover h-48" src={imageUrl} alt={title} />
        <div className="px-6 py-4">
          <div className="font-bold text-xl mb-2 text-primary-dark">{title}</div>
          <p className="text-neutral-dark text-base">{description}</p>
        </div>
        {/* Button or additional content */}
      </div>
    </Link>
  );
}

export default Card;
