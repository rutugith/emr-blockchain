// backend/src/models/Encounter.js
import mongoose from 'mongoose';

const encounterSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },

    vitals: Object,
    symptoms: String,
    diagnosis: String,
    notes: String,
    doctorName: String,

    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Blockchain fields
    recordHash: { type: String },
    blockchainTxId: { type: String },
    blockchainHash: { type: String },
    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model('Encounter', encounterSchema);
