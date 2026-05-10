import dotenv from 'dotenv';

dotenv.config();

const parseClientUrls = () => {
  const configured = process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:5173';

  return configured
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
};

export const env = {
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  clientUrls: parseClientUrls(),
  jwtSecret: process.env.JWT_SECRET || 'bharatmart-secret',
  mysqlHost: process.env.MYSQL_HOST,
  mysqlUser: process.env.MYSQL_USER,
  mysqlPassword: process.env.MYSQL_PASSWORD,
  mysqlDb: process.env.MYSQL_DB,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  keepAliveUrl: process.env.KEEP_ALIVE_URL || '',
  enableKeepAlive: process.env.ENABLE_KEEP_ALIVE === 'true'
};
