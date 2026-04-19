import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

const SIGNUP_ROLES = ['doctor', 'nurse'];
const MIN_PASSWORD_LEN = 6;
const BCRYPT_ROUNDS = 12;

function makeLimiter({ max, message, skipSuccess = false }) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: max,
    skipSuccessfulRequests: skipSuccess,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message },
  });
}

const loginLimiter = makeLimiter({ max: 10, skipSuccess: true, message: 'Too many failed login attempts — try again in 15 minutes' });
const signupLimiter = makeLimiter({ max: 5, message: 'Too many signup attempts — try again later' });
const changePwdLimiter = makeLimiter({ max: 5, skipSuccess: true, message: 'Too many password change attempts — try again later' });

router.post('/signup', signupLimiter, async (req, res) => {
  try {
    const { username, password, role, fabricIdentity } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'username, password, and role are required' });
    }
    if (typeof username !== 'string' || username.length > 64) {
      return res.status(400).json({ message: 'Invalid username' });
    }
    if (password.length < MIN_PASSWORD_LEN || password.length > 128) {
      return res.status(400).json({ message: `Password must be ${MIN_PASSWORD_LEN}–128 characters` });
    }
    if (!SIGNUP_ROLES.includes(role)) {
      return res.status(400).json({ message: `Role must be one of: ${SIGNUP_ROLES.join(', ')}` });
    }

    const existing = await User.findOne({ username });
    if (existing) return res.status(409).json({ message: 'Username already taken' });

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({
      username,
      passwordHash,
      role,
      status: 'pending',
      fabricIdentity: fabricIdentity || username,
    });

    res.status(201).json({
      id: user._id,
      username: user.username,
      role: user.role,
      status: user.status,
      message: 'Account created — awaiting admin approval before you can log in.',
    });
  } catch (e) {
    console.error('signup error:', e);
    res.status(500).json({ message: 'Error creating user' });
  }
});

router.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'username and password required' });
  }

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  if (user.status && user.status !== 'approved') {
    return res.status(403).json({ message: 'Your account is awaiting admin approval.' });
  }

  const token = jwt.sign(
    { userId: user._id, username: user.username, role: user.role, fabricIdentity: user.fabricIdentity },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '8h' }
  );

  res.json({ token, role: user.role, username: user.username });
});

router.post('/change-password', changePwdLimiter, authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'currentPassword and newPassword are required' });
    }
    if (newPassword.length < MIN_PASSWORD_LEN || newPassword.length > 128) {
      return res.status(400).json({ message: `New password must be ${MIN_PASSWORD_LEN}–128 characters` });
    }
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });
    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (e) {
    console.error('change-password error:', e);
    res.status(500).json({ message: 'Error changing password' });
  }
});

export default router;
