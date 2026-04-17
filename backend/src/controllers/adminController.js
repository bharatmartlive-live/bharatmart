import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createProduct, updateProduct } from '../services/productService.js';

export const storefrontData = asyncHandler(async (req, res) => {
  const [announcements] = await pool.query(
    'SELECT id, text, active FROM announcements WHERE active = true ORDER BY created_at DESC'
  );
  const [coupons] = await pool.query(
    'SELECT id, code, discount, active FROM coupons WHERE active = true ORDER BY created_at DESC'
  );

  res.json({
    data: {
      announcements,
      coupons
    }
  });
});

export const dashboardData = asyncHandler(async (req, res) => {
  const [products] = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
  const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  const [announcements] = await pool.query('SELECT * FROM announcements ORDER BY created_at DESC');
  const [coupons] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');

  res.json({
    data: {
      products,
      orders,
      announcements,
      coupons
    }
  });
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const { text, active = true } = req.body;
  const [result] = await pool.query('INSERT INTO announcements (text, active) VALUES (?, ?)', [
    text,
    active
  ]);
  res.status(201).json({ id: result.insertId, text, active });
});

export const updateAnnouncement = asyncHandler(async (req, res) => {
  await pool.query('UPDATE announcements SET active = ? WHERE id = ?', [req.body.active, req.params.id]);
  res.json({ message: 'Announcement updated.' });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const { code, discount, active = true } = req.body;
  const [result] = await pool.query(
    'INSERT INTO coupons (code, discount, active) VALUES (?, ?, ?)',
    [code, discount, active]
  );
  res.status(201).json({ id: result.insertId, code, discount, active });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  await pool.query('UPDATE coupons SET active = ? WHERE id = ?', [req.body.active, req.params.id]);
  res.json({ message: 'Coupon updated.' });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  await pool.query('UPDATE orders SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
  res.json({ message: 'Order updated.' });
});

export const uploadMedia = asyncHandler(async (req, res) => {
  const files = req.files || [];
  const media = files.map((file) => `/uploads/${file.filename}`);
  res.status(201).json({ data: media });
});

export const createAdminProduct = asyncHandler(async (req, res) => {
  const product = await createProduct(req.body);
  res.status(201).json({ data: product });
});

export const updateAdminProduct = asyncHandler(async (req, res) => {
  const product = await updateProduct(req.params.id, req.body);
  if (!product) {
    return res.status(404).json({ message: 'Product not found.' });
  }
  res.json({ data: product });
});
