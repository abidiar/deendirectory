const NodeCache = require('node-cache');
const { fetchWithRetry } = require('./fetchUtils'); // Make sure this path is correct for your project structure
const NodeGeocoder = require('node-geocoder');

// Initialize a cache with a default TTL of 1 hour (3600 seconds)
const geocodeCache = new NodeCache({ stdTTL: 3600 });

const options = {
  provider: 'google', apiKey: process.env.GOOGLE_GEO_API_KEY
};

const geocoder = NodeGeocoder(options);

async function convertCityStateToCoords(city, state) {
  const location = `${city}, ${state}`;
  const cacheKey = `geocode:${location}`;
  const cachedCoords = geocodeCache.get(cacheKey);

  if (cachedCoords) {
    console.log('Returning cached coordinates for:', location);
    return cachedCoords;
  }

  try {
    const res = await geocoder.geocode(location);
    if (res.length) {
      const coords = {
        latitude: res[0].latitude,
        longitude: res[0].longitude
      };
      geocodeCache.set(cacheKey, coords);
      return coords;
    } else {
      console.error('No results found for the given location.');
    }
  } catch (error) {
    console.error('Error in convertCityStateToCoords:', error);
  }

  return null; // Return null in case of any error
}

module.exports = {
  convertCityStateToCoords
};

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
