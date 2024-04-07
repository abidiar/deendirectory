import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
  });

  const handleSearch = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.get(`/api/businesses/search?name=${searchTerm}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching for business:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('/api/businesses', formData);
      console.log('Business added successfully:', response.data);
      navigate('/business-added');
    } catch (error) {
      console.error('Error adding business:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Claim or Add Your Business</h1>
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
      {searchResults.length > 0 && (
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
      {searchTerm && searchResults.length === 0 && (
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Business Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
          {/* Add more form fields for other business details */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ClaimOrAddBusiness;