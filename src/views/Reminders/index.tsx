import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Box,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { AuthContext } from 'contexts/auth';
import { GuildContext } from 'contexts/guild';
import { fetchApi } from 'utils';
import { error } from 'logging';
import { Reminder } from 'types';
import ReminderCard from './Reminder';
import ReminderCardSkeleton from './ReminderSkeleton';

const Reminders: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { selectedGuildId } = useContext(GuildContext);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchApi<Reminder[]>({
      path: '/reminders',
    }).then(res => {
      setReminders(res);
      setLoading(false);
    }).catch(err => {
      error(err);
    });
  }, [user]);

  const onReminderUpdated = useCallback((reminder: Reminder) => {
    setReminders(old => old.map(oldReminder => (oldReminder.model.id === reminder.model.id ? reminder : oldReminder)));
    // Refetch the reminder since there is some data that needs to be retrieved from the server, like nextRun
    fetchApi<Reminder>({
      path: `/reminders/${reminder.model.id}`,
    }).then(updatedReminder => {
      setReminders(old => old.map(oldReminder => (oldReminder.model.id === reminder.model.id ? updatedReminder : oldReminder)));
    });
  }, []);

  const onReminderDeleted = useCallback((id: string) => {
    setReminders(old => old.filter(reminder => reminder.model.id !== id));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {new Array(3).fill(0).map((_, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <ReminderCardSkeleton key={i} />
        ))}
      </Box>
    );
  }

  const filteredReminders = reminders.filter(r => r.model.guild_id === selectedGuildId);

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {filteredReminders.map(reminder => (
          <ReminderCard
            key={reminder.model.id}
            reminder={reminder}
            onReminderUpdated={onReminderUpdated}
            onReminderDeleted={() => onReminderDeleted(reminder.model.id)}
          />
        ))}
      </Box>
      <Fab
        color="primary"
        sx={{ position: 'absolute', right: 40, bottom: 40 }}
        onClick={() => setCreateModalOpen(true)}
      >
        <AddIcon />
      </Fab>
    </>
  );
};

export default Reminders;
