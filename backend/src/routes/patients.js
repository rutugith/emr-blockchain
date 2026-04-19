// backend/src/routes/patients.js
import express from 'express';
import Patient from '../models/Patient.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { generateRecordHash } from '../utils/hash.js';
import { submitTransaction } from '../blockchain/fabricClient.js';
import Encounter from '../models/Encounter.js';

const router = express.Router();

const CLINICAL = ['doctor', 'nurse'];

router.post(
  '/',
  authMiddleware,
  requireRole(['doctor']),
  async (req, res) => {
    try {
      const patient = await Patient.create(req.body);

      const hash = generateRecordHash(patient.toObject());
      const txId = await submitTransaction(
        req.user.fabricIdentity || 'dummyIdentity',
        'createPatient',
        patient._id.toString(),
        hash
      );

      patient.recordHash = hash;
      patient.blockchainTxId = txId;
      await patient.save();

      res.json({ patient, blockchainTxId: txId });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error creating patient' });
    }
  }
);

router.get(
  '/all',
  authMiddleware,
  requireRole(CLINICAL),
  async (_req, res) => {
    try {
      const patients = await Patient.find().sort({ createdAt: -1 });
      res.json(patients);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Error fetching patients' });
    }
  }
);

router.get(
  '/:id',
  authMiddleware,
  requireRole(CLINICAL),
  async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) return res.status(404).json({ message: 'Patient not found' });
      res.json(patient);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching patient' });
    }
  }
);

router.get(
  '/stats/summary',
  authMiddleware,
  requireRole(CLINICAL),
  async (_req, res) => {
    try {
      const totalPatients = await Patient.countDocuments();
      const totalEncounters = await Encounter.countDocuments();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEncounters = await Encounter.countDocuments({
        createdAt: { $gte: today },
      });
      res.json({ totalPatients, totalEncounters, todayEncounters });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching stats' });
    }
  }
);

router.put(
  '/:id',
  authMiddleware,
  requireRole(['doctor']),
  async (req, res) => {
    try {
      const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updated) return res.status(404).json({ message: 'Patient not found' });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: 'Error updating patient' });
    }
  }
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole(['doctor']),
  async (req, res) => {
    try {
      const deleted = await Patient.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Patient not found' });
      res.json({ message: 'Patient deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Error deleting patient' });
    }
  }
);

export default router;
