import { createTheme, alpha } from '@mui/material/styles';

const TEAL_50 = '#F0FDFA';
const TEAL_100 = '#CCFBF1';
const TEAL_500 = '#14B8A6';
const TEAL_600 = '#0D9488';
const TEAL_700 = '#0F766E';
const PRIMARY = '#0891B2';
const PRIMARY_DARK = '#0E7490';
const PRIMARY_LIGHT = '#22D3EE';
const ACCENT = '#22C55E';
const INK = '#134E4A';
const INK_SOFT = '#115E59';
const SURFACE = '#F8FAFC';
const SURFACE_ALT = '#F0FDFA';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: PRIMARY, dark: PRIMARY_DARK, light: PRIMARY_LIGHT, contrastText: '#FFFFFF' },
    secondary: { main: TEAL_600, light: TEAL_500, dark: TEAL_700, contrastText: '#FFFFFF' },
    success: { main: ACCENT, dark: '#15803D', light: '#4ADE80', contrastText: '#FFFFFF' },
    warning: { main: '#F59E0B', dark: '#B45309', light: '#FCD34D' },
    error: { main: '#EF4444', dark: '#B91C1C', light: '#FCA5A5' },
    info: { main: PRIMARY_LIGHT, dark: PRIMARY, light: '#67E8F9' },
    background: { default: SURFACE, paper: '#FFFFFF' },
    text: { primary: INK, secondary: INK_SOFT, disabled: '#94A3B8' },
    divider: '#E2E8F0',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Noto Sans", "Inter", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    h1: { fontFamily: '"Figtree", "Noto Sans", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontFamily: '"Figtree", "Noto Sans", sans-serif', fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontFamily: '"Figtree", "Noto Sans", sans-serif', fontWeight: 700, letterSpacing: '-0.015em' },
    h4: { fontFamily: '"Figtree", "Noto Sans", sans-serif', fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontFamily: '"Figtree", "Noto Sans", sans-serif', fontWeight: 600, letterSpacing: '-0.005em' },
    h6: { fontFamily: '"Figtree", "Noto Sans", sans-serif', fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
    body1: { fontSize: '0.975rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.55 },
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(15,23,42,0.04), 0 1px 3px 0 rgba(15,23,42,0.06)',
    '0 2px 4px -1px rgba(15,23,42,0.06), 0 4px 6px -1px rgba(15,23,42,0.08)',
    '0 4px 8px -2px rgba(15,23,42,0.08), 0 8px 16px -4px rgba(15,23,42,0.10)',
    '0 6px 12px -2px rgba(15,23,42,0.08), 0 12px 24px -6px rgba(15,23,42,0.12)',
    ...Array(20).fill('0 16px 32px -8px rgba(15,23,42,0.15)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(1200px 600px at -10% -20%, rgba(8,145,178,0.06), transparent 60%), radial-gradient(900px 500px at 110% 0%, rgba(34,211,238,0.05), transparent 60%)',
          backgroundAttachment: 'fixed',
          backgroundColor: SURFACE,
        },
        '*:focus-visible': {
          outline: `3px solid ${alpha(PRIMARY, 0.35)}`,
          outlineOffset: 2,
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 18, paddingBlock: 8, minHeight: 40 },
        containedPrimary: {
          boxShadow: `0 8px 20px -8px ${alpha(PRIMARY, 0.6)}`,
          '&:hover': { boxShadow: `0 12px 24px -8px ${alpha(PRIMARY, 0.6)}` },
        },
        containedSuccess: {
          boxShadow: `0 8px 20px -8px ${alpha(ACCENT, 0.6)}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 4px 12px -4px rgba(15,23,42,0.06)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 14 },
        outlined: { borderColor: '#E2E8F0' },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
      styleOverrides: {
        root: {
          backgroundColor: alpha('#FFFFFF', 0.85),
          backdropFilter: 'saturate(180%) blur(14px)',
          borderBottom: '1px solid #E2E8F0',
          color: INK,
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', fullWidth: true },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: 10 },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& fieldset': { borderColor: '#CBD5E1' },
          '&:hover fieldset': { borderColor: PRIMARY },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 8 },
        sizeSmall: { height: 22 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: SURFACE_ALT,
          '& .MuiTableCell-root': {
            fontWeight: 700,
            color: INK,
            fontSize: '0.78rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: alpha(PRIMARY_LIGHT, 0.04) },
          '&:last-child .MuiTableCell-root': { borderBottom: 0 },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottomColor: '#E2E8F0' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 44,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
  },
});

export const brand = {
  primary: PRIMARY,
  primaryDark: PRIMARY_DARK,
  primaryLight: PRIMARY_LIGHT,
  accent: ACCENT,
  teal50: TEAL_50,
  teal100: TEAL_100,
  ink: INK,
  surface: SURFACE,
};

export default theme;
