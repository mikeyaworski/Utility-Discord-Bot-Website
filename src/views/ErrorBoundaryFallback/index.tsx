import React from 'react';
import { Alert, AlertTitle, Button, Paper } from '@mui/material';

interface Props {
  error: Error,
  resetErrorBoundary: () => void,
}

const ErrorBoundaryFallback: React.FC<Props> = ({ error, resetErrorBoundary }) => {
  return (
    <Paper sx={{ mx: 'auto', my: 2, maxWidth: '98%', width: 1000, py: 2, px: 4 }}>
      <Alert variant="filled" severity="error">
        <AlertTitle>Something went wrong</AlertTitle>
        <pre>
          {error.message}
        </pre>
      </Alert>
      <Button sx={{ mt: 2 }} variant="contained" color="inherit" onClick={() => resetErrorBoundary()}>
        Reset App State
      </Button>
    </Paper>
  );
};

export default ErrorBoundaryFallback;
