import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import HubIcon from '@mui/icons-material/Hub';
import BrandMark from './BrandMark';

const points = [
  { icon: <LockIcon fontSize="small" />, text: 'JWT authentication + role-based access' },
  { icon: <VerifiedUserIcon fontSize="small" />, text: 'SHA-256 hashing with tamper detection' },
  { icon: <HubIcon fontSize="small" />, text: 'Hyperledger-ready ledger, AES-256 at rest' },
];

export default function AuthLayout({ children }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' } }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 6,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, #0E7490 0%, #0891B2 45%, #22D3EE 100%)',
        }}
      >
        <Box sx={{
          position: 'absolute', inset: 0, opacity: 0.25, pointerEvents: 'none',
          backgroundImage:
            'radial-gradient(400px 200px at 20% 20%, #ffffff 0%, transparent 60%),' +
            'radial-gradient(600px 260px at 80% 80%, #ffffff 0%, transparent 60%)',
        }} />
        <Box sx={{ position: 'relative' }}>
          <BrandMark size={40} tagline="Secure medical records" inverse />
        </Box>

        <Box sx={{ position: 'relative', maxWidth: 520 }}>
          <Chip
            label="Blockchain-verified EMR"
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: 'white', fontWeight: 600, mb: 3 }}
          />
          <Typography variant="h3" sx={{ color: 'white', mb: 2, lineHeight: 1.15 }}>
            Clinical records you can <Box component="span" sx={{ color: '#BEF264' }}>trust</Box>.
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.88)', mb: 4 }}>
            A modern EMR built on a layered security model — authentication, RBAC, cryptographic hashing, and an immutable audit ledger.
          </Typography>
          <Stack spacing={1.25}>
            {points.map((p) => (
              <Stack key={p.text} direction="row" spacing={1.5} alignItems="center">
                <Box sx={{
                  width: 32, height: 32, borderRadius: 2,
                  display: 'grid', placeItems: 'center',
                  bgcolor: 'rgba(255,255,255,0.14)',
                }}>
                  {p.icon}
                </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.92)' }}>
                  {p.text}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', position: 'relative' }}>
          © {new Date().getFullYear()} EMR Chain — Rutuja K. Rathod, M.Tech project
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, md: 6 } }}>
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          <Box sx={{ display: { md: 'none' }, mb: 4 }}>
            <BrandMark />
          </Box>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
