// fetch function to use node-fetch with async/await syntax
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// fetchWithRetry function to perform retries with exponential backoff
async function fetchWithRetry(url, maxRetries = 5) {
  let attempt = 0;
  let delay = 1000; // Start with a delay of 1 second

  while (attempt < maxRetries) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok && data.status === 'OK') {
        return data.results[0].geometry.location;
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        // If over query limit, wait for the delay before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        // Double the delay for the next attempt
        delay *= 2;
        attempt++;
      } else {
        // If the response is not OK and it's not a query limit error, throw an error
        throw new Error(`API responded with status: ${data.status}`);
      }
    } catch (error) {
      // If an exception is thrown, log it and retry until max retries are reached
      console.error(`Fetch attempt ${attempt} failed:`, error);
      if (attempt >= maxRetries - 1) {
        throw new Error(`All retries failed for fetching: ${url}`);
      }
      // Increase the attempt counter and continue with the loop
      attempt++;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

module.exports = { fetch, fetchWithRetry };
