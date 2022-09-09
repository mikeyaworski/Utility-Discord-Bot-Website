import React, { useCallback, useContext, useEffect, useState } from 'react';
import get from 'lodash.get';
import uniqBy from 'lodash.uniqby';
import {
  TextField,
  MenuItem,
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
import { SocketEventTypes } from 'types/sockets';
import { useAlert } from 'alerts';
import { useSocket } from 'hooks';
import SearchInput from 'components/SearchInput';
import ReminderCard from './Reminder';
import ReminderCardSkeleton from './ReminderSkeleton';
import CreateModal, { Payload as CreateReminderPayload } from './CreateModal';

const sortPrefKey = 'REMINDERS_SORT_PREFERENCE';

enum Sorts {
  CREATED_DESC,
  NEXT_RUN_ASC,
}

const Reminders: React.FC = () => {
  const alert = useAlert();
  const { user } = useContext(AuthContext);
  const { selectedGuildId } = useContext(GuildContext);
  const [sort, setSort] = useState<Sorts>(() => {
    const pref = window.localStorage.getItem(sortPrefKey);
    if (pref != null) return Number(pref);
    return Sorts.NEXT_RUN_ASC;
  });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalBusy, setCreateModalBusy] = useState(false);

  const socket = useSocket();
  useEffect(() => {
    socket?.on(SocketEventTypes.REMINDER_CREATED, (data: Reminder) => {
      setReminders(old => old.concat(data));
    });
    socket?.on(SocketEventTypes.REMINDER_UPDATED, (data: Reminder) => {
      setReminders(old => old.map(r => (r.model.id === data.model.id ? data : r)));
    });
    socket?.on(SocketEventTypes.REMINDER_DELETED, (data: { id: string }) => {
      setReminders(old => old.filter(r => r.model.id !== data.id));
    });
  }, [socket]);

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

  useEffect(() => {
    window.localStorage.setItem(sortPrefKey, String(sort));
  }, [sort]);

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

  // Reverse before removing duplicates since we assume the last duplicate
  // is the freshest, and we should keep that one
  const filteredReminders = uniqBy(reminders.reverse(), r => r.model.id).reverse()
    .filter(r => r.model.guild_id === selectedGuildId)
    .filter(r => r.model.message?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      switch (sort) {
        case Sorts.NEXT_RUN_ASC: {
          const aNextRun = a.nextRun != null ? a.nextRun : a.model.time * 1000;
          const bNextRun = b.nextRun != null ? b.nextRun : b.model.time * 1000;
          return new Date(aNextRun) < new Date(bNextRun) ? -1 : 1;
        }
        case Sorts.CREATED_DESC:
        default: {
          return new Date(a.model.createdAt) < new Date(b.model.createdAt) ? 1 : -1;
        }
      }
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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2, gap: 2 }}>
        <SearchInput
          value={search}
          onChange={newValue => setSearch(newValue)}
          variant="outlined"
          label="Search"
          sx={{
            width: '100%',
            maxWidth: 320,
          }}
        />
        <TextField
          select
          value={sort}
          label="Sort By"
          onChange={e => setSort(e.target.value as unknown as Sorts)}
        >
          <MenuItem value={Sorts.CREATED_DESC}>Date Created</MenuItem>
          <MenuItem value={Sorts.NEXT_RUN_ASC}>Next Run Time</MenuItem>
        </TextField>
      </Box>
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
