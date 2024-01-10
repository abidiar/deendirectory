import React, { createContext, useState, useEffect } from 'react';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState('');
    const [error, setError] = useState(null);
    
    // Assuming you have a way to determine the backend URL, possibly with an environment variable
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://deendirectorybackend.onrender.com';

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Use the backendUrl for the fetch call
                const response = await fetch(`${backendUrl}/api/reverse-geocode?latitude=${latitude}&longitude=${longitude}`);
                const data = await response.json();
                if (response.ok) {
                    setLocation(data.location);
                } else {
                    setError(data.error || 'Failed to fetch location name');
                }
            } catch (error) {
                setError('Error fetching location');
                console.error('Error fetching location:', error);
            }
        }, (error) => {
            setError('Geolocation error');
            console.error('Geolocation error:', error);
        });
    }, []);

    return (
        <LocationContext.Provider value={{ location, error, backendUrl }}>
            {children}
        </LocationContext.Provider>
    );
};
