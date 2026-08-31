import express from 'express';
import User from '../models/User.js';
import { signToken, auth } from '../middleware/auth.js';
const router = express.Router();
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password are required' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ token: signToken(user), user: user.toSafeJSON() });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: signToken(user), user: user.toSafeJSON() });
  } catch (err) { res.status(500).json({ message: err.message }); }
});
router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user: user.toSafeJSON() });
});
export default router;
