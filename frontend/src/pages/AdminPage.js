import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import {
  Card, CardContent, Typography, Button, IconButton, Chip, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Tabs, Tab, Container, Stack, Avatar, Badge,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HistoryIcon from '@mui/icons-material/History';
import GroupIcon from '@mui/icons-material/Group';
import RefreshIcon from '@mui/icons-material/Refresh';


const API = API_BASE;

const roleColor = { admin: 'error', doctor: 'primary', nurse: 'success', patient: 'default' };
const statusColor = (code) => {
  if (code >= 200 && code < 300) return 'success';
  if (code >= 400 && code < 500) return 'warning';
  if (code >= 500) return 'error';
  return 'default';
};
const actionColor = (action) => ({
  login: 'info', signup: 'primary', create: 'success', update: 'warning',
  delete: 'error', change_password: 'secondary',
}[action] || 'default');

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'doctor', fabricIdentity: '' });
  const [formError, setFormError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.get(`${API}/users`, { headers: authHeaders() });
      setUsers(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load users');
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  const pendingCount = useMemo(() => users.filter((u) => u.status === 'pending').length, [users]);

  const handleDelete = async (id, username) => {
    if (!window.confirm(`Delete user "${username}"?`)) return;
    try {
      await axios.delete(`${API}/users/${id}`, { headers: authHeaders() });
      setUsers(users.filter((u) => u._id !== id));
    } catch (e) { setError(e.response?.data?.message || 'Delete failed'); }
  };

  const handleApprove = async (id) => {
    try {
      const res = await axios.post(`${API}/users/${id}/approve`, {}, { headers: authHeaders() });
      setUsers(users.map((u) => (u._id === id ? res.data : u)));
    } catch (e) { setError(e.response?.data?.message || 'Approve failed'); }
  };

  const handleCreate = async () => {
    setFormError('');
    if (!newUser.username || !newUser.password) { setFormError('Username and password are required'); return; }
    if (newUser.password.length < 6) { setFormError('Password must be at least 6 characters'); return; }
    try {
      await axios.post(`${API}/users`, {
        username: newUser.username.trim(),
        password: newUser.password,
        role: newUser.role,
        fabricIdentity: newUser.fabricIdentity.trim() || undefined,
      }, { headers: authHeaders() });
      setDialogOpen(false);
      setNewUser({ username: '', password: '', role: 'doctor', fabricIdentity: '' });
      loadUsers();
    } catch (e) { setFormError(e.response?.data?.message || 'Create failed'); }
  };

  return (
    <>
      {pendingCount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}
          action={<Button color="inherit" size="small" onClick={() => document.getElementById('users-table')?.scrollIntoView({ behavior: 'smooth' })}>Review</Button>}
        >
          {pendingCount} account{pendingCount === 1 ? '' : 's'} awaiting your approval.
        </Alert>
      )}

      <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Users</Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadUsers} sx={{ mr: 1 }}>Refresh</Button>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setDialogOpen(true)}>New user</Button>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} variant="outlined" id="users-table">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Fabric identity</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center">Loading...</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No users</TableCell></TableRow>
            ) : users.map((u) => (
              <TableRow key={u._id} sx={u.status === 'pending' ? { bgcolor: 'rgba(245,158,11,0.08)' } : undefined}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(8,145,178,0.12)', color: 'primary.main', fontSize: 13, fontWeight: 700 }}>
                      {(u.username || '??').slice(0, 2).toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>{u.username}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip label={u.role} color={roleColor[u.role] || 'default'} size="small" sx={{ textTransform: 'capitalize' }} />
                </TableCell>
                <TableCell>
                  <Chip
                    label={u.status || 'approved'}
                    color={u.status === 'pending' ? 'warning' : 'success'}
                    size="small"
                    variant={u.status === 'pending' ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{u.fabricIdentity || '—'}</Typography></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</Typography></TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    {u.status === 'pending' && (
                      <Button size="small" color="success" variant="contained" startIcon={<CheckCircleIcon />}
                        onClick={() => handleApprove(u._id)}>
                        Approve
                      </Button>
                    )}
                    <IconButton size="small" color="error" onClick={() => handleDelete(u._id, u.username)} aria-label="delete user">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create user</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Username" required value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
            <TextField label="Password" type="password" required value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
            <TextField select label="Role" value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="doctor">Doctor</MenuItem>
              <MenuItem value="nurse">Nurse</MenuItem>
            </TextField>
            <TextField label="Fabric identity (optional)" value={newUser.fabricIdentity}
              onChange={(e) => setNewUser({ ...newUser, fabricIdentity: e.target.value })}
              helperText="Defaults to username" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function AuditTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.get(`${API}/audit?limit=200`, { headers: authHeaders() });
      setLogs(res.data);
    } catch (e) { setError(e.response?.data?.message || 'Failed to load audit log'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <>
      <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>Audit log</Typography>
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={load}>Refresh</Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>When</TableCell>
              <TableCell>Actor</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Resource</TableCell>
              <TableCell>Path</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} align="center">Loading...</TableCell></TableRow>
            ) : logs.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No entries yet</TableCell></TableRow>
            ) : logs.map((l) => (
              <TableRow key={l._id}>
                <TableCell><Typography variant="body2" color="text.secondary">{new Date(l.at).toLocaleString()}</Typography></TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" fontWeight={600}>{l.actorUsername || 'anonymous'}</Typography>
                    {l.actorRole && <Chip label={l.actorRole} size="small" variant="outlined" sx={{ height: 20, fontSize: 10 }} />}
                  </Stack>
                </TableCell>
                <TableCell><Chip label={l.action} color={actionColor(l.action)} size="small" /></TableCell>
                <TableCell><Typography variant="body2" sx={{ textTransform: 'capitalize' }}>{l.resource}</Typography></TableCell>
                <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>{l.method} {l.path}</Typography></TableCell>
                <TableCell><Chip label={l.status} color={statusColor(l.status)} size="small" variant="outlined" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    axios.get(`${API}/users`, { headers: authHeaders() })
      .then((r) => setPendingCount(r.data.filter((u) => u.status === 'pending').length))
      .catch(() => {});
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={0.5} sx={{ mb: 3 }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.1em' }}>
          Administration
        </Typography>
        <Typography variant="h3">Admin console</Typography>
        <Typography color="text.secondary">
          Manage users, review approvals, and audit every action taken on the system.
        </Typography>
      </Stack>

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab
            icon={
              <Badge badgeContent={pendingCount} color="warning">
                <GroupIcon fontSize="small" />
              </Badge>
            }
            iconPosition="start"
            label="Users"
          />
          <Tab icon={<HistoryIcon fontSize="small" />} iconPosition="start" label="Audit log" />
        </Tabs>
        <CardContent>
          {tab === 0 && <UsersTab />}
          {tab === 1 && <AuditTab />}
        </CardContent>
      </Card>
    </Container>
  );
}
