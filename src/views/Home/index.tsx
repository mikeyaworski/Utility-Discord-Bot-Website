import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { AuthContext } from 'contexts/auth';
import { routes } from 'components/Navigation/Sidebar';

const Home: React.FC = () => {
  const { hasFetched } = useContext(AuthContext);
  const navigate = useNavigate();
  if (!hasFetched) return null;
  return (
    <Paper sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
      <List sx={{ width: '100%' }}>
        {routes.map(({ icon, label, path }) => (
          <ListItem disablePadding key={label}>
            <ListItemButton onClick={() => navigate(path)}>
              <ListItemIcon>
                {icon}
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
