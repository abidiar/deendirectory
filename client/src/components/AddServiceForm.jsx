import React, { useState, useEffect, useContext } from 'react';
import { LocationContext } from '../context/LocationContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import MaskedInput from 'react-text-mask';
import Tooltip from './Tooltip';

const initialFormData = {
  name: '',
  description: '',
  categoryId: '',
  street_address: '',  // Updated field name to match the backend
  city: '',
  state: '',
  postal_code: '',    // Updated field name to match the backend
  country: '',
  phone_number: '',   // Updated field name to match the backend
  website: '',
  hours: '',
  isHalalCertified: false,
};

const AddServiceForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const businessName = searchParams.get('name') || '';

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ ...initialFormData, name: businessName });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { backendUrl } = useContext(LocationContext);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/all-categories`);
        if (Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          throw new Error('Data received is not an array');
        }
      } catch (error) {
        console.error('Error fetching all categories:', error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, [backendUrl]);

  const resetForm = () => {
    setFormData({ ...initialFormData, name: businessName });
    setImage(null);
    setFormErrors({});
    setSuccessMessage('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && file.size > 5 * 1024 * 1024) {  // 5 MB
      setFormErrors(prevErrors => ({ ...prevErrors, image: 'The file is too large. Please select a file smaller than 5MB.' }));
      return;
    }

    const img = new Image();
    img.onload = () => {
      setImage(file);
      setFormErrors(prevErrors => ({ ...prevErrors, image: null }));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      setFormErrors(prevErrors => ({ ...prevErrors, image: 'There was an error loading the image.' }));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
        errors.name = 'Business name is required';
        console.log('Validation Error - Name:', formData.name);
    }
    if (!formData.description.trim()) {
        errors.description = 'Description is required';
        console.log('Validation Error - Description:', formData.description);
    }
    if (!formData.categoryId) {
        errors.categoryId = 'Category is required';
        console.log('Validation Error - Category ID:', formData.categoryId);
    }
    if (!formData.street_address.trim()) {
        errors.street_address = 'Street address is required';
        console.log('Validation Error - Street Address:', formData.street_address);
    }
    if (!formData.city.trim()) {
        errors.city = 'City is required';
        console.log('Validation Error - City:', formData.city);
    }
    if (!formData.state.trim()) {
        errors.state = 'State is required';
        console.log('Validation Error - State:', formData.state);
    }
    if (!formData.postal_code.trim()) {
        errors.postal_code = 'Postal code is required';
        console.log('Validation Error - Postal Code:', formData.postal_code);
    }
    if (!formData.country.trim()) {
        errors.country = 'Country is required';
        console.log('Validation Error - Country:', formData.country);
    }
    if (!formData.phone_number.trim()) {
        errors.phone_number = 'Phone number is required';
        console.log('Validation Error - Phone Number:', formData.phone_number);
    }

    console.log('Validation Errors:', errors);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('Submitting Form with Data:', formData);
  if (!validateForm()) {
    console.log('Form validation failed');
    return;
  }

  setIsSubmitting(true);
  const formDataToSubmit = new FormData();
  Object.entries(formData).forEach(([key, value]) => {
    const camelCaseKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
    formDataToSubmit.append(camelCaseKey, value);
    console.log(`Appended ${camelCaseKey}:`, value);
  });
  if (image) {
    formDataToSubmit.append('image', image, image.name);
    console.log('Appended Image:', image);
}

  try {
      const response = await axios.post(`${backendUrl}/api/services/add`, formDataToSubmit, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Server Response:', response.data);
      setSuccessMessage('Business added successfully!');
      resetForm();
      setTimeout(() => navigate('/services'), 2000);
  } catch (error) {
      console.error('Error adding service:', error);
      setFormErrors(prevErrors => ({
          ...prevErrors,
          submit: error.response?.data?.message || 'An error occurred while adding the service.'
      }));
  } finally {
      setIsSubmitting(false);
  }
};
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Add Service</h1>
  
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}
  
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
    Business Name
  </label>
  <input
    type="text"
    id="name"
    name="name"
    value={formData.name}
    onChange={handleChange}
    className={`mt-1 block w-full border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
    required
  />
  {formErrors.name && (
    <span className="text-red-500 text-sm">{formErrors.name}</span>
  )}
