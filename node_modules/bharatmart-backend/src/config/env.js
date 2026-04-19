import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'bharatmart-secret',
  mysqlHost: process.env.MYSQL_HOST,
  mysqlUser: process.env.MYSQL_USER,
  mysqlPassword: process.env.MYSQL_PASSWORD,
  mysqlDb: process.env.MYSQL_DB,
  keepAliveUrl: process.env.KEEP_ALIVE_URL || '',
  enableKeepAlive: process.env.ENABLE_KEEP_ALIVE === 'true'
};
