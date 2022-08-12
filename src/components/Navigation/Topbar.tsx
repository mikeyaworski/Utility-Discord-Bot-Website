import React, { useContext } from 'react';
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
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
} from '@mui/icons-material';
import { AuthContext } from 'contexts/auth';
import { error } from 'logging';
import { fetchApi } from 'utils';
import type { SetState } from 'types';
import { sidebarWidth } from './Sidebar';
import GuildSelector from './GuildSelector';

interface Props {
  sidebarOpen: boolean,
  setSidebarOpen: SetState<boolean>,
}

const Topbar: React.FC<Props> = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, refetchUser } = useContext(AuthContext);
  const theme = useTheme();
  const navigate = useNavigate();

  function handleNavigate(route: string) {
    navigate(route);
  }

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

  const contentWidth = sidebarOpen ? `calc(100% - ${sidebarWidth}px)` : '100%';

  return (
    <AppBar position="fixed" sx={{ width: contentWidth }}>
      <Toolbar sx={{ gap: 1 }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          sx={{ mr: 2, ...(sidebarOpen && { display: 'none' }) }}
          onClick={() => setSidebarOpen(true)}
        >
          <MenuIcon />
        </IconButton>
        <ButtonBase
          sx={{ display: 'flex', alignItems: 'center', gap: 2, padding: theme.spacing(0.5, 1) }}
          onClick={() => handleNavigate('/')}
        >
          <img src="logo500.png" alt="Logo" width="22" height="22" />
          <Typography variant="h6">
            Utility Discord Bot
          </Typography>
        </ButtonBase>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', pt: 1.5, pb: 1 }}>
          <GuildSelector />
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
  );
};

export default Topbar;
