// Revised convertCityStateToCoords function with validation

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
      // Validate that the returned location matches the input city and state
      const result = data.results[0];
      const addressComponents = result.address_components;

      const resultCity = addressComponents.find(component =>
        component.types.includes('locality') || component.types.includes('sublocality')
      )?.short_name.toLowerCase();

      const resultState = addressComponents.find(component =>
        component.types.includes('administrative_area_level_1')
      )?.short_name.toLowerCase();

      if (resultCity === city.toLowerCase() && resultState === state.toLowerCase()) {
        return {
          latitude: parseFloat(result.geometry.location.lat.toFixed(6)),
          longitude: parseFloat(result.geometry.location.lng.toFixed(6)),
        };
      } else {
        console.error(`[Geocode Validation] Mismatch in city/state. Expected: ${city}, ${state}. Got: ${resultCity}, ${resultState}.`);
        return null;
      }
    } else {
      console.error('No valid geocode results found for the given location');
      return null;
    }
  } catch (error) {
    console.error('Error converting city and state to coordinates:', error);
    return null;
  }
}

module.exports = {
  convertCityStateToCoords,
  fetchCoordinatesFromGoogle
};
