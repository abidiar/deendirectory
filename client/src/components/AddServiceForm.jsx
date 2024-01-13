import React, { useState, useEffect, useContext } from 'react';
import { LocationContext } from '../context/LocationContext';

function AddServiceForm() {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        city: '',
        state: '',
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submissionError, setSubmissionError] = useState('');
    const { backendUrl } = useContext(LocationContext);

    useEffect(() => {
        fetch(`${backendUrl}/api/categories`)
            .then(response => response.json())
            .then(data => {
                setCategories(data);
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });
    }, [backendUrl]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitted(false);
        setSubmissionError('');
    
        try {
            const geocodeResponse = await fetch(`${backendUrl}/api/geocode?city=${encodeURIComponent(formData.city)}&state=${encodeURIComponent(formData.state)}`);
            
            if (!geocodeResponse.ok) {
                throw new Error('Could not find coordinates for the provided location.');
            }
    
            const coords = await geocodeResponse.json();
    
            const fullFormData = {
                ...formData,
                latitude: coords.latitude,
                longitude: coords.longitude
            };
    
            const serviceResponse = await fetch(`${backendUrl}/api/services/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(fullFormData),
            });
    
            if (!serviceResponse.ok) {
                const errorData = await serviceResponse.json();
                throw new Error(errorData.message || 'Error occurred while adding the service.');
            }
    
            setIsSubmitted(true);
            setFormData({
                name: '',
                description: '',
                category_id: '',
                city: '',
                state: '',
            });
        } catch (error) {
            setSubmissionError(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* form inputs and other JSX */}
            {isSubmitted && <div>Service added successfully!</div>}
            {submissionError && <div className="text-red-500">{submissionError}</div>}
        </form>
    );
}

export default AddServiceForm;
