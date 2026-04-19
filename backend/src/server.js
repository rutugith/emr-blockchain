import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import encounterRoutes from './routes/encounters.js';
import historyRoutes from './routes/history.js';
import userRoutes from './routes/users.js';
import auditRoutes from './routes/audit.js';
import User from './models/User.js';
import { auditMiddleware } from './middleware/audit.js';

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'secret') {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET must be set to a strong random value in production');
    process.exit(1);
  }
  console.warn('WARNING: JWT_SECRET is unset or default — fine for dev, fatal for prod');
}

mongoose.set('strictQuery', true);

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'same-site' },
}));

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '200kb' }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP' },
});
app.use(globalLimiter);

app.use(auditMiddleware);

app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/patients', patientRoutes);
app.use('/encounters', encounterRoutes);
app.use('/history', historyRoutes);
app.use('/audit', auditRoutes);
app.use('/blockchain/encounter', encounterRoutes);

app.use((err, _req, res, _next) => {
  if (err?.message?.startsWith('CORS:')) {
    return res.status(403).json({ message: err.message });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body too large' });
  }
  console.error('unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

async function bootstrapAdmin() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.warn('ADMIN_USERNAME/ADMIN_PASSWORD not set — skipping admin bootstrap');
    return;
  }
  const existing = await User.findOne({ role: 'admin' });
  if (existing) return;
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.create({
    username: ADMIN_USERNAME,
    passwordHash,
    role: 'admin',
    status: 'approved',
    fabricIdentity: ADMIN_USERNAME,
  });
  console.log(`Bootstrapped admin user "${ADMIN_USERNAME}"`);
}

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
    const backfill = await User.updateMany(
      { status: { $exists: false } },
      { status: 'approved' }
    );
    if (backfill.modifiedCount) {
      console.log(`Backfilled status=approved on ${backfill.modifiedCount} existing user(s)`);
    }
    await bootstrapAdmin();
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
}

connectDB();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
