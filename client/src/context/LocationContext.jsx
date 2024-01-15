import React, { createContext, useState, useEffect } from 'react';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://deendirectorybackend.onrender.com';

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
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
            setIsLoading(false);
        }, (error) => {
            setError('Geolocation error: ' + error.message);
            setIsLoading(false);
        });
    }, []);

    return (
        <LocationContext.Provider value={{ location, error, isLoading, backendUrl }}>
            {children}
        </LocationContext.Provider>
    );
};
