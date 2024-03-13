import React from 'react';
import PropTypes from 'prop-types';

const Skeleton = ({ count }) => {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
      ))}
    </div>
  );
};

Skeleton.propTypes = {
  count: PropTypes.number.isRequired,
};

export default Skeleton;