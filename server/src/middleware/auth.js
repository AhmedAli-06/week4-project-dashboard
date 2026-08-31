import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
export function signToken(user) { return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' }); }
export async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'No token' });
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = { id: user._id, role: user.role };
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
}
export function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
}
