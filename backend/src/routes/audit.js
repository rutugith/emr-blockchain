import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware, requireRole(['admin']));

router.get('/', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);
  const logs = await AuditLog.find().sort({ at: -1 }).limit(limit);
  res.json(logs);
});

export default router;
