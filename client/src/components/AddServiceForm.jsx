import React, { useState, useEffect, useContext } from 'react';
import { LocationContext } from '../context/LocationContext';

function AddServiceForm() {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        street_address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        phone_number: '',
        website: '',
        hours: '',
        is_halal_certified: false,
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
    
    const handleCheckboxChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.checked });
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
                website: '',
                hours: '',
                is_halal_certified: false,
                street_address: '',
                postal_code: '',
                country: '',
                phone_number: '',
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
    <label htmlFor="street_address" className="block text-sm font-medium text-neutral-dark">Street Address</label>
    <input id="street_address" name="street_address" type="text"
           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:
ring focus:ring-primary-light focus:ring-opacity-50"
value={formData.street_address} onChange={handleChange} />

</div>
<div>
    <label htmlFor="postal_code" className="block text-sm font-medium text-neutral-dark">Postal Code</label>
    <input id="postal_code" name="postal_code" type="text"
           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
           value={formData.postal_code} onChange={handleChange} />
</div>
<div>
    <label htmlFor="country" className="block text-sm font-medium text-neutral-dark">Country</label>
    <input id="country" name="country" type="text"
           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
           value={formData.country} onChange={handleChange} />
</div>
<div>
    <label htmlFor="phone_number" className="block text-sm font-medium text-neutral-dark">Phone Number</label>
    <input id="phone_number" name="phone_number" type="tel"
           className="mt-1 block w
-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
value={formData.phone_number} onChange={handleChange} />

</div>
<div>
    <label htmlFor="website" className="block text-sm font-medium text-neutral-dark">Website</label>
    <input id="website" name="website" type="url"
           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
           value={formData.website} onChange={handleChange} />
</div>
<div>
    <label htmlFor="hours" className="block text-sm font-medium text-neutral-dark">Hours</label>
    <input id="hours" name="hours" type="text"
           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
           value={formData.hours} onChange={handleChange} />
</div>
<div className="flex items-center">
    <input
        id="is_halal_certified"
        name="is_halal_certified"
        type="checkbox"
        className="form-checkbox h-5 w-5 text-gray-600 mr-2"
        checked={formData.is_halal_certified}
        onChange={handleCheckboxChange}
    />
    <label htmlFor="is_halal_certified" className="block text-sm font-medium text-neutral-dark">
        Halal Certified
    </label>
</div>

        <button type="submit"
                className="bg-accent-coral hover:bg-accent-coral-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200">
            Add Service
        </button>

        {isSubmitted && <div
className="text-success-muted">Service added successfully!</div>}
{submissionError && <div className="text-red-500">{submissionError}</div>}
</form>
);
}

export default AddServiceForm;