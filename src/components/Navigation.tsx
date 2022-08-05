/**
 * Lots of code copied from
 * https://mui.com/material-ui/react-drawer/#persistent-drawer
 */

import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  ButtonBase,
  Toolbar,
  AppBar,
  Typography,
  IconButton,
  Skeleton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  styled,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Assignment as RemindersIcon,
} from '@mui/icons-material';
import { AuthContext } from 'contexts/auth';
import { error } from 'logging';
import { fetchApi } from 'utils';

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Main = styled('main', { shouldForwardProp: prop => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
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

// TODO: Split sidebar and topbar into separate components
const Navigation: React.FC<Props> = ({ children }) => {
  const { user, refetchUser } = useContext(AuthContext);
  const theme = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  function handleNavigate(route: string) {
    navigate(route);
  }

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

  async function handleLogOut() {
    try {
      await fetchApi({
        path: '/auth/logout',
        method: 'POST',
      });
      await refetchUser();
    } catch (err) {
      error('Error:', err);
    }
  }

  const contentWidth = sidebarOpen ? `calc(100% - ${drawerWidth}px)` : '100%';

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ width: contentWidth }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            sx={{ mr: 2, ...(sidebarOpen && { display: 'none' }) }}
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <ButtonBase
              sx={{ display: 'flex', alignItems: 'center', gap: 2, padding: theme.spacing(0.5, 1) }}
              onClick={() => handleNavigate('/')}
            >
              <img src="logo500.png" alt="Logo" width="22" height="22" />
              <Typography variant="h6">
                Utility Discord Bot
              </Typography>
            </ButtonBase>
          </Box>
          {user === undefined ? (
            <Skeleton variant="rectangular" width={98} height={37} sx={{ borderRadius: '4px' }} />
          ) : user ? (
            <Button
              onClick={() => handleLogOut()}
              variant="contained"
            >
              Log Out
            </Button>
          ) : (
            <Button
              href={`https://discord.com/api/oauth2/authorize?client_id=${
                process.env.REACT_APP_DISCORD_BOT_CLIENT_ID
              }&redirect_uri=${
                encodeURIComponent(process.env.REACT_APP_REDIRECT_URI!)
              }&response_type=token&scope=identify%20guilds`}
              variant="contained"
              disabled={user === undefined}
            >
              Log In
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={sidebarOpen}
      >
        <DrawerHeader>
          <IconButton onClick={() => setSidebarOpen(false)}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => handleNavigate('/reminders')}>
              <ListItemIcon>
                <RemindersIcon />
              </ListItemIcon>
              <ListItemText primary="Reminders" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Main open={sidebarOpen}>
        <DrawerHeader />
        <Box sx={{ padding: 10 }}>
          {children}
        </Box>
      </Main>
    </Box>
  );
};

export default Navigation;
