import React, { useState } from 'react';

function Tooltip({ text }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative flex items-center ml-2">
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-gray-300 text-gray-700 rounded-full p-1 cursor-pointer"
      >
        <span>ℹ️</span>
      </div>
      {isHovered && (
        <div className="absolute z-10 w-64 p-2 left-full ml-2 bottom-0 transform translate-y-1/2 bg-black text-white text-sm rounded-md shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
}

export default Tooltip;
