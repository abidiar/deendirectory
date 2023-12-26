// Card.jsx
import React from 'react';

function Card({ title, description, imageUrl }) {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg bg-neutral-light transition-transform transform hover:-translate-y-1 hover:shadow-2xl">
      <img className="w-full object-cover h-48" src={imageUrl} alt={title} />
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2 text-primary-dark">{title}</div>
        <p className="text-neutral-dark text-base">
          {description}
        </p>
      </div>
      <div className="px-6 py-4">
        <button className="bg-accent-coral text-white font-bold py-2 px-4 rounded hover:bg-accent-coral-dark">
          Read more
        </button>
      </div>
    </div>
  );
}

export default Card;
