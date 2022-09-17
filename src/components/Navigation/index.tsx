import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from 'contexts/auth';
import { error } from 'logging';
import { fetchApi } from 'utils';
import { useOauthState } from 'hooks';
import { useAlert } from 'alerts';
import Sidebar, { DrawerHeader } from './Sidebar';
import Topbar from './Topbar';

interface Props {
  children: React.ReactNode,
}

const Navigation: React.FC<Props> = ({ children }) => {
  const alert = useAlert();
  const theme = useTheme();
  const navigate = useNavigate();
  const { validate: validateOauthState } = useOauthState();
  const { refetchUser, refetchBotDm } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (!code || !state) return;

      const { oauthState, redirectPath } = JSON.parse(state);
      const data = { code };
      async function logIn() {
        try {
          await fetchApi({
            path: '/auth/login',
            method: 'POST',
            body: JSON.stringify(data),
          });
          window.history.pushState(
            '',
            document.title,
            window.location.pathname,
          );
          if (redirectPath) navigate(redirectPath);
          const user = await refetchUser();
          if (user) await refetchBotDm();
        } catch (err) {
          error('Error:', err);
          alert.error('Could not log in');
        }
      }
      if (validateOauthState(oauthState)) logIn();
      else alert.error('Invalid OAuth State');
    }
  }, [refetchUser, refetchBotDm, alert, validateOauthState, navigate]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Box
        component="main"
        display="flex"
        flexDirection="column"
        height="100vh"
        flexGrow={1}
      >
        <DrawerHeader />
        <Box sx={{
          flexGrow: 1,
          overflow: 'auto',
          padding: theme.spacing(5),
          [theme.breakpoints.down('md')]: {
            padding: theme.spacing(4),
          },
          [theme.breakpoints.down('sm')]: {
            padding: theme.spacing(2),
          },
        }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Navigation;
