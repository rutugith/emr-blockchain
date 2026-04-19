import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    method: String,
    path: String,
    resource: String,
    resourceId: String,
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorUsername: String,
    actorRole: String,
    status: Number,
    ip: String,
    metadata: Object,
  },
  { timestamps: { createdAt: 'at', updatedAt: false } }
);

auditLogSchema.index({ at: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
