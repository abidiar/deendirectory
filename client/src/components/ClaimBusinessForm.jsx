import React, { useState } from 'react';
import axios from 'axios';

const ClaimBusinessForm = ({ businessId }) => {
  const [formData, setFormData] = useState({
    userId: '', // Assuming you have a user ID from your auth context or similar
    proof: '' // You'll need to decide what constitutes 'proof'. It might be a document upload, or some written explanation.
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
  
    try {
      const response = await axios.post(`/api/claim-business/${businessId}`, formData);
      // Call the onSuccess prop with a success message
      props.onSuccess(response.data.message);
    } catch (error) {
      setMessage('Failed to claim business: ' + (error.response?.data.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Claim Business</h2>
      <div>
        <label htmlFor="proof">Proof of Ownership:</label>
        <input
          type="text"
          name="proof"
          id="proof"
          value={formData.proof}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" disabled={isSubmitting}>Submit Claim</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default ClaimBusinessForm;
