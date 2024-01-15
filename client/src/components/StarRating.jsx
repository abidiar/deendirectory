import React from 'react';

const StarRating = ({ rating }) => {
    const totalStars = 5;
    let stars = [];
    for (let i = 1; i <= totalStars; i++) {
        if (i <= rating) {
            stars.push(<i key={i} className="fas fa-star text-accent-coral"></i>); // full star
        } else if (i -
0.5 === rating) {
stars.push(<i key={i} className="fas fa-star-half-alt text-accent-coral"></i>); // half star
} else {
stars.push(<i key={i} className="far fa-star text-accent-coral"></i>); // empty star
}
}
return <div className="flex">{stars}</div>;
};

export default StarRating;