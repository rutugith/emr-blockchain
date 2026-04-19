import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, Chip, Box, Stack, Alert,
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import GppBadIcon from '@mui/icons-material/GppBad';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';

const STATUS_META = {
  verified: { color: 'success', icon: <VerifiedIcon />, label: 'Verified', text: 'The record is intact. Local hash matches the ledger.' },
  tampered: { color: 'error', icon: <GppBadIcon />, label: 'Tampered', text: 'The record has been modified since it was committed to the ledger.' },
  not_found: { color: 'warning', icon: <GppMaybeIcon />, label: 'Not found', text: 'No ledger entry for this record.' },
};

export default function BlockchainVerificationModal({ open, onClose, verification }) {
  if (!verification) return null;
  const status = verification.status || (verification.match ? 'verified' : 'tampered');
  const meta = STATUS_META[status] || STATUS_META.tampered;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{
            width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center',
            bgcolor: `${meta.color}.main`, color: 'white',
          }}>
            {meta.icon}
          </Box>
          <Box>
            <Typography variant="h6" component="div">Blockchain verification</Typography>
            <Chip label={meta.label} color={meta.color} size="small" sx={{ mt: 0.5 }} />
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity={meta.color} sx={{ mb: 2 }}>{meta.text}</Alert>

        <Stack spacing={1.5}>
          <HashRow label="Local hash" value={verification.localHash} />
          <HashRow label="Ledger hash" value={verification.blockchainHash} />
          {verification.blockchainTxId && (
            <HashRow label="Transaction ID" value={verification.blockchainTxId} />
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

function HashRow({ label, value }) {
  return (
    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'grey.50', border: 1, borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.08em' }}>
        {label.toUpperCase()}
      </Typography>
      <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', mt: 0.5 }}>
        {value || '—'}
      </Typography>
    </Box>
  );
}
