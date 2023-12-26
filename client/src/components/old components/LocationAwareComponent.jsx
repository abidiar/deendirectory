import React, { useState, useEffect } from 'react';
import NewNearYou from './NewNearYou';

function LocationAwareComponent() {
    const [location, setLocation] = useState({ latitude: null, longitude: null });

    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(success, error);
        } else {
            console.error('Geolocation is not supported by your browser');
        }
    }, []);

    function success(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLocation({ latitude, longitude });
    }

    function error() {
        console.error('Unable to retrieve your location');
    }

    return (
        <div>
            {location.latitude && location.longitude ? (
                <NewNearYou latitude={location.latitude} longitude={location.longitude} />
            ) : (
                <p>Loading location...</p>
            )}
        </div>
    );
}

export default LocationAwareComponent;
