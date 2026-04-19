import express from 'express';
import Encounter from '../models/Encounter.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { generateRecordHash } from '../utils/hash.js';
import { submitTransaction } from '../blockchain/fabricClient.js';
import { getBlocksForRecord } from '../blockchain/ledger.js';
import { encryptEncounterFields, decryptEncounter } from '../utils/encryption.js';
import {
  createEncounter,
  verifyEncounter,
} from '../controllers/encounterController.js';

const router = express.Router();

const CLINICAL = ['doctor', 'nurse'];

router.post(
  '/',
  authMiddleware,
  requireRole(['doctor']),
  async (req, res) => {
    try {
      const { patientId, vitals, symptoms, diagnosis, notes } = req.body;

      const enc = new Encounter({
        patientId,
        doctorId: req.user.userId,
        vitals,
        symptoms,
        diagnosis,
        notes,
      });

      const plaintext = enc.toObject();
      const hash = generateRecordHash(plaintext);
      const txId = await submitTransaction(
        req.user.fabricIdentity || 'dummyIdentity',
        'addEncounter',
        enc._id.toString(),
        patientId,
        hash
      );
      enc.recordHash = hash;
      enc.blockchainTxId = txId;

      encryptEncounterFields(enc);
      await enc.save();

      res.json({
        encounter: { ...plaintext, recordHash: hash, blockchainTxId: txId },
        blockchainTxId: txId,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error recording encounter' });
    }
  }
);

router.get(
  '/patient/:patientId',
  authMiddleware,
  requireRole(CLINICAL),
  async (req, res) => {
    try {
      const encounters = await Encounter.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
      res.json(encounters.map((e) => decryptEncounter(e.toObject())));
    } catch (err) {
      res.status(500).json({ message: 'Error fetching encounters' });
    }
  }
);

router.get('/verify/:id', authMiddleware, requireRole(CLINICAL), verifyEncounter);

router.get(
  '/chain/:id',
  authMiddleware,
  requireRole(CLINICAL),
  async (req, res) => {
    try {
      const blocks = await getBlocksForRecord(req.params.id);
      res.json(blocks);
    } catch (e) {
      res.status(500).json({ message: 'Error fetching chain' });
    }
  }
);

router.post('/create', authMiddleware, requireRole(['doctor']), createEncounter);
router.post('/verify', authMiddleware, requireRole(CLINICAL), verifyEncounter);

export default router;
