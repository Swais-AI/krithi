import { Pool } from 'pg';

let globalPool = null;

function getPool() {
  if (!globalPool) {
    globalPool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 3,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return globalPool;
}

export async function query(text, params) {
  const pool = getPool();
  return pool.query(text, params);
}

export { getPool };
