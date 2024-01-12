const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function roundCoordinates() {
  try {
    // Fetch all services
    const result = await pool.query('SELECT id, latitude, longitude FROM services');
    const services = result.rows;

    // Update each service
    for (const service of services) {
      const roundedLatitude = Number(service.latitude.toFixed(6));
      const roundedLongitude = Number(service.longitude.toFixed(6));

      await pool.query('UPDATE services SET latitude = $1, longitude = $2 WHERE id = $3', [roundedLatitude, roundedLongitude, service.id]);
      console.log(`Updated service ${service.id} with new coordinates: ${roundedLatitude}, ${roundedLongitude}`);
    }

    console.log('All coordinates have been rounded and updated.');
  } catch (error) {
    console.error('Error updating coordinates:', error);
  } finally {
    await pool.end(); // Close the database connection
  }
}

roundCoordinates();
