import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  Box,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';
import { AuthContext } from 'contexts/auth';
import { fetchApi } from 'utils';
import { error } from 'logging';
import { Reminder } from 'types';
import ReminderCard, { ReminderCardSkeleton } from './Reminder';

const Reminders: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<Reminder[]>([]);

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

  const updateReminder = useCallback((reminder: Reminder) => {
    setReminders(old => old.map(oldReminder => (oldReminder.id === reminder.id ? reminder : oldReminder)));
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders(old => old.filter(reminder => reminder.id !== id));
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

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {reminders.map(reminder => (
          <ReminderCard
            key={reminder.id}
            reminder={reminder}
            updateReminder={updateReminder}
            deleteReminder={() => deleteReminder(reminder.id)}
          />
        ))}
      </Box>
      <Fab color="primary" sx={{ position: 'absolute', right: 40, bottom: 40 }}>
        <AddIcon />
      </Fab>
    </>
  );
};

export default Reminders;
