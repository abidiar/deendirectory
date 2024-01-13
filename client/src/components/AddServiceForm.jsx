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
                console.log('[AddServiceForm] Categories fetched:', data);
                setCategories(data);
            })
            .catch(error => {
                console.error('[AddServiceForm] Error fetching categories:', error);
            });
    }, [backendUrl]);

    const handleChange = (e) => {
        console.log(`[AddServiceForm] Change detected on field ${e.target.name}:`, e.target.value);
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('[AddServiceForm] Submitting form with data:', formData);
        setIsSubmitted(false);
        setSubmissionError('');

        try {
            const response = await fetch(`${backendUrl}/api/services/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            console.log('[AddServiceForm] Form submission successful');
            setIsSubmitted(true);
            setFormData({
                name: '',
                description: '',
                category_id: '',
                city: '',
                state: '',
            });
        } catch (error) {
            console.error('[AddServiceForm] Error submitting form:', error);
            setSubmissionError('Error submitting form. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-light focus:border-primary-light"
                placeholder="Business Name"
            />
            <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-light focus:border-primary-light"
                placeholder="Description"
            />
            <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-light focus:border-primary-light"
            >
                <option value="">Select a Category</option>
                {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                ))}
            </select>
            <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-light focus:border-primary-light"
                placeholder="City"
            />
            <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-light focus
:border-primary-light"
placeholder="State"
/>
<button type="submit" className="bg-accent-coral text-white font-bold py-2 px-6 rounded hover:bg-accent-coral-dark transition-colors duration-200">
Submit
</button>
{isSubmitted && <div className="text-success-muted mt-4">Service added successfully!</div>}
{submissionError && <div className="text-red-500 mt-4">{submissionError}</div>}
</form>
);
}

export default AddServiceForm;