import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from '@mui/icons-material';
import type { SetState } from 'types';

export const sidebarWidth = 240;

interface Route {
  icon: typeof RemindersIcon,
  label: string,
  path: string,
}

export const routes: readonly Route[] = Object.freeze([
  Object.freeze({
    icon: HomeIcon,
    label: 'Home',
    path: '/',
  }),
  Object.freeze({
    icon: RemindersIcon,
    label: 'Reminders',
    path: '/reminders',
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
        {routes.map(({ icon: Icon, label, path }, idx) => (
          <ListItem disablePadding key={label}>
            <ListItemButton onClick={() => navigate(path)}>
              <ListItemIcon>
                <Icon sx={{ color: idx === activeRouteIdx ? theme.palette.primary.main : '#FFFFFF' }} />
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
