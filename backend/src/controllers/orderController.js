import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const orderSelect = `
  SELECT
    o.*,
    COALESCE(
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'product_id', oi.product_id,
          'title', p.title,
          'quantity', oi.quantity,
          'price', oi.price
        )
      ),
      JSON_ARRAY()
    ) AS items
  FROM orders o
  LEFT JOIN order_items oi ON oi.order_id = o.id
  LEFT JOIN products p ON p.id = oi.product_id
`;

export const createOrder = asyncHandler(async (req, res) => {
  const { customerName, email, phone, address, totalPrice, items, userId, paymentMethod = 'COD' } = req.body;

  if (!customerName || !email || !phone || !address) {
    return res.status(400).json({ message: 'Customer name, email, phone, and address are required.' });
  }

  if (paymentMethod !== 'COD') {
    return res.status(400).json({ message: 'Online payment is in development. Please select Cash on Delivery for now.' });
  }

  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ message: 'Please add at least one product before placing an order.' });
  }

  const normalizedItems = items.map((item) => ({
    productId: Number(item.productId),
    quantity: Number(item.quantity),
    price: Number(item.price)
  }));

  if (normalizedItems.some((item) => !item.productId || !item.quantity || item.quantity < 1 || Number.isNaN(item.price))) {
    return res.status(400).json({ message: 'Invalid cart item details. Please refresh cart and try again.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
  const resolvedUserId = userId || users[0]?.id || null;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, customer_name, email, phone, address, total_price, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [resolvedUserId, customerName.trim(), normalizedEmail, phone.trim(), address, Number(totalPrice || 0)]
    );

    for (const item of normalizedItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderResult.insertId, item.productId, item.quantity, item.price]
      );
    }

    await connection.commit();
    res.status(201).json({ message: 'Order created successfully.', orderId: orderResult.insertId });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
});

export const listOrders = asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  res.json({ data: rows });
});

export const listCustomerOrders = asyncHandler(async (req, res) => {
  const email = String(req.params.email || '').trim().toLowerCase();
  if (!email) {
    return res.status(400).json({ message: 'Customer email is required.' });
  }

  const [rows] = await pool.query(
    `${orderSelect}
     WHERE o.email = ?
     GROUP BY o.id
     ORDER BY o.created_at DESC`,
    [email]
  );

  res.json({ data: rows });
});
