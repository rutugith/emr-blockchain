import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import { useNavigate } from 'react-router-dom';
import {
  Container, Card, CardContent, Box, Typography, TextField, Button, Grid,
  Stack, Alert, MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';


const API = API_BASE;
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function PatientsPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', age: '', gender: '', phone: '', address: '', allergies: '', aadhaar: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await axios.post(`${API}/patients`, form, { headers: authHeaders() });
      setSuccess(`Patient created. Record hash: ${res.data.patient.recordHash?.slice(0, 12)}…`);
      setTimeout(() => navigate(`/patients/${res.data.patient._id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating patient');
    } finally { setLoading(false); }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.1em' }}>
          New patient
        </Typography>
        <Typography variant="h3">Patient intake</Typography>
        <Typography color="text.secondary">
          Create a patient record. A SHA-256 hash of the record is committed to the ledger on save.
        </Typography>
      </Stack>

      <Card>
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em' }}>
              Personal
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3, mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Full name" required value={form.name} onChange={set('name')} autoFocus />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField label="Age" type="number" value={form.age} onChange={set('age')} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <TextField select label="Gender" value={form.gender} onChange={set('gender')}>
                  <MenuItem value="">—</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="O">Other</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em' }}>
              Contact
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3, mt: 0.5 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Phone" value={form.phone} onChange={set('phone')} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Aadhaar (ID)" value={form.aadhaar} onChange={set('aadhaar')} />
              </Grid>
              <Grid size={12}>
                <TextField label="Address" multiline rows={2} value={form.address} onChange={set('address')} />
              </Grid>
            </Grid>

            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.08em' }}>
              Medical
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3, mt: 0.5 }}>
              <Grid size={12}>
                <TextField label="Allergies" multiline rows={2} value={form.allergies} onChange={set('allergies')} helperText="Comma-separated list, e.g. Penicillin, peanuts" />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="contained" startIcon={<PersonAddIcon />} disabled={loading}>
                {loading ? 'Saving…' : 'Save patient'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
