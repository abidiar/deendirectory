import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from './Card';

function CategoryPage() {
    const { categoryId } = useParams();
    const [businesses, setBusinesses] = useState([]);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ latitude, longitude });
                },
                error => {
                    console.error('Error getting location:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }, []);

    useEffect(() => {
        // Only fetch businesses if userLocation is set
        if (userLocation && categoryId) {
            fetch(`https://deendirectorybackend.onrender.com/api/category/${categoryId}/businesses?lat=${userLocation.latitude}&lng=${userLocation.longitude}`)
                .then(response => response.json())
                .then(data => setBusinesses(data))
                .catch(error => console.error('Error:', error));
        }
    }, [categoryId, userLocation]);

    return (
        <div className="bg-neutral-light">
            <div className="container mx-auto py-10">
                <h1 className="text-4xl font-heading font-bold text-primary-dark mb-8">Services in Category</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {businesses.map((business) => (
                        <Card
                            key={business.id}
                            id={business.id}
                            title={business.name}
                            description={business.description}
                            imageUrl={business.imageUrl}
                            averageRating={business.average_rating}
                            isHalalCertified={business.is_halal_certified}
                            category={business.category?.name}
                            phoneNumber={business.phone_number}
                            hours={business.hours}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CategoryPage;