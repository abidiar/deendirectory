import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const EnhancedLink = ({ to, children, onClick, ...props }) => {
  const navigate = useNavigate();
  console.log(`EnhancedLink rendered with to=${to}`);  // Log when component renders

  const [style, setStyle] = useState({
    transition: 'all 0.3s ease',
    padding: '8px 12px',
    borderRadius: '4px',
    display: 'inline-block',
    margin: '0 5px',
    textDecoration: 'none',
    color: '#233E8B',
    backgroundColor: 'transparent',
  });

  const handleClick = useCallback((event) => {
    console.log(`EnhancedLink clicked. Attempting to navigate to: ${to}`);
    event.preventDefault();
    
    if (onClick) {
      console.log('Calling provided onClick function');
      onClick(event);
    }

    console.log('About to call navigate function');
    navigate(to);
    console.log('Navigate function called');
  }, [to, onClick, navigate]);

  return (
    <Link
      to={to}
      style={style}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export default EnhancedLink;