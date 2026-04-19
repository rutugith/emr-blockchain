import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

const ALLOWED_ROLES = ['admin', 'doctor', 'nurse'];

router.use(authMiddleware, requireRole(['admin']));

router.get('/', async (_req, res) => {
  const users = await User.find({}, '-passwordHash').sort({ createdAt: -1 });
  res.json(users);
});

router.post('/', async (req, res) => {
  try {
    const { username, password, role, fabricIdentity } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'username, password, and role are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ message: `Role must be one of: ${ALLOWED_ROLES.join(', ')}` });
    }

    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ message: 'Username already taken' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      username,
      passwordHash,
      role,
      status: 'approved',
      fabricIdentity: fabricIdentity || username,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      status: user.status,
      fabricIdentity: user.fabricIdentity,
    });
  } catch (e) {
    console.error('admin create user error:', e);
    res.status(500).json({ message: 'Error creating user' });
  }
});

router.post('/:id/approve', async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status: 'approved' },
    { new: true, projection: '-passwordHash' }
  );
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

router.delete('/:id', async (req, res) => {
  if (req.user.userId === req.params.id) {
    return res.status(400).json({ message: 'You cannot delete your own account' });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'Deleted', id: user._id });
});

export default router;
