// EnhancedLink.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const EnhancedLink = ({ to, children }) => {
  const baseStyle = {
    transition: 'all 0.3s ease',
    padding: '8px 12px',
    borderRadius: '4px',
    display: 'inline-block',
    margin: '0 5px',
    textDecoration: 'none',
    color: '#233E8B',
    backgroundColor: 'transparent',
  };

  const [style, setStyle] = useState(baseStyle);

  const onMouseEnter = () => setStyle({
    ...baseStyle,
    backgroundColor: '#f0f0f0',
    color: '#102A43',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  });

  const onMouseLeave = () => setStyle(baseStyle);

  return (
    <Link to={to} style={style} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
    </Link>
  );
};

export default EnhancedLink;
