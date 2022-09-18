import React from 'react';
import {
  Card,
  CardActions,
  CardHeader,
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
    <Card sx={{ width: 320 }}>
      <CardHeader title={<Skeleton variant="text" width={250} height={40} />} />
      <CardContent>
        <Skeleton variant="text" width={250} height={30} />
        <Skeleton variant="text" width={250} height={30} />
        <Skeleton variant="text" width={250} height={30} />
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
