import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  styled,
  useTheme,
} from '@mui/material';
import { AuthContext } from 'contexts/auth';
import { error } from 'logging';
import { fetchApi } from 'utils';
import { useIsMobile } from 'hooks';
import Sidebar, { sidebarWidth, DrawerHeader } from './Sidebar';
import Topbar from './Topbar';

const Main = styled('main', { shouldForwardProp: prop => prop !== 'shrunk' })<{
  shrunk?: boolean;
}>(({ theme, shrunk }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  // marginLeft: `-${sidebarWidth}px`,
  ...(shrunk && {
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
  const { refetchUser, refetchBotDm } = useContext(AuthContext);
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          window.history.pushState(
            '',
            document.title,
            window.location.pathname + window.location.search,
          );
          const user = await refetchUser();
          if (user) await refetchBotDm();
        } catch (err) {
          error('Error:', err);
        }
      }
      if (token) {
        logIn();
      }
    }
  }, [refetchUser, refetchBotDm]);

  return (
    <Box sx={{ display: 'flex' }}>
      <Topbar setSidebarOpen={setSidebarOpen} />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <DrawerHeader />
        <Box sx={{
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
