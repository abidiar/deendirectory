const NodeCache = require('node-cache');
const { fetchWithRetry } = require('./fetchUtils'); // Make sure this path is correct for your project structure

// Initialize a cache with a default TTL of 1 hour (3600 seconds)
const geocodeCache = new NodeCache({ stdTTL: 3600 });

async function convertCityStateToCoords(city, state) {
  const apiKey = process.env.GOOGLE_GEO_API_KEY;
  const location = `${city}, ${state}`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;

  try {
    // fetchWithRetry already returns the parsed JSON data
    const data = await fetchWithRetry(url);
    console.log('Google API response:', data);

    if (data.status === 'OK' && data.results.length > 0) {
      return {
        latitude: parseFloat(data.results[0].geometry.location.lat.toFixed(6)),
        longitude: parseFloat(data.results[0].geometry.location.lng.toFixed(6)),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error converting city and state to coordinates:', error);
    return null;
  }
}

async function fetchCoordinatesFromGoogle(location) {
  const cacheKey = `geocode:${location}`;
  const cachedCoords = geocodeCache.get(cacheKey);

  if (cachedCoords) {
    console.log('Returning cached coordinates for:', location);
    return cachedCoords;
  }

  const apiKey = process.env.GOOGLE_GEO_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;

  try {
    // fetchWithRetry already returns the parsed JSON data
    const data = await fetchWithRetry(url);

    if (data.status === 'OK' && data.results.length > 0) {
      const coords = {
        latitude: parseFloat(data.results[0].geometry.location.lat.toFixed(6)),
        longitude: parseFloat(data.results[0].geometry.location.lng.toFixed(6)),
      };
      geocodeCache.set(cacheKey, coords);
      console.log('Caching coordinates for:', location);
      return coords;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching coordinates from Google:', error);
    return null;
  }
}

module.exports = {
  convertCityStateToCoords,
  fetchCoordinatesFromGoogle
};
