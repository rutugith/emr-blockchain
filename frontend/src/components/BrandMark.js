import React from 'react';
import { Box, Typography } from '@mui/material';

export default function BrandMark({ size = 32, showText = true, tagline, inverse = false }) {
  const primaryText = inverse ? '#FFFFFF' : 'text.primary';
  const accentText = inverse ? '#BEF264' : 'primary.main';
  const taglineColor = inverse ? 'rgba(255,255,255,0.8)' : 'text.secondary';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        sx={{
          width: size, height: size, borderRadius: 2,
          display: 'grid', placeItems: 'center',
          background: inverse
            ? 'rgba(255,255,255,0.16)'
            : 'linear-gradient(135deg, #0891B2 0%, #22D3EE 100%)',
          boxShadow: inverse ? 'none' : '0 6px 18px -6px rgba(8,145,178,0.55)',
          color: 'white',
        }}
        aria-hidden
      >
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s-7-4.5-7-11a7 7 0 0 1 14 0c0 6.5-7 11-7 11Z" />
          <path d="M9 10h2v-2h2v2h2v2h-2v2h-2v-2H9z" />
        </svg>
      </Box>
      {showText && (
        <Box sx={{ lineHeight: 1 }}>
          <Typography
            variant="h6"
            sx={{ fontFamily: '"Figtree",sans-serif', fontWeight: 800, letterSpacing: '-0.01em', color: primaryText }}
          >
            EMR<Box component="span" sx={{ color: accentText }}>Chain</Box>
          </Typography>
          {tagline && (
            <Typography
              variant="caption"
              sx={{ color: taglineColor, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', mt: 0.25 }}
            >
              {tagline}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
