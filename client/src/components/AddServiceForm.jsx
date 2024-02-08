import React, { useState, useEffect, useContext } from 'react';
import { LocationContext } from '../context/LocationContext';
import MaskedInput from 'react-text-mask';

function AddServiceForm() {
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '', // Changed from category_id
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
    const [image, setImage] = useState(null);
    
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
    
    useEffect(() => {
        // Cleanup function to revoke the object URL
        return () => {
          if (image) {
            URL.revokeObjectURL(image);
          }
        };
      }, [image]);

    const handleChange = (e) => {
        // If the postal code field is being updated, automatically uppercase the state abbreviation
        if (e.target.name === 'state') {
            e.target.value = e.target.value.toUpperCase();
        }
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleCheckboxChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.checked });
    };
    
    const handleImageChange = (e) => {
        const file = e.target.files ? e.target.files[0] : null;
        const maxFileSize = 5 * 1024 * 1024; // 5 MB
      
        if (file) {
          if (file.size > maxFileSize) {
            alert("The file is too large. Please select a file smaller than 5MB.");
            return;
          }
      
          const img = new Image();
          img.onload = () => {
            const { width, height } = img;
            if (width < 800 || height < 600) { // Require at least 800x600
              alert("The image dimensions are too small. Minimum size is 800x600 pixels.");
            } else {
              setImage(file);
            }
            URL.revokeObjectURL(img.src); // Clean up the object URL
          };
          img.onerror = () => {
            alert("There was an error loading the image.");
            URL.revokeObjectURL(img.src); // Clean up the object URL
          };
          img.src = URL.createObjectURL(file);
        }
      };
      

      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitted(false);
        setSubmissionError('');

        // Create a new FormData instance for submission
        const submissionData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            submissionData.append(key, value);
        });

        if (image) {
            submissionData.append('image', image);
        }

        try {
            const serviceResponse = await fetch(`${backendUrl}/api/services/add`, {
                method: 'POST',
                body: submissionData, // Send submissionData instead of JSON
            });

            if (!serviceResponse.ok) {
                const errorData = await serviceResponse.json();
                throw new Error(errorData.message || 'Error occurred while adding the service.');
            }

            setIsSubmitted(true);
            // Reset form fields
            setFormData({
                name: '',
                description: '',
                category: '',
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
            setImage(null);
        } catch (error) {
            setSubmissionError(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
            {/* Business Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-dark">Business Name</label>
                <input id="name" name="name" type="text" required
                       className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                       value={formData.name} onChange={handleChange} />
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-neutral-dark">Description</label>
                <textarea id="description" name="description" required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                          value={formData.description} onChange={handleChange} />
            </div>

            {/* Category Dropdown */}
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-neutral-dark">Category</label>
                <select id="category" name="category" required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                        value={formData.category} onChange={handleChange}>
                    <option value="">Select a Category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                </select>
            </div>

            {/* Address Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="street_address" className="block text-sm font-medium text-neutral-dark">Street Address</label>
                    <input id="street_address" name="street_address" type="text" required
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                           value={formData.street_address} onChange={handleChange} />
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
            {/* Postal Code */}
            <div>
                <label htmlFor="postal_code" className="block text-sm font-medium text-neutral-dark">Postal Code</label>
                <input
                    id="postal_code"
                    name="postal_code"
                    type="text"
                    pattern="\d{5}(-\d{4})?"
                    title="Postal code must be a valid ZIP code (XXXXX or XXXXX-XXXX)"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                    value={formData.postal_code}
                    onChange={handleChange}
                />
            </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* Phone Number */}
             <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-neutral-dark">Phone Number</label>
                <MaskedInput
                    mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                    placeholder="(123) 456-7890"
                    guide={false}
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                />
            </div>
                <div>
                    <label htmlFor="website" className="block text-sm font-medium text-neutral-dark">Website</label>
                    <input id="website" name="website" type="url" 
                           className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary-light focus:ring-opacity-50"
                           value={formData.website} onChange={handleChange} />
                </div>
            </div>

                {/* Image Preview */}
                {image && (
  <div className="mb-4">
    <label className="block text-sm font-medium text-neutral-dark">Image Preview</label>
    <img src={URL.createObjectURL(image)} alt="Preview" className="mt-1 w-full rounded-md" />
    <button
      type="button"
      onClick={() => setImage(null)}
      className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
    >
      Remove Image
    </button>
  </div>
)}

                  {/* Image Upload Field */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-neutral-dark">Service Image</label>
        <input 
          id="image" 
          name="image" 
          type="file" 
          onChange={handleImageChange} 
          className="mt-1 block w-full text-sm text-neutral-dark file:mr-4 file:py-2 file:px-4 
                     file:rounded-md file:border-0 file:text-sm file:font-semibold 
                     file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />
      </div>

            {/* Halal Certification Checkbox */}
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

            {/* Submission Button */}
            <button type="submit"
                    className="bg-accent-coral hover:bg-accent-coral-dark text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200">
                Add Service
            </button>

            {/* Submission Feedback */}
            {isSubmitted && <div className="text-success-muted">Service added successfully!</div>}
            {submissionError && <div className="text-red-500">{submissionError}</div>}
        </form>
    );
}

export default AddServiceForm;
