import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { generateToken } from '../utils/generateToken.js';

const isMissing = (...values) => values.some((value) => !String(value || '').trim());

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (isMissing(name, email, password)) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) {
    return res.status(409).json({ message: 'An account already exists with this email. Please login.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, false)',
    [name.trim(), email.trim().toLowerCase(), hashedPassword]
  );

  res.status(201).json({
    data: {
      id: result.insertId,
      name: name.trim(),
      email: email.trim().toLowerCase()
    }
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (isMissing(email, password)) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  res.json({
    token: generateToken({ id: user.id, email: user.email, isAdmin: Boolean(user.is_admin) }),
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (isMissing(email, password)) {
    return res.status(400).json({ message: 'Admin email and password are required.' });
  }

  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND is_admin = true', [
    email.trim().toLowerCase()
  ]);
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid admin credentials.' });
  }

  res.json({
    token: generateToken({ id: user.id, email: user.email, isAdmin: true })
  });
});
