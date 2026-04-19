// backend/src/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: String,
  role: { type: String, enum: ['admin', 'doctor', 'nurse', 'patient'], default: 'patient' },
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  fabricIdentity: String
}, { timestamps: true });

export default mongoose.model('User', userSchema);
