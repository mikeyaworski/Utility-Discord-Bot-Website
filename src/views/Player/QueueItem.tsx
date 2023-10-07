import React, { useContext } from 'react';
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
  Delete as DeleteIcon,
  VerticalAlignTop as MoveToTopIcon,
  PlayCircle as PlayIcon,
} from '@mui/icons-material';
import type { Track, SetState } from 'types';
import LinkedText from 'components/LinkedText';
import { fetchApi, getClockString } from 'utils';
import { DraggableProvided } from 'react-beautiful-dnd';
import { GuildContext } from 'contexts/guild';
import { useAlert } from 'alerts';
import { PlayerStatusData } from 'types/sockets';
import { useConfirmationModal } from 'hooks';
import { useTryUpdate } from './utils';

interface Props {
  data: Track,
  provided: DraggableProvided,
  disabled: boolean,
  setBusy: SetState<boolean>,
  playerStatus: PlayerStatusData,
  setPlayerStatus: SetState<PlayerStatusData | null>,
}

const QueueItem: React.FC<Props> = ({
  data,
  provided,
  disabled,
  setBusy,
  playerStatus,
  setPlayerStatus,
}) => {
  const { selectedGuildId } = useContext(GuildContext);
  const alert = useAlert();
  const { node: confirmRemoveModal, open: openConfirmRemoveModal } = useConfirmationModal({
    confirmColor: 'error',
    confirmText: 'Remove',
  });

  const tryUpdate = useTryUpdate({ playerStatus, setPlayerStatus, setBusy });

  async function remove() {
    tryUpdate(async () => {
      setPlayerStatus(old => {
        if (!old) return old;
        return {
          ...old,
          queue: old.queue.filter(track => track.id !== data.id),
        };
      });
      await fetchApi({
        path: `/player/${selectedGuildId}/queue/${data.id}/remove`,
        method: 'POST',
      });
    });
  }

  async function moveToTopOfQueue() {
    tryUpdate(async () => {
      const idx = playerStatus.queue.findIndex(track => track.id === data.id);
      setPlayerStatus(old => {
        if (!old) return old;
        return {
          ...old,
          queue: [data, ...old.queue.slice(0, idx), ...old.queue.slice(idx + 1)],
        };
      });
      await fetchApi({
        path: `/player/${selectedGuildId}/queue/move`,
        method: 'POST',
        body: JSON.stringify({
          from: idx,
          to: 0,
        }),
      });
    });
  }

  async function playImmediately() {
    tryUpdate(async () => {
      setPlayerStatus(old => {
        if (!old) return old;
        return {
          ...old,
          currentTrack: data,
          queue: old.queue.filter(track => track.id !== data.id),
        };
      });
      await fetchApi({
        path: `/player/${selectedGuildId}/queue/${data.id}/play_immediately`,
        method: 'POST',
      });
    });
  }

  return (
    <Box
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      ref={provided.innerRef}
      style={provided.draggableProps.style}
    >
      <Card
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'move',
        }}
      >
        {confirmRemoveModal}
        <CardContent sx={{ pb: 0 }}>
          <Typography variant="body1">{data.title}</Typography>
          <LinkedText>
            <Typography variant="body1">{data.link}</Typography>
          </LinkedText>
          {data.sourceLink && (
            <LinkedText>
              <Typography variant="body1">{data.sourceLink}</Typography>
            </LinkedText>
          )}
        </CardContent>
        <CardActions sx={{ mt: 'auto' }}>
          <IconButton
            size="small"
            disabled={disabled}
            onClick={() => openConfirmRemoveModal({
              onConfirm: remove,
              title: 'Remove from queue?',
              details: data.title,
            })}
          >
            <DeleteIcon color="error" />
          </IconButton>
          <IconButton
            size="small"
            disabled={disabled}
            onClick={() => moveToTopOfQueue()}
            title="Move to top of queue"
          >
            <MoveToTopIcon />
          </IconButton>
          <IconButton
            size="small"
            disabled={disabled}
            onClick={() => playImmediately()}
            title="Play immediately"
          >
            <PlayIcon />
          </IconButton>
          {data.duration && (
            <Typography color="text.secondary" sx={{ ml: 'auto', mr: 1 }}>
              {getClockString(data.duration)}
            </Typography>
          )}
        </CardActions>
      </Card>
    </Box>
  );
};

export default QueueItem;
