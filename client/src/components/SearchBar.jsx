import React, { useState, useContext } from 'react';
import { LocationContext } from '../context/LocationContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

function SearchBar({ onSearch }) {
    const { backendUrl } = useContext(LocationContext);
    const [searchTerm, setSearchTerm] = useState(''); // Ensure this is always a string
    const [locationInput, setLocationInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    const handleSearch = async (event) => {
        event.preventDefault();

        // Defensive programming: Check if searchTerm is a string and then trim
        const currentSearchTerm = typeof searchTerm === 'string' ? searchTerm.trim() : '';
        
        console.log('Search Term before onSearch call:', currentSearchTerm);

        if (!currentSearchTerm) {
            setSearchError('Please enter a search term');
            return;
        }

        setIsLoading(true);
        setSearchError('');

        try {
            const url = `${backendUrl}/api/search?searchTerm=${encodeURIComponent(currentSearchTerm)}&location=${encodeURIComponent(locationInput)}`;
            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                onSearch(data);
            } else {
                throw new Error(data.message || 'Error occurred while searching');
            }
        } catch (error) {
            console.error('Search error:', error);
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
            <form className="flex justify-center" onSubmit={handleSearch}>
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
                        className="w-1/4 p-4 focus:outline-none focus:ring-2 focus:ring-primary"
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
                {isLoading && <div>Loading...</div>}
                {searchError && <div className="text-red-500">{searchError}</div>}
            </form>
        </div>
    );
}

export default SearchBar;
