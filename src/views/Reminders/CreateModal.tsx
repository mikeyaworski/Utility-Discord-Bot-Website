import React, { useContext, useState, useEffect } from 'react';
import BaseModal, { BaseModalProps } from 'modals/Base';
import { ReminderModel } from 'types';
import { Box, Typography } from '@mui/material';
import { useGuildState } from 'hooks';
import GuildSelector from 'components/GuildSelector';
import { AuthContext } from 'contexts/auth';
import { convertReactMentionsToDiscordMentions } from 'utils';
import ModalInputs from './ModalInputs';
import { getFilteredTimesFromInput } from './utils';

export type Payload = Omit<ReminderModel, 'id' | 'guild_id' | 'owner_id' | 'createdAt' | 'updatedAt'> & {
  message: string | null,
};

type Props = Omit<BaseModalProps, 'onConfirm'> & {
  onConfirm: (payloads: Payload[]) => void,
}

const CreateReminderModal: React.FC<Props> = ({
  onConfirm,
  ...baseModalProps
}) => {
  const { botDmChannelId } = useContext(AuthContext);

  const {
    id: guildId,
    onChange: onGuildChange,
  } = useGuildState({
    fetchGuildData: false,
  });

  const [message, setMessage] = useState<string>('');
  const [times, setTimes] = useState<(number | string)[]>([]);
  const [interval, setInterval] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [maxOccurrences, setMaxOccurrences] = useState<number | null>(null);
  const [channelId, setChannelId] = useState<string | null>(() => {
    if (!guildId && botDmChannelId) return botDmChannelId;
    return null;
  });

  useEffect(() => {
    if (!guildId && botDmChannelId) setChannelId(botDmChannelId);
    else setChannelId(null);
  }, [guildId, botDmChannelId]);

  const canConfirm = Boolean(times[0]) && Boolean(channelId);

  function handleConfirm() {
    const formattedMessage = convertReactMentionsToDiscordMentions(message);
    if (times.length > 0 && channelId) {
      onConfirm(getFilteredTimesFromInput(times).map(time => ({
        message: formattedMessage || null,
        time,
        interval,
        end_time: endTime,
        max_occurrences: maxOccurrences,
        channel_id: channelId,
      })));
    }
  }

  return (
    <BaseModal
      {...baseModalProps}
      onConfirm={() => handleConfirm()}
      canConfirm={canConfirm}
      disableBackdropDismissal
    >
      <Typography variant="h5" sx={{ mb: 2 }}>Create Reminder</Typography>
      <GuildSelector dense={false} guildId={guildId} onChange={onGuildChange} />
      <Box mb={2} />
      <ModalInputs
        message={message}
        onMessageChange={setMessage}
        interval={interval}
        onIntervalChange={setInterval}
        times={times}
        onTimesChange={setTimes}
        endTime={endTime}
        onEndTimeChange={setEndTime}
        maxOccurrences={maxOccurrences}
        onMaxOccurrencesChange={setMaxOccurrences}
        channelId={channelId}
        setChannelId={setChannelId}
        guildId={guildId}
      />
    </BaseModal>
  );
};

export default CreateReminderModal;
