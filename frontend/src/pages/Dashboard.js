import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import {
  Box, Grid, Card, CardContent, Typography, Button, Stack, Chip, Avatar,
  List, ListItem, ListItemText, ListItemAvatar, Divider, Container, Skeleton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TodayIcon from '@mui/icons-material/Today';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddTaskIcon from '@mui/icons-material/AddTask';
import VerifiedIcon from '@mui/icons-material/Verified';


const API = API_BASE;

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

function StatCard({ icon, label, value, tint, loading }) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: tint.bg, color: tint.fg, width: 48, height: 48 }}>
            {icon}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.08em' }}>
              {label}
            </Typography>
            {loading ? (
              <Skeleton width={80} height={40} />
            ) : (
              <Typography variant="h3" sx={{ fontFamily: '"Figtree", sans-serif', lineHeight: 1.1 }}>
                {value}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');
  const [stats, setStats] = useState({ totalPatients: 0, totalEncounters: 0, todayEncounters: 0 });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, pRes] = await Promise.all([
          axios.get(`${API}/patients/stats/summary`, { headers: authHeaders() }),
          axios.get(`${API}/patients/all`, { headers: authHeaders() }),
        ]);
        setStats(sRes.data);
        setPatients(pRes.data);
      } catch (e) {
        console.error('dashboard load failed', e);
      } finally { setLoading(false); }
    })();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mb: 4 }} spacing={2}>
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.1em' }}>
            Welcome back
          </Typography>
          <Typography variant="h3" sx={{ mt: 0.5 }}>
            Hi, {username || 'there'} 👋
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            Here's what's happening across your patient population today.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          {role === 'doctor' && (
            <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => navigate('/patients')}>
              New patient
            </Button>
          )}
          {role === 'doctor' && (
            <Button variant="outlined" startIcon={<AddTaskIcon />} onClick={() => navigate('/encounters')}>
              New encounter
            </Button>
          )}
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard loading={loading} icon={<GroupsIcon />} label="Total patients" value={stats.totalPatients}
            tint={{ bg: 'rgba(8,145,178,0.10)', fg: '#0891B2' }} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard loading={loading} icon={<AssignmentIcon />} label="Total encounters" value={stats.totalEncounters}
            tint={{ bg: 'rgba(34,211,238,0.12)', fg: '#0E7490' }} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard loading={loading} icon={<TodayIcon />} label="Today's encounters" value={stats.todayEncounters}
            tint={{ bg: 'rgba(34,197,94,0.12)', fg: '#16A34A' }} />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>Recent patients</Typography>
                <Button size="small" onClick={() => navigate('/patients/list')}>View all</Button>
              </Stack>

              {loading ? (
                <Stack spacing={1}>
                  {[1, 2, 3].map((i) => <Skeleton key={i} height={56} />)}
                </Stack>
              ) : patients.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
                  No patients yet. Create the first one to get started.
                </Box>
              ) : (
                <List disablePadding>
                  {patients.slice(0, 6).map((p, idx) => (
                    <React.Fragment key={p._id}>
                      {idx > 0 && <Divider component="li" />}
                      <ListItem
                        secondaryAction={
                          p.recordHash && (
                            <Chip size="small" label="On-chain" icon={<VerifiedIcon />} color="primary" variant="outlined" />
                          )
                        }
                        sx={{ cursor: 'pointer', borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}
                        onClick={() => navigate(`/patients/${p._id}`)}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'rgba(8,145,178,0.12)', color: 'primary.main', fontWeight: 700 }}>
                            {(p.name || '??').slice(0, 2).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={p.name}
                          secondary={`${p.gender || '—'} · ${p.age || '—'} yrs · ${p.phone || 'no phone'}`}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{
            background: 'linear-gradient(140deg, #0E7490 0%, #0891B2 60%, #22D3EE 140%)',
            color: 'white',
            border: 'none',
          }}>
            <CardContent>
              <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: '0.1em', fontWeight: 700 }}>
                Integrity layer
              </Typography>
              <Typography variant="h5" sx={{ mt: 0.5, mb: 1.5, color: 'white' }}>
                Every record is hash-verified
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.92, mb: 3 }}>
                Patient and encounter records are hashed with SHA-256 and committed to a tamper-evident ledger.
                Any modification to the underlying data is detectable in milliseconds.
              </Typography>
              <Stack spacing={1.25}>
                {[
                  { label: 'Hashing', value: 'SHA-256 per record' },
                  { label: 'Storage', value: 'AES-256-GCM at rest' },
                  { label: 'Verification', value: 'Local ↔ ledger match' },
                ].map((item) => (
                  <Stack key={item.label} direction="row" justifyContent="space-between" sx={{
                    borderRadius: 2, px: 1.5, py: 1, bgcolor: 'rgba(255,255,255,0.12)',
                  }}>
                    <Typography variant="body2" sx={{ opacity: 0.85 }}>{item.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
