import { appendBlock, getRecordHash } from './ledger.js';

const READ_FUNCTIONS = new Set(['getEncounterHash', 'getPatientHash', 'getRecordHash']);

export async function submitTransaction(identity, fnName, ...args) {
  const recordId = args[0];
  const recordHash = args[args.length - 1];
  const txId = await appendBlock({ identity, fnName, recordId, recordHash, args });
  return txId;
}

export async function evaluateTransaction(identity, fnName, ...args) {
  if (READ_FUNCTIONS.has(fnName)) {
    const recordId = args[0];
    const hash = await getRecordHash(recordId);
    return hash || '';
  }
  return '';
}
