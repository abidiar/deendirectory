import React, { useState, useContext, useEffect } from 'react';
import { LocationContext } from '../context/LocationContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

function SearchBar({ onSearch }) {
    const { backendUrl } = useContext(LocationContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationInput, setLocationInput] = useState('');
    const [isHalalCertified, setIsHalalCertified] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms delay

        return () => {
            clearTimeout(timerId);
        };
   
}, [searchTerm]);

useEffect(() => {
    const performSearch = async () => {
        if (!debouncedSearchTerm.trim()) {
            setSearchError('Please enter a search term');
            return;
        }

        setIsLoading(true);
        setSearchError('');

        try {
            const url = `${backendUrl}/api/search?searchTerm=${encodeURIComponent(debouncedSearchTerm.trim())}&location=${encodeURIComponent(locationInput)}&isHalalCertified=${isHalalCertified}`;
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                onSearch(data); // Pass the search result data to the onSearch handler
            } else {
                throw new Error(data.message || 'Error occurred while searching');
            }
        } catch (error) {
            console.error('[SearchBar] Search error:', error);
            setSearchError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (debouncedSearchTerm) {
        performSearch();
    }
}, [debouncedSearchTerm, locationInput, isHalalCertified, backendUrl, onSearch]); // Effect runs on debouncedSearchTerm change


const handleSearch = async (event) => {
    event.preventDefault();
console.log(`[SearchBar] Search initiated with term: ${searchTerm} and location: ${locationInput}, isHalalCertified: ${isHalalCertified}`);

if (!searchTerm.trim()) {
    setSearchError('Please enter a search term');
    return;
}

setIsLoading(true);
setSearchError('');

try {
    const url = `${backendUrl}/api/search?searchTerm=${encodeURIComponent(searchTerm.trim())}&location=${encodeURIComponent(locationInput)}&isHalalCertified=${isHalalCertified}`;
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
        onSearch(data); // Pass the search result data to the onSearch handler
    } else {
       throw new Error(data.message || 'Error occurred while searching');

}
} catch (error) {
console.error('[SearchBar] Search error:', error);
setSearchError(error.message);
} finally {
setIsLoading(false);
}
};

    const handleLocationChange = (e) => {
        setLocationInput(e.target.value);
    };

    return (
        <div className="mt-6">
            <form className="flex flex-col justify-center" onSubmit={handleSearch}>
                <div className="flex items-center rounded-lg shadow-lg w-full max-w-2xl">
                    <input
                        name="searchTerm"
                        type="text"
                        className="flex-grow p-4 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Service or Business"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Search for services or businesses"
                    />
                    <span className="bg-gray-300 w-px h-10 self-center"></span>
                    <input
                        type="text"
                        className="w-1/4 p-4 focus:outline-none focus:ring-2 focus:ring
-primary"
placeholder="Location"
value={locationInput}
onChange={handleLocationChange}
aria-label="Location"
/>
<button
                     type="submit"
                     className="bg-accent-coral text-white rounded-r-lg p-4 hover:bg-accent-coral-dark focus:bg-accent-coral-dark focus:outline-none transition-colors duration-200"
                     disabled={isLoading}
                 >
<FontAwesomeIcon icon={faSearch} />
</button>
</div>
{/* Halal Certified Checkbox */}
<div className="flex justify-center mt-4">
<label className="flex items-center">
<input
type="checkbox"
className="form-checkbox h-5 w-5 text-gray-600 mr-2"
checked={isHalalCertified}
onChange={(e) => setIsHalalCertified(e.target.checked)}
/>
<span className="text-gray-700">Halal Certified Only</span>
</label>
</div>
{isLoading && <div className="text-center">Loading...</div>}
{searchError && <div className="text-red-500 text-center">{searchError}</div>}
</form>
</div>
);
}

export default SearchBar;