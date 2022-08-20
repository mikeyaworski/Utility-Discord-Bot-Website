import React, { useCallback, useContext, useEffect, useState } from 'react';
import get from 'lodash.get';
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
import { useAlert } from 'alerts';
import SearchInput from 'components/SearchInput';
import ReminderCard from './Reminder';
import ReminderCardSkeleton from './ReminderSkeleton';
import CreateModal, { Payload as CreateReminderPayload } from './CreateModal';

const Reminders: React.FC = () => {
  const alert = useAlert();
  const { user } = useContext(AuthContext);
  const { selectedGuildId } = useContext(GuildContext);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalBusy, setCreateModalBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchApi<Reminder[]>({
      path: '/reminders',
      queryParams: selectedGuildId ? [
        ['guild_id', selectedGuildId],
      ] : [],
    }).then(res => {
      setReminders(res);
      setLoading(false);
    }).catch(err => {
      error(err);
      alert.error('Failed to fetch reminders');
    });
  }, [user, selectedGuildId, alert]);

  const handleCreate = useCallback(async (payloads: CreateReminderPayload[]) => {
    setCreateModalBusy(true);
    try {
      const newReminders = await Promise.all(payloads.map(payload => fetchApi<Reminder>({
        method: 'POST',
        path: '/reminders',
        body: JSON.stringify(payload),
      })));
      setReminders(old => old.concat(newReminders));
      setCreateModalBusy(false);
      setCreateModalOpen(false);
      alert.success(newReminders.length > 1 ? `${newReminders.length} reminders created!` : 'Reminder created!');
    } catch (err) {
      setCreateModalBusy(false);
      alert.error(`Something went wrong: ${get(err, 'status')}`);
    }
  }, [alert]);

  const onReminderCreated = useCallback((reminder: Reminder) => {
    setReminders(old => old.concat(reminder));
  }, []);

  const onReminderUpdated = useCallback(async (reminder: Reminder) => {
    setReminders(old => old.map(oldReminder => (oldReminder.model.id === reminder.model.id ? reminder : oldReminder)));
    // Refetch the reminder since there is some data that needs to be retrieved from the server, like nextRun
    try {
      const updatedReminder = await fetchApi<Reminder>({
        path: `/reminders/${reminder.model.id}`,
      });
      setReminders(old => old.map(oldReminder => (oldReminder.model.id === reminder.model.id ? updatedReminder : oldReminder)));
      alert.success('Reminder updated');
    } catch (err) {
      alert.error('Reminder was updated, but could not be refetched. Try refreshing your page.');
    }
  }, [alert]);

  const onReminderDeleted = useCallback((id: string) => {
    setReminders(old => old.filter(reminder => reminder.model.id !== id));
    alert.success('Reminder deleted');
  }, [alert]);

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

  const filteredReminders = reminders
    .filter(r => r.model.guild_id === selectedGuildId)
    .filter(r => r.model.message?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      return new Date(a.model.createdAt) < new Date(b.model.createdAt) ? 1 : -1;
    });

  return (
    <>
      {createModalOpen && (
        <CreateModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onConfirm={handleCreate}
          confirmText="Save"
          busy={createModalBusy}
        />
      )}
      <SearchInput
        value={search}
        onChange={newValue => setSearch(newValue)}
        variant="outlined"
        label="Search"
        sx={{
          mb: 2,
          width: '100%',
          maxWidth: 320,
        }}
      />
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {filteredReminders.map(reminder => (
          <ReminderCard
            key={reminder.model.id}
            reminder={reminder}
            onReminderCreated={onReminderCreated}
            onReminderUpdated={onReminderUpdated}
            onReminderDeleted={() => onReminderDeleted(reminder.model.id)}
          />
        ))}
      </Box>
      <Fab
        color="primary"
        sx={{ position: 'fixed', right: 40, bottom: 40 }}
        onClick={() => setCreateModalOpen(true)}
        disabled={!user}
      >
        <AddIcon />
      </Fab>
    </>
  );
};

export default Reminders;
