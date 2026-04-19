import crypto from 'crypto';

const OMIT = new Set(['_id', '__v', 'createdAt', 'updatedAt', 'recordHash', 'blockchainTxId', 'blockchainHash', 'verified']);

function canonical(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(canonical);
  const out = {};
  for (const key of Object.keys(obj).sort()) {
    if (OMIT.has(key)) continue;
    const value = obj[key];
    if (value && typeof value.toString === 'function' && value._bsontype) {
      out[key] = value.toString();
    } else {
      out[key] = canonical(value);
    }
  }
  return out;
}

export function generateRecordHash(data) {
  const json = JSON.stringify(canonical(data));
  return crypto.createHash('sha256').update(json).digest('hex');
}
