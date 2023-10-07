import React, { useContext, useEffect, useState } from 'react';
import { PlayerStatusData } from 'types/sockets';
import { Box, IconButton, LinearProgress, Typography } from '@mui/material';
import {
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  SkipNext as SkipNextIcon,
  SkipPrevious as SkipPreviousIcon,
  Loop as LoopIcon,
  Shuffle as ShuffleIcon,
} from '@mui/icons-material';
import { CurrentTrackPlayTime, SetState } from 'types';
import LinkedText from 'components/LinkedText';
import { fetchApi } from 'utils';
import { GuildContext } from 'contexts/guild';
import { getTrackDurationStrings, useTryUpdate } from './utils';

function getTrackCurrentTime(trackTimeData: CurrentTrackPlayTime, isPaused: boolean): number {
  if (!trackTimeData.started) return 0;
  const timeSinceStart = Date.now() - trackTimeData.started;
  const totalPauseTime = isPaused && trackTimeData.pauseStarted != null
    ? (Date.now() - trackTimeData.pauseStarted) + trackTimeData.totalPauseTime
    : trackTimeData.totalPauseTime;
  const timePlayed = (timeSinceStart - totalPauseTime) * trackTimeData.speed;
  if (trackTimeData.seeked != null) {
    return timePlayed + trackTimeData.seeked;
  }
  return timePlayed;
}

interface Props {
  playerStatus: PlayerStatusData,
  setPlayerStatus: SetState<PlayerStatusData | null>,
}

const NowPlaying: React.FC<Props> = ({ playerStatus, setPlayerStatus }) => {
  const { selectedGuildId } = useContext(GuildContext);
  const [busy, setBusy] = useState(false);
  const [currentTrackTime, setCurrentTrackTime] = useState<number | null>(null);

  function toggleProperty(key: string) {
    setPlayerStatus(old => {
      if (!old) return old;
      return {
        ...old,
        // @ts-ignore
        [key]: !old[key],
      };
    });
  }

  const tryUpdate = useTryUpdate({ playerStatus, setPlayerStatus, setBusy });

  async function togglePause() {
    tryUpdate(async () => {
      const path = playerStatus.isPaused ? 'resume' : 'pause';
      toggleProperty('isPaused');
      await fetchApi({
        path: `/player/${selectedGuildId}/${path}`,
        method: 'POST',
      });
    });
  }

  async function skip() {
    tryUpdate(async () => {
      setPlayerStatus(old => {
        if (!old) return old;
        return {
          ...old,
          isPaused: true,
          currentTrack: old.queue[0],
          queue: old.queue.slice(1),
        };
      });
      await fetchApi({
        path: `/player/${selectedGuildId}/skip`,
        method: 'POST',
      });
    });
  }

  async function shuffle() {
    const path = playerStatus.isShuffled ? 'unshuffle' : 'shuffle';
    tryUpdate(async () => {
      toggleProperty('isShuffled');
      await fetchApi({
        path: `/player/${selectedGuildId}/queue/${path}`,
        method: 'POST',
      });
    });
  }

  async function loop() {
    const path = playerStatus.isLooped ? 'unloop' : 'loop';
    tryUpdate(async () => {
      toggleProperty('isLooped');
      await fetchApi({
        path: `/player/${selectedGuildId}/queue/${path}`,
        method: 'POST',
      });
    });
  }

  useEffect(() => {
    if (playerStatus) {
      const interval = setInterval(() => {
        setCurrentTrackTime(getTrackCurrentTime(playerStatus.currentTime, playerStatus.isPaused));
      }, 1000);
      return () => clearInterval(interval);
    }
    return () => {};
  }, [playerStatus]);

  const currentTrackDuration = playerStatus.currentTrack?.duration;

  return playerStatus.currentTrack && (
    <>
      <Typography variant="h6" gutterBottom>Now Playing</Typography>
      <Box width="100%" maxWidth={350} mb={1}>
        <Box display="flex" justifyContent="center" width="100%">
          <IconButton onClick={() => shuffle()} disabled={busy}>
            <ShuffleIcon color={playerStatus.isShuffled ? 'primary' : 'inherit'} />
          </IconButton>
          <IconButton disabled>
            <SkipPreviousIcon />
          </IconButton>
          <IconButton onClick={() => togglePause()} disabled={busy}>
            {playerStatus.isPaused ? <PlayIcon /> : <PauseIcon />}
          </IconButton>
          <IconButton onClick={() => skip()} disabled={busy}>
            <SkipNextIcon />
          </IconButton>
          <IconButton onClick={() => loop()} disabled={busy}>
            <LoopIcon color={playerStatus.isLooped ? 'primary' : 'inherit'} />
          </IconButton>
        </Box>
        <Box display="flex" alignItems="center">
          {currentTrackTime != null && currentTrackDuration && (
            <Typography variant="body2" color="text.secondary">
              {getTrackDurationStrings(currentTrackTime, currentTrackDuration)[0]}
            </Typography>
          )}
          <Box width="100%" mx={1}>
            <LinearProgress
              variant={currentTrackTime != null && currentTrackDuration
                ? 'determinate'
                : 'indeterminate'}
              value={currentTrackTime != null && currentTrackDuration
                ? (currentTrackTime / currentTrackDuration) * 100
                : undefined}
            />
          </Box>
          {currentTrackTime != null && currentTrackDuration && (
            <Typography variant="body2" color="text.secondary">
              {getTrackDurationStrings(currentTrackTime, currentTrackDuration)[1]}
            </Typography>
          )}
        </Box>
      </Box>
      <Typography variant="body1">
        {playerStatus.currentTrack.title}
      </Typography>
      <LinkedText>
        <Typography variant="body1">
          {playerStatus.currentTrack.link}
        </Typography>
      </LinkedText>
      {playerStatus.currentTrack.sourceLink && (
        <LinkedText>
          <Typography variant="body1">
            {playerStatus.currentTrack.sourceLink}
          </Typography>
        </LinkedText>
      )}
    </>
  );
};

export default NowPlaying;
