import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from 'contexts/auth';
import { GuildProvider } from 'contexts/guild';
import theme from 'theme';
import Router from 'components/Router';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <GuildProvider>
          <Router />
        </GuildProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
