const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
 
// Uncomment the SSL configuration if Render requires it for external connections
// ssl: {
// rejectUnauthorized: false // You might not need this line if Render manages SSL for you
// }
});
const searchInDatabase = async (searchTerm) => {
  const client = await pool.connect();

  try {
    // Use the pg_trgm similarity function
    const queryText = `
      SELECT * FROM services
      WHERE name % $1
      ORDER BY similarity(name, $1) DESC;
    `;

    // Set the similarity threshold to 50%
    await client.query('SELECT set_limit(0.5);');
    const res = await client.query(queryText, [searchTerm]);

    return res.rows;
  } finally {
    client.release();
  }
};

// Call this function when you want to perform a search
searchInDatabase('search_term').then(console.log).catch(console.error);

module.exports = pool;