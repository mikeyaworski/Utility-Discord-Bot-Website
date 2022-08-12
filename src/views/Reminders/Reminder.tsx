import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Typography,
  IconButton,
  CardHeader,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { Reminder } from 'types';
import ConfirmModal from 'modals/Confirm';
import { fetchApi, humanizeDuration, getDateString } from 'utils';
import { useChannel } from 'hooks';
import EditModal from './EditModal';

interface Props {
  reminder: Reminder,
  onReminderUpdated: (reminder: Reminder) => void,
  onReminderDeleted: () => void,
}

const ReminderCard: React.FC<Props> = ({ reminder, onReminderUpdated, onReminderDeleted }) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalBusy, setDeleteModalBusy] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalBusy, setEditModalBusy] = useState(false);

  const channel = useChannel(reminder.model.channel_id);

  const handleEdit = useCallback(async (newReminder: Reminder) => {
    setEditModalBusy(true);
    await fetchApi({
      method: 'PUT',
      path: `/reminders/${newReminder.model.id}`,
      body: JSON.stringify(newReminder.model),
    });
    onReminderUpdated(newReminder);
    setEditModalOpen(false);
    setEditModalBusy(false);
  }, [onReminderUpdated]);

  const handleDelete = useCallback(async () => {
    setDeleteModalBusy(true);
    await fetchApi({
      method: 'DELETE',
      path: `/reminders/${reminder.model.id}`,
    });
    setDeleteModalOpen(false);
    onReminderDeleted();
    setDeleteModalBusy(false);
  }, [onReminderDeleted, reminder.model.id]);

  const [remainingTime, setRemainingTime] = useState<number>((reminder.model.time * 1000) - Date.now());
  const [nextRunRemaining, setNextRunRemaining] = useState<number | null>(reminder.nextRun
    ? reminder.nextRun - Date.now()
    : null);
  const [endTimeRemaining, setEndTimeRemaining] = useState<number | null>(reminder.model.end_time
    ? (reminder.model.end_time * 1000) - Date.now()
    : null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((reminder.model.time * 1000) - Date.now());
      setNextRunRemaining(reminder.nextRun ? reminder.nextRun - Date.now() : null);
      setEndTimeRemaining(reminder.model.end_time ? (reminder.model.end_time * 1000) - Date.now() : null);
    }, 5000);
    return () => clearInterval(interval);
  }, [reminder]);

  const timeString = remainingTime > 0
    ? `${getDateString(reminder.model.time)}\n(${humanizeDuration(remainingTime)})`
    : getDateString(reminder.model.time);

  return (
    <>
      <ConfirmModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Are you sure you want to delete this reminder?"
        details={`"${
          reminder.model.message || 'Timer is up!'
        }" in ${
          nextRunRemaining
            ? humanizeDuration(nextRunRemaining)
            : getDateString(reminder.model.time)
        }`}
        confirmColor="error"
        confirmText="Delete"
        confirmIcon={<DeleteIcon />}
        busy={deleteModalBusy}
      />
      <EditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onConfirm={handleEdit}
        reminder={reminder}
        confirmText="Save"
        busy={editModalBusy}
      />
      <Card sx={{ width: 320, display: 'flex', flexDirection: 'column' }}>
        <CardHeader title={<Typography variant="h6">Reminder</Typography>} />
        <CardContent sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Message</Typography>
              <Typography variant="body2">{reminder.model.message || 'Timer is up!'}</Typography>
            </Box>
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Time</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {timeString}
              </Typography>
            </Box>
            {reminder.model.interval && (
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Interval</Typography>
              <Typography variant="body2">
                {humanizeDuration(reminder.model.interval * 1000)}
              </Typography>
            </Box>
            )}
            {reminder.model.interval && reminder.model.end_time && endTimeRemaining && (
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>End Time</Typography>
                <Typography variant="body2">
                  {getDateString(reminder.model.end_time)}
                  <br />
                  ({humanizeDuration(endTimeRemaining)})
                </Typography>
              </Box>
            )}
            {reminder.model.interval && reminder.model.max_occurrences && !reminder.model.end_time && (
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Max Occurrences</Typography>
                <Typography variant="body2">
                  {reminder.model.max_occurrences}
                </Typography>
              </Box>
            )}
            {reminder.model.interval && nextRunRemaining && (
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Next Run</Typography>
                <Typography variant="body2">
                  {humanizeDuration(nextRunRemaining)}
                </Typography>
              </Box>
            )}
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Channel</Typography>
              <Typography variant="body2">
                {channel ? `#${channel.name}` : 'Unknown'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
        <CardActions sx={{ mt: 'auto' }}>
          <IconButton size="small" onClick={() => setEditModalOpen(true)}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => setDeleteModalOpen(true)}>
            <DeleteIcon color="error" />
          </IconButton>
        </CardActions>
      </Card>
    </>
  );
};

export default ReminderCard;
