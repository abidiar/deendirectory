const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
 
// Uncomment the SSL configuration if Render requires it for external connections
// ssl: {
// rejectUnauthorized: false // You might not need this line if Render manages SSL for you
// }
});

module.exports = pool;