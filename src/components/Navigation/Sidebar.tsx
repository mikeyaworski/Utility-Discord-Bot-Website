import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChessBoard } from '@fortawesome/free-solid-svg-icons';
import {
  IconButton,
  SwipeableDrawer as Drawer,
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
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Home as HomeIcon,
  Assignment as RemindersIcon,
  NotStarted as NotStartedIcon,
  Chat as ChatIcon,
  Movie as MovieIcon,
} from '@mui/icons-material';
import type { SetState } from 'types';

export const sidebarWidth = 240;

interface Route {
  icon: React.ReactNode,
  label: string,
  path: string,
}

export const routes: readonly Route[] = Object.freeze([
  Object.freeze({
    icon: <HomeIcon color="inherit" />,
    label: 'Home',
    path: '/',
  }),
  Object.freeze({
    icon: <RemindersIcon color="inherit" />,
    label: 'Reminders',
    path: '/reminders',
  }),
  Object.freeze({
    icon: <NotStartedIcon color="inherit" />,
    label: 'Player',
    path: '/player',
  }),
  Object.freeze({
    icon: <ChatIcon color="inherit" />,
    label: 'ChatGPT',
    path: '/chatgpt',
  }),
  Object.freeze({
    icon: <MovieIcon color="inherit" />,
    label: 'Movies',
    path: '/movies',
  }),
  Object.freeze({
    icon: <FontAwesomeIcon icon={faChessBoard} style={{ width: 22, height: 22, padding: 2 }} color="inherit" />,
    label: 'Chess',
    path: '/chess',
  }),
]);

export const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

interface Props {
  sidebarOpen: boolean,
  setSidebarOpen: SetState<boolean>,
}

const Sidebar: React.FC<Props> = ({ sidebarOpen, setSidebarOpen }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const activeRouteIdx = useMemo(() => {
    return routes.findIndex(route => route.path === location.pathname);
  }, [location]);

  return (
    <Drawer
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="temporary"
      anchor="left"
      open={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      onOpen={() => setSidebarOpen(true)}
    >
      <DrawerHeader>
        <IconButton onClick={() => setSidebarOpen(false)}>
          {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <List>
        {routes.map(({ icon, label, path }, idx) => (
          <ListItem disablePadding key={label}>
            <ListItemButton onClick={() => navigate(path)}>
              <ListItemIcon sx={{ color: idx === activeRouteIdx ? theme.palette.primary.main : '#FFFFFF' }}>
                {icon}
              </ListItemIcon>
              <ListItemText primary={label} sx={{ color: idx === activeRouteIdx ? theme.palette.primary.main : '#FFFFFF' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
