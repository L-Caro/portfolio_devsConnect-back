const { Pool } = require('pg');

const pool = new Pool({
  database: process.env.PGDATABASE ?? 'devsconnect',
});
pool.connect();

module.exports = pool;
