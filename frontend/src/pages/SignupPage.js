import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  TextField, Button, Typography, Alert, Stack, Box, ToggleButton,
  ToggleButtonGroup, InputAdornment, IconButton, Link,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AuthLayout from '../components/AuthLayout';
import { API_BASE } from '../config';

export default function SignupPage() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirm: '',
    role: 'doctor',
    fabricIdentity: '',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match'); return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/signup`, {
        username: form.username.trim(),
        password: form.password,
        role: form.role,
        fabricIdentity: form.fabricIdentity.trim() || undefined,
      });
      setSuccess(res.data.message || 'Account created — awaiting admin approval.');
      setTimeout(() => navigate('/'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1">Request access</Typography>
        <Typography color="text.secondary">
          Doctors and nurses: create an account. Your admin will approve it before you can sign in.
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2.25}>
          <Box>
            <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: '0.08em', fontWeight: 700 }}>
              Your role
            </Typography>
            <ToggleButtonGroup
              exclusive fullWidth
              value={form.role}
              onChange={(_, v) => v && setForm({ ...form, role: v })}
              sx={{ mt: 0.5 }}
            >
              <ToggleButton value="doctor" sx={{ gap: 1, py: 1.25 }}>
                <MedicalServicesIcon fontSize="small" /> Doctor
              </ToggleButton>
              <ToggleButton value="nurse" sx={{ gap: 1, py: 1.25 }}>
                <LocalHospitalIcon fontSize="small" /> Nurse
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <TextField label="Username" required value={form.username} onChange={onChange('username')} autoComplete="username" />

          <TextField
            label="Password" required
            type={showPwd ? 'text' : 'password'}
            value={form.password} onChange={onChange('password')}
            helperText="At least 6 characters"
            autoComplete="new-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPwd((s) => !s)} edge="end" aria-label="toggle password visibility">
                    {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField label="Confirm password" type="password" required value={form.confirm} onChange={onChange('confirm')} autoComplete="new-password" />

          <TextField
            label="Fabric identity (optional)"
            value={form.fabricIdentity} onChange={onChange('fabricIdentity')}
            helperText="Hyperledger Fabric identity — defaults to your username"
          />

          <Button type="submit" size="large" variant="contained" endIcon={<ArrowForwardIcon />} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </Stack>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
        Already registered? <Link component={RouterLink} to="/" fontWeight={600}>Sign in</Link>
      </Typography>
    </AuthLayout>
  );
}
