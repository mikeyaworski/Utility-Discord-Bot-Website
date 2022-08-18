import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  styled,
  SvgIconTypeMap,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Assignment as RemindersIcon,
} from '@mui/icons-material';
import type { SetState } from 'types';
import GuildSelector from './GuildSelector';

export const sidebarWidth = 240;

interface Route {
  icon: typeof RemindersIcon,
  label: string,
  path: string,
}

const routes: Route[] = [
  {
    icon: RemindersIcon,
    label: 'Reminders',
    path: '/reminders',
  },
];

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
  const navigate = useNavigate();

  function handleNavigate(route: string) {
    navigate(route);
  }

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
        {routes.map(({ icon: Icon, label, path }) => (
          <ListItem disablePadding key={label}>
            <ListItemButton onClick={() => handleNavigate(path)}>
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
