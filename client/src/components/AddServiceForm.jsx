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
            {/* ... all inputs and buttons remain the same */}
        </form>
    );
}

export default AddServiceForm;
