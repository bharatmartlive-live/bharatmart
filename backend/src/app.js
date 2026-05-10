import cors from 'cors';
import express from 'express';
import path from 'path';
import { env } from './config/env.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

export const app = express();

const explicitAllowedOrigins = new Set([
  ...env.clientUrls,
  'https://bharatmart.live',
  'https://www.bharatmart.live',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
]);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (explicitAllowedOrigins.has(origin)) return true;

  try {
    const { protocol, hostname } = new URL(origin);

    if (!['http:', 'https:'].includes(protocol)) {
      return false;
    }

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }

    if (hostname.endsWith('.onrender.com')) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '4mb' }));
app.use('/uploads', express.static(path.resolve('backend/uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);
