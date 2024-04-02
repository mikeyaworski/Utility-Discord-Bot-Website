import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from 'contexts/auth';
import { error } from 'logging';
import { fetchApi } from 'utils';
import { useOauthState, useQueryParam } from 'hooks';
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
  const { validate: validateOauthState, remove: removeOauthState } = useOauthState();
  const { refetchUser, refetchBotDm } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const code = useQueryParam('code');
  const state = useQueryParam('state');

  useEffect(() => {
    if (!code || !state) return;
    const { oauthState, redirectPath } = JSON.parse(state);
    const data = {
      code,
      redirectUri: window.location.origin,
    };
    async function logIn() {
      try {
        await fetchApi({
          path: '/auth/login',
          method: 'POST',
          body: JSON.stringify(data),
        });
        navigate(redirectPath || window.location.pathname, { replace: true });
        removeOauthState();
        const user = await refetchUser();
        if (user) await refetchBotDm();
      } catch (err) {
        error('Error:', err);
        alert.error('Could not log in');
      }
    }
    if (validateOauthState(oauthState)) logIn();
    else alert.error('Invalid OAuth State');
  }, [
    code,
    state,
    refetchUser,
    refetchBotDm,
    alert,
    validateOauthState,
    removeOauthState,
    navigate,
  ]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Box
        component="main"
        display="flex"
        flexDirection="column"
        height="100vh"
        width="100vw"
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
