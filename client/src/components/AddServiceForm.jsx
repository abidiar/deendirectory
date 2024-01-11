import React, { useState, useEffect } from 'react';

function AddServiceForm() {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category_id: '',
        city: '',
        state: '',
    });

    useEffect(() => {
        // Fetch categories from the backend using native fetch
        fetch('https://deendirectorybackend.onrender.com/api/categories')
            .then(response => response.json())
            .then(data => setCategories(data))
            .catch(error => console.error('Error fetching categories:', error));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://deendirectorybackend.onrender.com/api/services/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Handle success - You might want to reset the form or navigate the user to a different page
            console.log('Service added successfully');
        } catch (error) {
            console.error('Error submitting form:', error);
            // Handle error - Display error message to the user
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
                required
            />
            <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-light focus:border-primary-light"
                placeholder="Description"
                required
            />
            <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-light focus:border-primary-light"
                required
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
                required
            />
            <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-light focus:border-primary-light"
                placeholder="State"
                required
            />
            <button type="submit" className="bg-accent-coral text-white font-bold py-2 px-6 rounded hover:bg-accent-coral-dark transition-colors duration-200">
                Submit
            </button>
        </form>
    );
}

export default AddServiceForm;
