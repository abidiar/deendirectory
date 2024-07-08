import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const EnhancedLink = ({ to, children, onClick, ...props }) => {
  const navigate = useNavigate();
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

  const onMouseEnter = useCallback(() => {
    setStyle(prevStyle => ({
      ...prevStyle,
      backgroundColor: '#f0f0f0',
      color: '#102A43',
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    }));
  }, []);

  const onMouseLeave = useCallback(() => {
    setStyle(prevStyle => ({
      ...prevStyle,
      backgroundColor: 'transparent',
      color: '#233E8B',
      boxShadow: 'none',
    }));
  }, []);

  const handleClick = useCallback((event) => {
    event.preventDefault();
    console.log(`EnhancedLink clicked. Navigating to: ${to}`);
    
    if (onClick) {
      onClick(event);
    }

    // Use a setTimeout to ensure the console.log is visible before navigation
    setTimeout(() => {
      navigate(to);
    }, 100);
  }, [to, onClick, navigate]);

  return (
    <Link
      to={to}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
};

export default EnhancedLink;