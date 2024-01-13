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
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-dark">Business Name</label>
                <input id="name" name="name" type="text" required
                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                       value={formData.name} onChange={handleChange} />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-neutral-dark">Description</label>
                <textarea id="description" name="description" required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                          value={formData.description} onChange={handleChange} />
            </div>

            <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-neutral-dark">Category</label>
                <select id="category_id" name="category_id" required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                        value={formData.category_id} onChange={handleChange}>
                    <option value="">Select a Category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="city" className="block text-sm font-medium text-neutral-dark">City</label>
                <input id="city" name="city" type="text" required
                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                       value={formData.city} onChange={handleChange} />
            </div>

            <div>
                <label htmlFor="state" className="block text-sm font-medium text-neutral-dark">State</label>
                <input id="state" name="state" type="text" required
                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                       value={formData.state} onChange={handleChange} />
            </div>

            <button type="submit"
                    className="bg-accent-coral hover:bg-accent-coral-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200">
                Add Service
            </button>

            {isSubmitted && <div className="text-success-muted">Service added successfully!</div>}
            {submissionError && <div className="text-red-500">{submissionError}</div>}
        </form>
    );
}

export default AddServiceForm;
