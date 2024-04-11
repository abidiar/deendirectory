import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://deendirectorybackend.onrender.com';

export const fetchSearchResults = async (searchTerm, currentPage, latitude, longitude) => {
  try {
    const params = {
      searchTerm,
      page: currentPage,
    };

    if (latitude && longitude) {
      params.latitude = latitude;
      params.longitude = longitude;
    }

    const response = await axios.get(`${backendUrl}/api/search`, {
      params,
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};