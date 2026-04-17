import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
}
