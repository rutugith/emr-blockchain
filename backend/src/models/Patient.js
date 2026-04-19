// backend/src/models/Patient.js
import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  phone: String,
  address: String,
  allergies: String,
  aadhaar: String,
  recordHash: String,
  blockchainTxId: String
}, { timestamps: true });

export default mongoose.model('Patient', patientSchema);
