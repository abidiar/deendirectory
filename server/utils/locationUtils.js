const NodeCache = require('node-cache');
const axios = require('axios');
const NodeGeocoder = require('node-geocoder');

// Initialize a cache with a default TTL of 1 hour (3600 seconds)
const geocodeCache = new NodeCache({ stdTTL: 3600 });

const options = {
  provider: 'locationiq',
  apiKey: process.env.LOCATIONIQ_API_KEY,
  httpAdapter: 'https',
  formatter: null
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
};

async function fetchCoordinates(location) {
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
      console.log('Caching coordinates for:', location);
      return coords;
    } else {
      console.error('No results found for the given location:', location);
      return null;
    }
  } catch (error) {
    console.error('Error in fetchCoordinates:', error);
    return null;
  }
}


module.exports = {
  convertCityStateToCoords,
  fetchCoordinates
};
