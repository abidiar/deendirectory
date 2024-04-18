import React, { useState } from 'react';
import axios from 'axios';

const ClaimBusinessForm = ({ businessId }) => {
  const [formData, setFormData] = useState({
    userId: '', // This would come from your auth context/state
    proof: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Form the request payload
    const payload = {
      // Include userId if available
      proof: formData.proof
    };

    try {
      const response = await axios.post(`/api/claim-business/${businessId}`, payload);
      // Handle the response here, such as redirecting the user or showing a success message
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Failed to claim business: ' + (error.response?.data.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="proof" className="block text-sm font-medium text-gray-700">Proof of Ownership:</label>
          <input
            type="text"
            name="proof"
            id="proof"
            value={formData.proof}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          {isSubmitting ? 'Submitting...' : 'Submit Claim'}
        </button>
        {message && <div className="mt-2 text-sm font-semibold text-center text-red-600">{message}</div>}
      </form>
    </div>
  );
};

export default ClaimBusinessForm;
