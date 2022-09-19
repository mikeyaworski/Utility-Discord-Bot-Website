import { Box, Button } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { useLogInLink } from 'hooks';
import React from 'react';

const LogIn: React.FC = () => {
  const logInLink = useLogInLink();
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Button
        href={logInLink}
        variant="contained"
        color="secondary"
        sx={{
          display: 'flex',
          gap: 0.5,
          alignItems: 'center',
          textTransform: 'none',
        }}
      >
        <FontAwesomeIcon icon={faDiscord} style={{ width: 22, height: 22, padding: 2 }} color="inherit" />
        Log in with Discord
      </Button>
    </Box>
  );
};

export default LogIn;
