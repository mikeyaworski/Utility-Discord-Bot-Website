import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import React, { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';

import theme from 'theme';
import { useOauthState, useQueryParam } from 'hooks';
import { error as logError } from 'logging';
import { alertError } from 'utils';
import { AlertProvider } from 'alerts';
import ErrorBoundaryFallback from 'views/ErrorBoundaryFallback';
import { AuthProvider } from 'contexts/auth';
import { GuildProvider } from 'contexts/guild';
import Router from 'components/Router';

const App: React.FC = () => {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: err => {
        logError(err);
        alertError(err);
      },
    }),
  });

  const state = useQueryParam('state');
  const { set: setOauthState } = useOauthState();
  useEffect(() => {
    if (!state) setOauthState((Math.random() + 1).toString(36).substring(7));
  }, [setOauthState, state]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
        <AlertProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <GuildProvider>
                <Router />
              </GuildProvider>
            </AuthProvider>
          </QueryClientProvider>
        </AlertProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
