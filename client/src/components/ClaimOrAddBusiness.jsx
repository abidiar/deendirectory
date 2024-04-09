import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Reintroduced axios for consistent API calls

const API_BASE_URL = import.meta.env.REACT_APP_BACKEND_URL || 'https://deendirectorybackend.onrender.com';

const ClaimOrAddBusiness = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone_number: '',
    website: '',
    hours: '',
    is_halal_certified: false,
    category_id: '',
  });
  const [categories, setCategories] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Declare isLoading state

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        alert('Error fetching categories'); // User feedback
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    const source = axios.CancelToken.source(); // For HTTP request cleanup

    fetchCategories();

    return () => {
      source.cancel("Component got unmounted"); // Cleanup pending HTTP requests
    };
  }, []);

// Handling search
const handleSearch = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  try {
    const response = await axios.get(`${API_BASE_URL}/api/businesses/search?name=${encodeURIComponent(searchTerm)}`);
    setSearchResults(response.data);
  } catch (error) {
    console.error('Error searching for business:', error.response?.data || error.message);
    alert('Error searching for business'); // User feedback
    setSearchResults([]);
  } finally {
    setIsLoading(false);
  }
};

  const handleClaimBusiness = (businessId) => {
    // Handle the claiming process for the selected business
    // You can redirect the user to a claim form or dashboard
    navigate(`/claim-business/${businessId}`);
  };

  const handleAddBusiness = () => {
    setFormData((prevData) => ({ ...prevData, name: searchTerm }));
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    setFormData((prevData) => ({ ...prevData, [name]: fieldValue }));
  };

  const validateForm = () => {
    const errors = {};

    // Perform form validation
    if (!formData.name) {
      errors.name = 'Business name is required';
    }
    if (!formData.description) {
      errors.description = 'Description is required';
    }
    if (!formData.street_address) {
      errors.street_address = 'Street address is required';
    }
    if (!formData.city) {
      errors.city = 'City is required';
    }
    if (!formData.state) {
      errors.state = 'State is required';
    }
    if (!formData.postal_code) {
      errors.postal_code = 'Postal code is required';
    }
    if (!formData.country) {
      errors.country = 'Country is required';
    }
    if (!formData.phone_number) {
      errors.phone_number = 'Phone number is required';
    }
    if (!formData.category_id) {
      errors.category_id = 'Category is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  if (validateForm()) {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/businesses`, formData);
      console.log('Business added successfully:', response.data);
      navigate(`/business/${response.data.id}`);
    } catch (error) {
      console.error('Error adding business:', error.response?.data || error.message);
      alert('Error adding business'); // User feedback
      setFormErrors({ submit: error.response?.data || 'An error occurred while adding the business.' });
    } finally {
      setIsSubmitting(false);
    }
  }
};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Claim or Add Your Business</h1>

      {/* Display loading indicator */}
      {isLoading && <p>Loading...</p>}
      
      {/* Display form submission errors */}
      {formErrors.submit && <p className="text-red-500">{formErrors.submit}</p>}

      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search for your business"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Search
          </button>
        </div>
      </form>
      {searchResults && Array.isArray(searchResults) && searchResults.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Search Results</h2>
          <ul className="space-y-4">
            {searchResults.map((business) => (
              <li key={business.id} className="flex justify-between items-center border border-gray-300 rounded-md p-4">
                <div>
                  <h3 className="text-lg font-bold">{business.name}</h3>
                  <p className="text-gray-500">{business.street_address}, {business.city}, {business.state} {business.postal_code}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleClaimBusiness(business.id)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Claim Business
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {searchTerm && searchResults && searchResults.length === 0 && (
        <div className="mb-8">
          <p className="text-lg">No results found for "{searchTerm}".</p>
          <button
            type="button"
            onClick={handleAddBusiness}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Business with this Name
          </button>
        </div>
      )}
      {formData.name && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className={`mt-1 block w-full border ${formErrors.category_id ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              required
            >
              <option value="">Select a category</option>
              {categories && Array.isArray(categories) && categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {formErrors.category_id && (
              <span className="text-red-500 text-sm">{formErrors.category_id}</span>
            )}
          </div>
          <div>
            <label htmlFor="street_address" className="block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <input
              type="text"
              id="street_address"
              name="street_address"
              value={formData.street_address}
              onChange={handleChange}
              className={`mt-1 block w-full border ${formErrors.street_address ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              required
            />
            {formErrors.street_address && (
              <span className="text-red-500 text-sm">{formErrors.street_address}</span>
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
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              type="text"
              id="state"
              name="state"
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
              type="text"
              id="postal_code"
              name="postal_code"
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
            <input
              type="text"
              id="phone_number"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className={`mt-1 block w-full border ${formErrors.phone_number ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
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
              type="text"
              id="website"
              name="website"
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
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className={`mt-1 block w-full border ${formErrors.category_id ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {formErrors.category_id && (
              <span className="text-red-500 text-sm">{formErrors.category_id}</span>
            )}
          </div>
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
      )}
    </div>
  );
}
export default ClaimOrAddBusiness;