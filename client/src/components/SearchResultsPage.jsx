import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import Card from './Card';

import { LocationContext } from '../context/LocationContext';

function useQuery() {
return new URLSearchParams(useLocation().search);
}

function SearchResultsPage() {
const [searchResults, setSearchResults] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [searchError, setSearchError] = useState('');
const query = useQuery();
const searchTerm = query.get('searchTerm');
const location = query.get('location');
const latitude = query.get('latitude');
const longitude = query.get('longitude');
const { backendUrl } = useContext(LocationContext);

useEffect(() => {
    if (!searchTerm) {
        setSearchError('Search term is missing.');
        return;
    }

    setIsLoading(true);
    let searchUrl = `${backendUrl}/api/search?searchTerm=${encodeURIComponent(searchTerm)}`;

    if (location) {
        searchUrl += `&location=${encodeURIComponent(location)}`;
    } else if (latitude && longitude) {
        searchUrl += `&latitude=${latitude}&longitude=${longitude}`;
    }

    fetch(searchUrl)
        .then(response => response.json())
        .then(data => {
            setSearchResults(data);
            setIsLoading(false);
        })
        .catch(error => {
            setSearchError('Error fetching search results: ' + error.message);
            setIsLoading(false);
        });
}, [searchTerm, location, latitude, longitude, backendUrl]);

return (
    <div>
        {isLoading && <div>Loading search results...</div>}
        {searchError && <div className="text-red-500">{searchError}</div>}
        {!isLoading && searchResults && searchResults.length > 0 && (
            <div className="grid grid-cols
-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{searchResults.map(result => (
<Card
key={result.id}
id={result.id}
title={result.name}
description={result.description}
imageUrl={result.image || '/placeholder-image.jpg'} // Placeholder image
averageRating={result.average_rating}
isHalalCertified={result.is_halal_certified}
/>
))}
</div>
)}
{!isLoading && !searchError && searchResults && searchResults.length === 0 && <div>No results found.</div>}
</div>
);
}

export default SearchResultsPage;