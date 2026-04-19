import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import Patient from '../models/Patient.js';
import Encounter from '../models/Encounter.js';
import { decryptEncounter } from '../utils/encryption.js';

const router = express.Router();

router.get('/:patientId', authMiddleware, requireRole(['doctor', 'nurse']), async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const encounters = await Encounter.find({ patientId }).sort({ createdAt: -1 });
    res.json({
      patient,
      encounters: encounters.map((e) => decryptEncounter(e.toObject())),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error fetching history' });
  }
});

export default router;