</div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`mt-1 block w-full border ${formErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            required
          />
          {formErrors.description && (
            <span className="text-red-500 text-sm">{formErrors.description}</span>
          )}
        </div>
        <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className={`mt-1 block w-full border ${formErrors.categoryId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            required
            >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {formErrors.categoryId && (
            <span className="text-red-500 text-sm">{formErrors.categoryId}</span>
          )}
        </div>
        <div>
  <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700">
    Street Address
  </label>
  <input
  type="text"
  id="street_address"
  name="street_address"
  value={formData.street_address}
  onChange={handleChange}
  className={`mt-1 block w-full p-2 ${formErrors.street_address ? 'border-red-500' : 'border-gray-300'}`}
  required
/>
  {formErrors.street_address && (
    <p className="text-red-500 text-xs mt-1">{formErrors.streetAddress}</p>
  )}
</div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`mt-1 block w-full border ${formErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            required
          />
          {formErrors.city && (
            <span className="text-red-500 text-sm">{formErrors.city}</span>
          )}
        </div>
        <div className="relative">
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State
            <Tooltip text="Enter the state abbreviation, e.g., 'NY' for New York." />
          </label>
          <input
            id="state"
            name="state"
            type="text"
            pattern="[A-Za-z]{2}"
            title="State must be a 2-letter abbreviation"
            placeholder="NY"
            value={formData.state}
            onChange={handleChange}
            className={`mt-1 block w-full border ${formErrors.state ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            required
          />
          {formErrors.state && (
            <span className="text-red-500 text-sm">{formErrors.state}</span>
          )}
        </div>
        <div>
          <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
            Postal Code
          </label>
          <input
            id="postal_code"
            name="postal_code"
            type="text"
            pattern="\d{5}(-\d{4})?"
            title="Postal code must be a valid ZIP code (XXXXX or XXXXX-XXXX)"
            value={formData.postal_code}
            onChange={handleChange}
            className={`mt-1 block w-full border ${formErrors.postal_code ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            required
          />
          {formErrors.postal_code && (
            <span className="text-red-500 text-sm">{formErrors.postal_code}</span>
          )}
        </div>
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={`mt-1 block w-full border ${formErrors.country ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            required
          />
          {formErrors.country && (
            <span className="text-red-500 text-sm">{formErrors.country}</span>
          )}
        </div>
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <MaskedInput
            mask={['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]}
            className={`mt-1 block w-full border ${formErrors.phone_number ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            placeholder="(123) 456-7890"
            guide={false}
            id="phone_number"
            name="phone_number"
            type="tel"
            value={formData.phone_number}
            onChange={handleChange}
            required
          />
          {formErrors.phone_number && (
            <span className="text-red-500 text-sm">{formErrors.phone_number}</span>
          )}
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            value={formData.website}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="hours" className="block text-sm font-medium text-gray-700">
            Hours
          </label>
          <input
            type="text"
            id="hours"
            name="hours"
            value={formData.hours}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Service Image
          </label>
          <input
            id="image"
            name="image"
            type="file"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          />
          {formErrors.image && (
            <span className="text-red-500 text-sm">{formErrors.image}</span>
          )}
        </div>
        {image && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Image Preview</label>
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
        <div className="sm:col-span-2">
          <label htmlFor="is_halal_certified" className="flex items-center">
            <input
              type="checkbox"
              id="is_halal_certified"
              name="is_halal_certified"
              checked={formData.is_halal_certified}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Is Halal Certified</span>
          </label>
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
      {formErrors.submit && <p className="text-red-500 mt-4">{formErrors.submit}</p>}
    </div>
  );
}

export default AddServiceForm;
