/**
 * https://github.com/nzbin/three-dots
 * https://codepen.io/nzbin/pen/GGrXbp
 */

import { Box, useTheme, keyframes } from '@mui/material';

const dotPulseBefore = keyframes`
  0% {
    box-shadow: 9984px 0 0 -5px;
  },
  30% {
    box-shadow: 9984px 0 0 2px;
  },
  60% {
    box-shadow: 9984px 0 0 -5px;
  },
  100% {
    box-shadow: 9984px 0 0 -5px;
  },
`;

const dotPulse = keyframes`
  0% {
    box-shadow: 9999px 0 0 -5px;
  },
  30% {
    box-shadow: 9999px 0 0 2px;
  },
  60% {
    box-shadow: 9999px 0 0 -5px;
  },
  100% {
    box-shadow: 9999px 0 0 -5px;
  },
`;

const dotPulseAfter = keyframes`
  0% {
    box-shadow: 10014px 0 0 -5px;
  },
  30% {
    box-shadow: 10014px 0 0 2px;
  },
  60% {
    box-shadow: 10014px 0 0 -5px;
  },
  100% {
    box-shadow: 10014px 0 0 -5px;
  },
`;

export default function DotPulse(): JSX.Element {
  const theme = useTheme();
  return (
    <Box width="45px" height="15px" display="flex" alignItems="center" justifyContent="center">
      <Box sx={{
        position: 'relative',
        left: '-9999px',
        width: '10px',
        height: '10px',
        borderRadius: '5px',
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.main,
        boxShadow: '9999px 0 0 -5px',
        animation: `${dotPulse} 1.5s infinite linear`,
        animationDelay: '0.25s',
        '&::before': {
          content: '""',
          display: 'inline-block',
          position: 'absolute',
          top: '0',
          width: '10px',
          height: '10px',
          borderRadius: '5px',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.main,

          boxShadow: '9984px 0 0 -5px',
          animation: `${dotPulseBefore} 1.5s infinite linear`,
          animationDelay: '0s',
        },
        '&::after': {
          content: '""',
          display: 'inline-block',
          position: 'absolute',
          top: '0',
          width: '10px',
          height: '10px',
          borderRadius: '5px',
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.main,

          boxShadow: '10014px 0 0 -5px',
          animation: `${dotPulseAfter} 1.5s infinite linear`,
          animationDelay: '0.5s',
        },
      }}
      />
    </Box>
  );
}
