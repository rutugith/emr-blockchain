import React, { useState } from 'react';
import axios from 'axios';
import {
  AppBar, Box, Toolbar, Button, IconButton, Menu, MenuItem, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Avatar,
  Stack, Typography, Chip, Container, useTheme,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LockResetIcon from '@mui/icons-material/LockReset';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate, useLocation } from 'react-router-dom';
import BrandMark from './BrandMark';
import { API_BASE } from '../config';

const roleColors = { admin: 'error', doctor: 'primary', nurse: 'success' };

function NavButton({ to, icon, label }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to));
  const theme = useTheme();
  return (
    <Button
      onClick={() => navigate(to)}
      startIcon={icon}
      sx={{
        color: active ? 'primary.main' : 'text.primary',
        bgcolor: active ? theme.palette.primary.main + '14' : 'transparent',
        fontWeight: 600,
        borderRadius: 2,
        px: 1.75,
        '&:hover': { bgcolor: theme.palette.primary.main + '0d' },
      }}
    >
      {label}
    </Button>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username') || '';
  const isAdmin = role === 'admin';

  const [anchor, setAnchor] = useState(null);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const logout = () => { localStorage.clear(); navigate('/'); };

  const submitPwd = async () => {
    setPwdError(''); setPwdSuccess('');
    if (pwdForm.newPassword !== pwdForm.confirm) {
      setPwdError('New passwords do not match'); return;
    }
    try {
      await axios.post(
        `${API_BASE}/auth/change-password`,
        { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setPwdSuccess('Password updated');
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
      setTimeout(() => setPwdOpen(false), 800);
    } catch (e) {
      setPwdError(e.response?.data?.message || 'Change failed');
    }
  };

  const initials = username ? username.slice(0, 2).toUpperCase() : '??';

  return (
    <>
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 2 }}>
            <Box sx={{ mr: 2 }}>
              <BrandMark size={32} />
            </Box>

            <Stack direction="row" spacing={0.5} sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {isAdmin ? (
                <NavButton to="/admin" icon={<AdminPanelSettingsIcon fontSize="small" />} label="Admin" />
              ) : (
                <>
                  <NavButton to="/dashboard" icon={<DashboardIcon fontSize="small" />} label="Dashboard" />
                  <NavButton to="/patients/list" icon={<GroupsIcon fontSize="small" />} label="Patients" />
                  <NavButton to="/encounters" icon={<AssignmentIcon fontSize="small" />} label="Encounters" />
                </>
              )}
            </Stack>

            <Box sx={{ flexGrow: 1, display: { md: 'none' } }} />

            {role && (
              <Chip
                label={role}
                color={roleColors[role] || 'default'}
                size="small"
                sx={{ textTransform: 'capitalize' }}
              />
            )}

            <IconButton onClick={(e) => setAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14, fontWeight: 700 }}>
                {initials || <AccountCircle />}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchor}
              open={Boolean(anchor)}
              onClose={() => setAnchor(null)}
              slotProps={{ paper: { sx: { minWidth: 220, mt: 1 } } }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2">{username}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>{role}</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setAnchor(null); setPwdOpen(true); }}>
                <LockResetIcon fontSize="small" sx={{ mr: 1.5 }} /> Change password
              </MenuItem>
              <MenuItem onClick={() => { setAnchor(null); logout(); }} sx={{ color: 'error.main' }}>
                <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} /> Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>

      <Dialog open={pwdOpen} onClose={() => setPwdOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Change password</DialogTitle>
        <DialogContent>
          {pwdError && <Alert severity="error" sx={{ mb: 1 }}>{pwdError}</Alert>}
          {pwdSuccess && <Alert severity="success" sx={{ mb: 1 }}>{pwdSuccess}</Alert>}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Current password" type="password"
              value={pwdForm.currentPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
            />
            <TextField
              label="New password" type="password"
              value={pwdForm.newPassword}
              onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
              helperText="At least 6 characters"
            />
            <TextField
              label="Confirm new password" type="password"
              value={pwdForm.confirm}
              onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPwdOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitPwd}>Update</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
