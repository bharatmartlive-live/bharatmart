import mysql from 'mysql2/promise';
import { env } from './env.js';

export const pool = mysql.createPool({
  host: env.mysqlHost,
  user: env.mysqlUser,
  password: env.mysqlPassword,
  database: env.mysqlDb,
  waitForConnections: true,
  connectionLimit: 10
});
