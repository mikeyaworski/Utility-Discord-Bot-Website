import React, { useContext, useEffect, useState } from 'react';
import { useConfirmationModal, useSocket } from 'hooks';
import { PlayerDisconnectedData, PlayerStatusData, SocketEventTypes } from 'types/sockets';
import { GuildContext } from 'contexts/guild';
import { fetchApi } from 'utils';
import { error } from 'logging';
import { Box, Button, CircularProgress, Fab, Tooltip, Typography } from '@mui/material';
import {
  Add as AddIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import NowPlaying from './NowPlaying';
import Queue from './Queue';
import PlayModal from './PlayModal';
import { useTryUpdate } from './utils';

const Player: React.FC = () => {
  const { selectedGuildId } = useContext(GuildContext);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [playModalOpen, setPlayModalOpen] = useState(false);

  const { node: confirmClearQueueModal, open: openConfirmClearQueueModal } = useConfirmationModal({
    confirmText: 'Clear',
    confirmColor: 'error',
  });

  const tryUpdate = useTryUpdate({ playerStatus, setPlayerStatus, setBusy });

  useEffect(() => {
    if (selectedGuildId) {
      setLoading(true);
      fetchApi<PlayerStatusData>({
        path: `/player/${selectedGuildId}`,
      }).then(res => {
        setPlayerStatus(res);
        setLoading(false);
      }).catch(err => {
        error(err);
        setPlayerStatus(null);
        setLoading(false);
      });
    } else {
      setPlayerStatus(null);
    }
  }, [selectedGuildId]);

  const socket = useSocket();
  useEffect(() => {
    socket?.on(SocketEventTypes.PLAYER_STATUS_CHANGED, (data: PlayerStatusData) => {
      if (data.guildId === selectedGuildId) setPlayerStatus(data);
    });
    socket?.on(SocketEventTypes.PLAYER_DISCONNECTED, ({ guildId }: PlayerDisconnectedData) => {
      if (guildId === selectedGuildId) setPlayerStatus(null);
    });
    return () => {
      socket?.removeAllListeners();
    };
  }, [socket, selectedGuildId]);

  async function clearQueue() {
    tryUpdate(async () => {
      setPlayerStatus(old => {
        if (!old) return old;
        return { ...old, queue: [] };
      });
      await fetchApi({
        path: `/player/${selectedGuildId}/queue/clear`,
        method: 'POST',
      });
    });
  }

  // TODO: Add ability to create, edit and delete favorites as well
  const fab = (
    <Fab
      color="primary"
      sx={{ position: 'fixed', right: 40, bottom: 40 }}
      onClick={() => setPlayModalOpen(true)}
      title="Play something"
    >
      <AddIcon />
    </Fab>
  );

  const playModal = playModalOpen && (
    <PlayModal
      open
      onConfirm={() => Promise.resolve()}
      onClose={() => setPlayModalOpen(false)}
    />
  );

  if (loading) {
    return (
      <CircularProgress />
    );
  }

  if (!selectedGuildId) {
    return (
      <Typography variant="body1">
        Select a discord server at the top in order to play audio.
      </Typography>
    );
  }

  // TODO: Only show the play button if they're connected to a voice channel (need to keep this updated with sockets, so do it later)
  if (!playerStatus || (!playerStatus.currentTrack && playerStatus.queue.length === 0)) {
    return (
      <>
        <Button variant="contained" onClick={() => setPlayModalOpen(true)}>
          Play something!
        </Button>
        {fab}
        {playModal}
      </>
    );
  }

  return (
    <Box
      height="100%"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      <Box flexShrink={0}>
        <NowPlaying playerStatus={playerStatus} setPlayerStatus={setPlayerStatus} />
        {playerStatus.queue.length > 0 && (
          <Box display="flex" alignItems="center" gap={1} mt={3} mb={1} maxWidth={800} pr={1}>
            <Typography variant="h6">
              Queue ({playerStatus.queue.length})
            </Typography>
            <Tooltip title="Only the first 20 items in the queue are shown.">
              <InfoIcon fontSize="small" sx={{ cursor: 'pointer' }} />
            </Tooltip>
            <Button
              startIcon={<DeleteIcon />}
              onClick={() => openConfirmClearQueueModal({
                title: 'Are you sure you want to clear the queue?',
                onConfirm: clearQueue,
              })}
              disabled={busy}
              variant="text"
              color="error"
              size="small"
              sx={{ ml: 'auto' }}
            >
              Clear
            </Button>
          </Box>
        )}
      </Box>
      {playerStatus.queue.length > 0 && (
        <Box
          maxWidth={800}
          overflow="auto"
          pr={1}
          flexGrow={1}
          sx={{
            '&> * > *': {
              marginBottom: 1,
            },
          }}
        >
          <Queue
            disabled={busy}
            setBusy={setBusy}
            playerStatus={playerStatus}
            setPlayerStatus={setPlayerStatus}
          />
        </Box>
      )}
      {fab}
      {confirmClearQueueModal}
      {playModal}
    </Box>
  );
};

export default Player;
