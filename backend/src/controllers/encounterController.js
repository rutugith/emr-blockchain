import Encounter from '../models/Encounter.js';
import { generateRecordHash } from '../utils/hash.js';
import { submitTransaction, evaluateTransaction } from '../blockchain/fabricClient.js';
import { encryptEncounterFields, decryptEncounter } from '../utils/encryption.js';

export const createEncounter = async (req, res) => {
  try {
    const enc = new Encounter({
      ...req.body,
      doctorId: req.user?.userId,
    });

    const plaintext = enc.toObject();
    const hash = generateRecordHash(plaintext);
    const txId = await submitTransaction(
      req.user?.fabricIdentity || 'dummyIdentity',
      'addEncounter',
      enc._id.toString(),
      enc.patientId?.toString(),
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating encounter' });
  }
};

export const verifyEncounter = async (req, res) => {
  try {
    const id = req.params.id || req.body.id || req.body.encounter?._id;
    if (!id) return res.status(400).json({ message: 'encounter id required' });

    const doc = await Encounter.findById(id);
    if (!doc) {
      return res.json({ status: 'not_found', match: false });
    }

    const plain = decryptEncounter(doc.toObject());
    const localHash = generateRecordHash(plain);
    const blockchainHash = await evaluateTransaction(
      req.user?.fabricIdentity || 'dummyIdentity',
      'getEncounterHash',
      doc._id.toString()
    );

    const match = Boolean(blockchainHash) && localHash === blockchainHash;
    res.json({
      status: !blockchainHash ? 'not_found' : match ? 'verified' : 'tampered',
      match,
      localHash,
      blockchainHash,
      blockchainTxId: doc.blockchainTxId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error verifying encounter' });
  }
};
