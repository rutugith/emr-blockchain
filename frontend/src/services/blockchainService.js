import axios from 'axios';
import { API_BASE } from '../config';

const API = API_BASE;

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

export async function verifyEncounter(encounterId) {
  const res = await axios.get(`${API}/encounters/verify/${encounterId}`, {
    headers: authHeaders(),
  });
  return res.data;
}

export async function getChainForRecord(recordId) {
  const res = await axios.get(`${API}/encounters/chain/${recordId}`, {
    headers: authHeaders(),
  });
  return res.data;
}
