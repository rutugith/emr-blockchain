import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEDGER_PATH = path.join(__dirname, '..', '..', 'data', 'ledger.json');

async function read() {
  try {
    const raw = await fs.readFile(LEDGER_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === 'ENOENT') return { blocks: [] };
    throw e;
  }
}

async function write(state) {
  await fs.mkdir(path.dirname(LEDGER_PATH), { recursive: true });
  await fs.writeFile(LEDGER_PATH, JSON.stringify(state, null, 2));
}

export async function appendBlock({ identity, fnName, recordId, recordHash, args }) {
  const state = await read();
  const prev = state.blocks[state.blocks.length - 1];
  const prevHash = prev ? prev.blockHash : '0'.repeat(64);
  const block = {
    txId: `tx-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    fnName,
    recordId,
    recordHash,
    identity,
    args,
    prevHash,
    timestamp: new Date().toISOString(),
  };
  block.blockHash = crypto
    .createHash('sha256')
    .update(JSON.stringify({ ...block, blockHash: undefined }))
    .digest('hex');
  state.blocks.push(block);
  await write(state);
  return block.txId;
}

export async function getRecordHash(recordId) {
  const state = await read();
  const match = [...state.blocks].reverse().find((b) => b.recordId === recordId);
  return match ? match.recordHash : null;
}

export async function getBlocks() {
  const state = await read();
  return state.blocks;
}

export async function getBlocksForRecord(recordId) {
  const state = await read();
  return state.blocks.filter((b) => b.recordId === recordId);
}
