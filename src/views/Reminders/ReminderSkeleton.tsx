import React from 'react';
import {
  Card,
  CardActions,
  CardContent,
  Skeleton,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const ReminderCardSkeleton: React.FC = () => {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width={250} height={22} />
        <Skeleton variant="text" width={250} height={22} />
      </CardContent>
      <CardContent>
        <Skeleton variant="rectangular" width={250} height={22} />
      </CardContent>
      <CardActions>
        <IconButton size="small" disabled>
          <EditIcon />
        </IconButton>
        <IconButton size="small" disabled>
          <DeleteIcon color="error" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default ReminderCardSkeleton;
