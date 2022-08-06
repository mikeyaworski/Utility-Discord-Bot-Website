import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Skeleton,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { Reminder } from 'types';

export const ReminderCardSkeleton: React.FC = () => {
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
        <IconButton size="small">
          <EditIcon />
        </IconButton>
        <IconButton size="small">
          <DeleteIcon color="error" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

interface Props {
  reminder: Reminder,
  updateReminder: (reminder: Reminder) => void,
  deleteReminder: () => void,
}

const ReminderCard: React.FC<Props> = ({ reminder, updateReminder, deleteReminder }) => {
  function handleEdit(id: string) {
    // TODO
  }

  function handleDelete(id: string) {
    // TODO
  }

  return (
    <Card>
      <CardContent>
        <Typography>{reminder.message || 'Timer is up!'}</Typography>
      </CardContent>
      <CardContent>
        <Typography variant="caption">{reminder.id}</Typography>
      </CardContent>
      <CardActions>
        <IconButton size="small" onClick={() => handleEdit(reminder.id)}>
          <EditIcon />
        </IconButton>
        <IconButton size="small" onClick={() => handleDelete(reminder.id)}>
          <DeleteIcon color="error" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default ReminderCard;
