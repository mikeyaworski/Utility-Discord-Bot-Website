/**
 * Lots of code copied from
 * https://mui.com/material-ui/react-drawer/#persistent-drawer
 */

import React, { useContext, useEffect } from 'react';
import {
  Box,
  styled,
} from '@mui/material';
import { AuthContext } from 'contexts/auth';
import { error } from 'logging';
import { fetchApi } from 'utils';
import Sidebar, { sidebarWidth, DrawerHeader } from './Sidebar';
import Topbar from './Topbar';

const Main = styled('main', { shouldForwardProp: prop => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${sidebarWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface Props {
  children: React.ReactNode,
}

const Navigation: React.FC<Props> = ({ children }) => {
  const { refetchUser } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  useEffect(() => {
    if (window.location.hash) {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const token = params.get('access_token');
      const tokenType = params.get('token_type');
      const expiresIn = params.get('expires_in');
      const scope = params.get('scope');
      const data = {
        token,
        tokenType,
        expiresIn,
        scope,
      };
      async function logIn() {
        try {
          await fetchApi({
            path: '/auth/login',
            method: 'POST',
            body: JSON.stringify(data),
          });
          window.history.replaceState(null, '', '#');
          await refetchUser();
        } catch (err) {
          error('Error:', err);
        }
      }
      if (token) {
        logIn();
      }
    }
  }, [refetchUser]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Main open={sidebarOpen}>
        <DrawerHeader />
        <Box sx={{ padding: 5 }}>
          {children}
        </Box>
      </Main>
    </Box>
  );
};

export default Navigation;
