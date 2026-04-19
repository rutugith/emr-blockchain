import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Card, CardContent, Typography, CircularProgress, Box, Divider,
  TextField, Button, Chip, Stack, Avatar, Grid, IconButton, Tooltip, MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AddTaskIcon from '@mui/icons-material/AddTask';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BlockchainVerificationModal from '../components/BlockchainVerificationModal';
import AlertSnackbar from '../components/AlertSnackbar';
import { verifyEncounter as verifyEncounterOnChain } from '../services/blockchainService';


const API = API_BASE;
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function PatientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const [patient, setPatient] = useState(null);
  const [encounters, setEncounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});
  const [verification, setVerification] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    (async () => {
      try {
        const [pRes, eRes] = await Promise.all([
          axios.get(`${API}/patients/${id}`, { headers: authHeaders() }),
          axios.get(`${API}/encounters/patient/${id}`, { headers: authHeaders() }),
        ]);
        setPatient(pRes.data); setForm(pRes.data); setEncounters(eRes.data);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    })();
  }, [id]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleUpdate = async () => {
    try {
      const res = await axios.put(`${API}/patients/${id}`, form, { headers: authHeaders() });
      setPatient(res.data); setEditMode(false);
      setSnackbar({ open: true, message: 'Patient updated', severity: 'success' });
    } catch (e) { setSnackbar({ open: true, message: 'Update failed', severity: 'error' }); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this patient and all associated records?')) return;
    try {
      await axios.delete(`${API}/patients/${id}`, { headers: authHeaders() });
      navigate('/patients/list');
    } catch (e) { setSnackbar({ open: true, message: 'Delete failed', severity: 'error' }); }
  };

  const handleVerify = async (encounterId) => {
    try {
      const result = await verifyEncounterOnChain(encounterId);
      setVerification(result);
      setModalOpen(true);
      const severity = result.status === 'verified' ? 'success' : result.status === 'tampered' ? 'error' : 'warning';
      setSnackbar({ open: true, message: `Status: ${result.status}`, severity });
    } catch (err) {
      setSnackbar({ open: true, message: 'Verification failed', severity: 'error' });
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }
  if (!patient) return <Container sx={{ py: 4 }}><Typography>Patient not found.</Typography></Container>;

  const initials = (patient.name || '??').slice(0, 2).toUpperCase();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/patients/list')} sx={{ mb: 2 }}>
        Back to patients
      </Button>

      <Card sx={{ mb: 3, overflow: 'hidden' }}>
        <Box sx={{
          height: 120,
          background: 'linear-gradient(135deg, #0E7490 0%, #0891B2 55%, #22D3EE 130%)',
        }} />
        <CardContent sx={{ mt: -7 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={2}>
            <Avatar sx={{
              width: 96, height: 96, bgcolor: 'white', color: 'primary.main',
              fontSize: 32, fontWeight: 800, border: '4px solid white',
              boxShadow: '0 8px 24px -8px rgba(15,23,42,0.2)',
            }}>{initials}</Avatar>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h4" sx={{ mt: { xs: 1, sm: 6 }, lineHeight: 1.1 }}>{patient.name}</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }} flexWrap="wrap">
                <Chip label={`${patient.age || '—'} yrs`} size="small" />
                <Chip label={patient.gender || '—'} size="small" />
                {patient.aadhaar && <Chip label={patient.aadhaar} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />}
                {patient.recordHash && (
                  <Chip icon={<VerifiedIcon />} label="On-chain" color="primary" size="small" variant="outlined" />
                )}
              </Stack>
            </Box>
            <Stack direction="row" spacing={1} sx={{ mt: { xs: 1, sm: 6 } }}>
              {role === 'doctor' && (
                <Button variant="contained" startIcon={<AddTaskIcon />} onClick={() => navigate('/encounters', { state: { patientId: id } })}>
                  New encounter
                </Button>
              )}
              {role === 'doctor' && (
                !editMode ? (
                  <Tooltip title="Edit patient">
                    <IconButton onClick={() => setEditMode(true)} color="primary"><EditIcon /></IconButton>
                  </Tooltip>
                ) : (
                  <>
                    <Button startIcon={<CloseIcon />} onClick={() => { setEditMode(false); setForm(patient); }}>Cancel</Button>
                    <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleUpdate}>Save</Button>
                  </>
                )
              )}
              {role === 'doctor' && !editMode && (
                <Tooltip title="Delete">
                  <IconButton color="error" onClick={handleDelete}><DeleteIcon /></IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.1em' }}>Profile</Typography>
              <Divider sx={{ my: 1.5 }} />
              {editMode ? (
                <Stack spacing={2}>
                  <TextField label="Name" value={form.name || ''} onChange={set('name')} />
                  <TextField label="Age" type="number" value={form.age || ''} onChange={set('age')} />
                  <TextField select label="Gender" value={form.gender || ''} onChange={set('gender')}>
                    <MenuItem value="">—</MenuItem>
                    <MenuItem value="F">Female</MenuItem>
                    <MenuItem value="M">Male</MenuItem>
                    <MenuItem value="O">Other</MenuItem>
                  </TextField>
                  <TextField label="Phone" value={form.phone || ''} onChange={set('phone')} />
                  <TextField label="Address" multiline rows={2} value={form.address || ''} onChange={set('address')} />
                  <TextField label="Allergies" multiline rows={2} value={form.allergies || ''} onChange={set('allergies')} />
                </Stack>
              ) : (
                <Stack spacing={1.25}>
                  {[
                    ['Phone', patient.phone],
                    ['Address', patient.address],
                    ['Allergies', patient.allergies],
                    ['Aadhaar', patient.aadhaar],
                  ].map(([k, v]) => (
                    <Stack key={k} direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                      <Typography variant="body2" color="text.secondary">{k}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right', maxWidth: '65%' }}>
                        {v || '—'}
                      </Typography>
                    </Stack>
                  ))}
                  {patient.recordHash && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.08em' }}>RECORD HASH</Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                        {patient.recordHash}
                      </Typography>
                    </>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.1em' }}>Encounter history</Typography>
                  <Typography variant="h6">{encounters.length} encounter{encounters.length === 1 ? '' : 's'}</Typography>
                </Box>
              </Stack>

              {encounters.length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                  <Typography>No encounters recorded for this patient.</Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {encounters.map((e) => (
                    <Box key={e._id} sx={{
                      p: 2, borderRadius: 3, border: 1, borderColor: 'divider',
                      bgcolor: 'background.paper',
                      '&:hover': { borderColor: 'primary.light' },
                    }}>
                      <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ mb: 1 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {e.diagnosis || 'No diagnosis'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(e.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                        {e.recordHash && (
                          <Chip icon={<VerifiedIcon />} label="Hashed" color="primary" size="small" variant="outlined" />
                        )}
                      </Stack>

                      {e.symptoms && (
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          <Box component="span" sx={{ color: 'text.secondary' }}>Symptoms: </Box>{e.symptoms}
                        </Typography>
                      )}
                      {e.notes && (
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          <Box component="span" sx={{ color: 'text.secondary' }}>Notes: </Box>{e.notes}
                        </Typography>
                      )}
                      {e.vitals && Object.keys(e.vitals).length > 0 && (
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                          {Object.entries(e.vitals).map(([k, v]) => (
                            <Chip key={k} label={`${k}: ${v}`} size="small" />
                          ))}
                        </Stack>
                      )}

                      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} alignItems="center">
                        {e.blockchainTxId && (
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', flexGrow: 1, wordBreak: 'break-all' }}>
                            tx: {e.blockchainTxId}
                          </Typography>
                        )}
                        <Button size="small" variant="outlined" onClick={() => handleVerify(e._id)}>
                          Verify
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <BlockchainVerificationModal open={modalOpen} onClose={() => setModalOpen(false)} verification={verification} />
      <AlertSnackbar open={snackbar.open} onClose={() => setSnackbar({ ...snackbar, open: false })} message={snackbar.message} severity={snackbar.severity} />
    </Container>
  );
}
