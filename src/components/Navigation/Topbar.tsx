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
import { useIsMobile } from 'hooks';
import type { SetState } from 'types';
import GuildSelector from 'components/GuildSelector';

interface Props {
  setSidebarOpen: SetState<boolean>,
}

const Topbar: React.FC<Props> = ({ setSidebarOpen }) => {
  const { user, refetchUser } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useIsMobile();
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

  return (
    <AppBar position="fixed" sx={{ width: '100%' }}>
      <Toolbar sx={{ gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          {!isMobile && (
            <ButtonBase
              sx={{ display: 'flex', alignItems: 'center', gap: 2, padding: theme.spacing(0.5, 1) }}
              onClick={() => handleNavigate('/')}
            >
              <img src="logo32.png" alt="Logo" width="22" height="22" />
              <Typography variant="h6">
                Utility Discord Bot
              </Typography>
            </ButtonBase>
          )}
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', pt: 1.5, pb: 1 }}>
          <GuildSelector dense />
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
