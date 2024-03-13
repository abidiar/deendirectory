import axios from 'axios';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'https://deendirectorybackend.onrender.com';

export const fetchSearchResults = async (searchTerm, currentPage) => {
  try {
    const response = await axios.get(`${backendUrl}/api/search`, {
      params: {
        searchTerm: searchTerm,
        page: currentPage,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching search results:', error);
    throw error;
  }
};