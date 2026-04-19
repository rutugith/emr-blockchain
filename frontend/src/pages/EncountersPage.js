import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container, Card, CardContent, Box, Typography, Button, TextField, Stack,
  Alert, Grid, Autocomplete, Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';


const API = API_BASE;
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const DEFAULT_VITALS = [
  { k: 'bp', label: 'Blood pressure', placeholder: '120/80' },
  { k: 'hr', label: 'Heart rate (bpm)', placeholder: '72' },
  { k: 'temp', label: 'Temperature (°F)', placeholder: '98.6' },
  { k: 'spo2', label: 'SpO₂ (%)', placeholder: '99' },
];

export default function EncountersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const preselectId = location.state?.patientId;

  const [patients, setPatients] = useState([]);
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState({ bp: '', hr: '', temp: '', spo2: '' });
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API}/patients/all`, { headers: authHeaders() })
      .then((r) => {
        setPatients(r.data);
        if (preselectId) setPatient(r.data.find((p) => p._id === preselectId) || null);
      })
      .catch(() => {});
  }, [preselectId]);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!patient) { setError('Select a patient first'); return; }

    const vitalsObj = {};
    for (const { k } of DEFAULT_VITALS) {
      if (vitals[k]) vitalsObj[k] = vitals[k];
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/encounters`, {
        patientId: patient._id,
        vitals: vitalsObj,
        symptoms, diagnosis, notes,
      }, { headers: authHeaders() });
      setSuccess(`Encounter saved. Hash: ${res.data.encounter.recordHash?.slice(0, 16)}…`);
      setTimeout(() => navigate(`/patients/${patient._id}`), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error recording encounter');
    } finally { setLoading(false); }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>

      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.1em' }}>
          New encounter
        </Typography>
        <Typography variant="h3">Record encounter</Typography>
        <Typography color="text.secondary">
          Encounter content is encrypted at rest. A SHA-256 hash of the data is committed to the ledger for tamper-proof verification.
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={submit} noValidate>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em' }}>
              Patient
            </Typography>
            <Box sx={{ mt: 0.5, mb: 3 }}>
              <Autocomplete
                options={patients}
                getOptionLabel={(p) => p.name || ''}
                value={patient}
                onChange={(_, v) => setPatient(v)}
                renderInput={(params) => <TextField {...params} label="Select patient" required />}
                renderOption={(props, p) => (
                  <Box component="li" {...props} key={p._id}>
                    <Stack>
                      <Typography variant="body2" fontWeight={600}>{p.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {p.age || '—'} yrs · {p.gender || '—'} · {p.phone || '—'}
                      </Typography>
                    </Stack>
                  </Box>
                )}
              />
            </Box>

            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em' }}>
              Vitals
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5, mb: 3 }}>
              {DEFAULT_VITALS.map(({ k, label, placeholder }) => (
                <Grid size={{ xs: 6, sm: 3 }} key={k}>
                  <TextField
                    label={label} placeholder={placeholder}
                    value={vitals[k]} onChange={(e) => setVitals({ ...vitals, [k]: e.target.value })}
                  />
                </Grid>
              ))}
            </Grid>

            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em' }}>
              Clinical
            </Typography>
            <Stack spacing={2} sx={{ mt: 0.5, mb: 3 }}>
              <TextField label="Symptoms" multiline rows={2} value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
              <TextField label="Diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
              <TextField label="Notes / treatment" multiline rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button onClick={() => navigate(-1)} startIcon={<CloseIcon />}>Cancel</Button>
              <Button type="submit" variant="contained" startIcon={<AssignmentIcon />} disabled={loading}>
                {loading ? 'Saving…' : 'Save encounter'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
