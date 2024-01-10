import React, { createContext, useState, useEffect } from 'react';

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [location, setLocation] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const response = await fetch(`/api/reverse-geocode?latitude=${latitude}&longitude=${longitude}`);
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
        <LocationContext.Provider value={{ location, error }}>
            {children}
        </LocationContext.Provider>
    );
};
