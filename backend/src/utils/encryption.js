import crypto from 'crypto';

const PREFIX = 'enc::v1::';
const STRING_FIELDS = ['symptoms', 'diagnosis', 'notes'];

let cachedKey = null;
function key() {
  if (cachedKey) return cachedKey;
  const hex = process.env.ENCRYPTION_KEY;
  if (hex && /^[0-9a-fA-F]{64}$/.test(hex)) {
    cachedKey = Buffer.from(hex, 'hex');
  } else {
    cachedKey = crypto.randomBytes(32);
    console.warn(
      'ENCRYPTION_KEY missing or invalid — generated an ephemeral key. ' +
        'Existing encrypted records will not be readable after restart. ' +
        'Set ENCRYPTION_KEY to a 64-char hex string in .env.'
    );
  }
  return cachedKey;
}

function encryptString(plaintext) {
  if (plaintext === null || plaintext === undefined || plaintext === '') return plaintext;
  if (typeof plaintext !== 'string') plaintext = String(plaintext);
  if (plaintext.startsWith(PREFIX)) return plaintext;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const packed = Buffer.concat([iv, tag, ct]).toString('base64');
  return PREFIX + packed;
}

function decryptString(value) {
  if (typeof value !== 'string' || !value.startsWith(PREFIX)) return value;
  try {
    const packed = Buffer.from(value.slice(PREFIX.length), 'base64');
    const iv = packed.subarray(0, 12);
    const tag = packed.subarray(12, 28);
    const ct = packed.subarray(28);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key(), iv);
    decipher.setAuthTag(tag);
    const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
    return pt.toString('utf8');
  } catch (e) {
    console.error('decryptString failed:', e.message);
    return value;
  }
}

export function encryptEncounterFields(doc) {
  for (const f of STRING_FIELDS) {
    if (doc[f] != null) doc[f] = encryptString(doc[f]);
  }
  if (doc.vitals && typeof doc.vitals === 'object' && !doc.vitals._enc) {
    doc.vitals = { _enc: encryptString(JSON.stringify(doc.vitals)) };
  }
  return doc;
}

export function decryptEncounter(obj) {
  if (!obj) return obj;
  const out = { ...obj };
  for (const f of STRING_FIELDS) {
    if (out[f] != null) out[f] = decryptString(out[f]);
  }
  if (out.vitals && typeof out.vitals === 'object' && out.vitals._enc) {
    try {
      out.vitals = JSON.parse(decryptString(out.vitals._enc));
    } catch (e) {
      out.vitals = {};
    }
  }
  return out;
}
