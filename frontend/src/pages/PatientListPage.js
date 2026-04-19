import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import { useNavigate } from 'react-router-dom';
import {
  Container, Card, CardContent, Box, Typography, Button, Stack, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, InputAdornment, Skeleton, IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';


const API = API_BASE;
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function PatientListPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    axios.get(`${API}/patients/all`, { headers: authHeaders() })
      .then((r) => setPatients(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return patients;
    return patients.filter((p) =>
      (p.name || '').toLowerCase().includes(s) ||
      (p.aadhaar || '').toLowerCase().includes(s) ||
      (p.phone || '').toLowerCase().includes(s)
    );
  }, [patients, q]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 3 }} spacing={2}>
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.1em' }}>
            Directory
          </Typography>
          <Typography variant="h3">Patients</Typography>
          <Typography color="text.secondary">
            {patients.length} total{q ? ` · showing ${filtered.length}` : ''}
          </Typography>
        </Box>
        {localStorage.getItem('role') === 'doctor' && (
          <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => navigate('/patients')}>
            New patient
          </Button>
        )}
      </Stack>

      <Card>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by name, Aadhaar, or phone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Age / Gender</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Aadhaar</TableCell>
                  <TableCell>Integrity</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  [1, 2, 3, 4].map((i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}><Skeleton height={40} /></TableCell>
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                        <Typography variant="body2">
                          {patients.length === 0 ? 'No patients yet. Create the first one to begin.' : 'No patients match your search.'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : filtered.map((p) => (
                  <TableRow key={p._id} hover sx={{ cursor: 'pointer' }} onClick={() => navigate(`/patients/${p._id}`)}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ bgcolor: 'rgba(8,145,178,0.12)', color: 'primary.main', fontWeight: 700, width: 36, height: 36 }}>
                          {(p.name || '??').slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>{p.name || '—'}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{p.age || '—'} yrs · {p.gender || '—'}</Typography>
                    </TableCell>
                    <TableCell><Typography variant="body2">{p.phone || '—'}</Typography></TableCell>
                    <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{p.aadhaar || '—'}</Typography></TableCell>
                    <TableCell>
                      {p.recordHash ? (
                        <Chip label="On-chain" icon={<VerifiedIcon />} color="primary" size="small" variant="outlined" />
                      ) : (
                        <Chip label="Pending" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" aria-label="open patient">
                        <ArrowForwardIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Container>
  );
}
