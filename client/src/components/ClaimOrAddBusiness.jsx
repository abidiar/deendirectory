import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ClaimBusinessForm from './ClaimBusinessForm'; // Import the ClaimBusinessForm component

const API_BASE_URL = import.meta.env.REACT_APP_BACKEND_URL || 'https://deendirectorybackend.onrender.com';

const ClaimOrAddBusiness = () => {
  const navigate = useNavigate();
  const isMountedRef = useRef(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const performSearch = async () => {
    if (searchTerm.trim()) {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/businesses/search?name=${encodeURIComponent(searchTerm)}`);
        if (isMountedRef.current) {
          setSearchResults(response.data.businesses);
        }
      } catch (error) {
        if (isMountedRef.current) {
          setFeedbackMessage('Error searching for business: ' + error.message);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleClaimBusiness = (businessId) => {
    setSelectedBusinessId(businessId);
    setShowClaimForm(true);
    setFeedbackMessage(''); // Clear any existing messages
  };

  const handleAddBusiness = () => {
    navigate(`/add-service?name=${encodeURIComponent(searchTerm)}`);
  };

  // Call this function when the claim is successfully submitted
  const onClaimSuccess = (message) => {
    setShowClaimForm(false);
    setFeedbackMessage(message);
    // Optionally, re-search to refresh the list
    performSearch();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6">Claim or Add Your Business</h1>

      {isLoading && <p>Loading...</p>}
      {feedbackMessage && <p className="mb-4">{feedbackMessage}</p>}

      {showClaimForm && (
        <ClaimBusinessForm
          businessId={selectedBusinessId}
          onClose={() => setShowClaimForm(false)}
          onSuccess={onClaimSuccess}
        />
      )}

      <div className="flex mb-8">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search for your business"
          autoComplete="off"
        />
        <button
          onClick={handleAddBusiness}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!searchTerm}
        >
          Add Business with this Name
        </button>
      </div>

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
        </div>
      )}
    </div>
  );
};

export default ClaimOrAddBusiness;