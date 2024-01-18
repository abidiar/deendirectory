const NodeCache = require('node-cache');
const { fetchWithRetry } = require('./fetchUtils'); // Make sure this path is correct for your project structure

// Initialize a cache with a default TTL of 1 hour (3600 seconds)
const geocodeCache = new NodeCache({ stdTTL: 3600 });

async function convertCityStateToCoords(city, state) {
  const apiKey = process.env.GOOGLE_GEO_API_KEY;
  const location = `${city}, ${state}`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;

  try {
      const response = await fetchWithRetry(url);
      const data = await response.json();

      switch (data.status) {
          case 'OK':
              // Valid response
              const result = data.results[0];
              return {
                  latitude: result.geometry.location.lat,
                  longitude: result.geometry.location.lng,
              };

          case 'ZERO_RESULTS':
              console.error('No results found for the given location.');
              break;

          case 'OVER_QUERY_LIMIT':
              console.error('Query limit exceeded for Google Maps API.');
              break;

          case 'REQUEST_DENIED':
              console.error('Google Maps API request was denied.');
              break;

          case 'INVALID_REQUEST':
              console.error('Invalid request sent to Google Maps API.');
              break;

          default:
              console.error('Unexpected error from Google Maps API:', data.status);
      }
  } catch (error) {
      console.error('Error in convertCityStateToCoords:', error);
  }

  return null; // Return null in case of any error
}

// Function to fetch coordinates from Google using an address
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
      console.log(`Converted Coordinates: ${JSON.stringify(coords)}`);
      geocodeCache.set(cacheKey, coords);
      console.log('Caching coordinates for:', location);
      return coords;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error in convertCityStateToCoords:', error);
    return null;
  }
}

module.exports = {
  convertCityStateToCoords,
  fetchCoordinatesFromGoogle
};
