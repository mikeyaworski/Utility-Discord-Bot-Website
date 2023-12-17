/**
 * https://github.com/nzbin/three-dots
 * https://codepen.io/nzbin/pen/GGrXbp
 */

import React from 'react';
import { makeStyles } from '@mui/styles';
import { Box, Theme } from '@mui/material';

const useStyles = makeStyles((theme: Theme) => ({
  dotPulse: {
    position: 'relative',
    left: '-9999px',
    width: '10px',
    height: '10px',
    borderRadius: '5px',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    boxShadow: '9999px 0 0 -5px',
    animation: '$dot-pulse 1.5s infinite linear',
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
      animation: '$dot-pulse-before 1.5s infinite linear',
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
      animation: '$dot-pulse-after 1.5s infinite linear',
      animationDelay: '0.5s',
    },
  },

  '@keyframes dot-pulse-before': {
    '0%': {
      boxShadow: '9984px 0 0 -5px',
    },
    '30%': {
      boxShadow: '9984px 0 0 2px',
    },
    '60%': {
      boxShadow: '9984px 0 0 -5px',
    },
    '100%': {
      boxShadow: '9984px 0 0 -5px',
    },
  },
  '@keyframes dot-pulse': {
    '0%': {
      boxShadow: '9999px 0 0 -5px',
    },
    '30%': {
      boxShadow: '9999px 0 0 2px',
    },
    '60%': {
      boxShadow: '9999px 0 0 -5px',
    },
    '100%': {
      boxShadow: '9999px 0 0 -5px',
    },
  },
  '@keyframes dot-pulse-after': {
    '0%': {
      boxShadow: '10014px 0 0 -5px',
    },
    '30%': {
      boxShadow: '10014px 0 0 2px',
    },
    '60%': {
      boxShadow: '10014px 0 0 -5px',
    },
    '100%': {
      boxShadow: '10014px 0 0 -5px',
    },
  },
}));

export default function DotPulse(): JSX.Element {
  const classes = useStyles();
  return (
    <Box width="45px" height="15px" display="flex" alignItems="center" justifyContent="center">
      <div className={classes.dotPulse} />
    </Box>
  );
}
