import mysql from 'mysql2/promise';
import { env } from './env.js';

export const pool = mysql.createPool({
  host: env.mysqlHost,
  user: env.mysqlUser,
  password: env.mysqlPassword,
  database: env.mysqlDb,
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

export async function warmDatabase() {
  try {
    await pool.query('SELECT 1');
    console.log('MySQL connection warmed.');
  } catch (error) {
    console.error('MySQL warm-up failed:', error.message);
  }
}
