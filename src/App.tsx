import React, { useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AlertProvider } from 'alerts';
import { AuthProvider } from 'contexts/auth';
import { GuildProvider } from 'contexts/guild';
import theme from 'theme';
import Router from 'components/Router';
import { useOauthState } from 'hooks';

const App: React.FC = () => {
  const { set: setOauthState, remove: removeOauthState } = useOauthState();
  useEffect(() => {
    setOauthState((Math.random() + 1).toString(36).substring(7));
    return removeOauthState;
  }, [removeOauthState, setOauthState]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <GuildProvider>
          <AlertProvider>
            <Router />
          </AlertProvider>
        </GuildProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
