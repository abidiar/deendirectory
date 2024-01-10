import React, { useState, useContext } from 'react';
import { LocationContext } from '../context/LocationContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

function SearchBar({ onSearch }) {
    const { location } = useContext(LocationContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    const handleSearch = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setSearchError('');

        try {
            // Construct the API URL based on your backend route for searching
            const url = `/api/search?searchTerm=${encodeURIComponent(searchTerm)}&location=${encodeURIComponent(location)}`;
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                onSearch(data); // Assuming `onSearch` is a prop function to handle search results
                setIsLoading(false);
            } else {
                throw new Error(data.message || 'Error occurred while searching');
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchError(error.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-6">
            <form className="flex justify-center" onSubmit={handleSearch}>
                <div className="flex items-center rounded-lg shadow-lg w-full max-w-2xl">
                    <input
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
                        className="w-1/4 p-4 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Location"
                        value={location}
                        onChange={(e) => {/* handle location change if needed */}}
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
                {isLoading && <div>Loading...</div>}
                {searchError && <div className="text-red-500">{searchError}</div>}
            </form>
        </div>
    );
}

export default SearchBar;
