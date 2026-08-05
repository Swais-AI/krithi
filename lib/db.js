// lib/db.js - Shared database connection pool

const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      port: parseInt(process.env.PGPORT || '5432'),
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Log pool events
    pool.on('connect', () => {
      console.log('🔌 New database connection established');
    });

    pool.on('remove', () => {
      console.log('🔌 Database connection closed');
    });

    pool.on('error', (err) => {
      console.error('⚠️ Database pool error:', err.message);
    });
  }
  return pool;
}

async function withClient(callback) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    return await callback(client);
  } finally {
    try {
      client.release();
    } catch (releaseError) {
      // Ignore errors when releasing - connection may already be closed
    }
  }
}

async function query(text, params) {
  const pool = getPool();
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    try {
      client.release();
    } catch (releaseError) {
      // Ignore
    }
  }
}

module.exports = {
  getPool,
  withClient,
  query,
};
