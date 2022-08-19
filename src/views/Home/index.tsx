import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { routes } from 'components/Navigation/Sidebar';

const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Paper sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
      <List sx={{ width: '100%' }}>
        {routes.map(({ icon: Icon, label, path }) => (
          <ListItem disablePadding key={label}>
            <ListItemButton onClick={() => navigate(path)}>
              <ListItemIcon>
                <Icon />
              </ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Home;
