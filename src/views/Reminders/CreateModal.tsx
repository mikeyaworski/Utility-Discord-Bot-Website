import React, { useContext, useState } from 'react';
import BaseModal, { BaseModalProps } from 'modals/Base';
import { ReminderModel } from 'types';
import { Typography } from '@mui/material';
import { GuildContext } from 'contexts/guild';
import { AuthContext } from 'contexts/auth';
import { convertReactMentionsToDiscordMentions } from 'utils';
import ModalInputs from './ModalInputs';

export type Payload = Omit<ReminderModel, 'id' | 'guild_id' | 'owner_id' | 'createdAt' | 'updatedAt'> & {
  message: string | null,
};

type Props = Omit<BaseModalProps, 'onConfirm'> & {
  onConfirm: (payload: Payload) => void,
}

const CreateReminderModal: React.FC<Props> = ({
  onConfirm,
  ...baseModalProps
}) => {
  const { selectedGuildId } = useContext(GuildContext);
  const { botDmChannelId } = useContext(AuthContext);

  const [message, setMessage] = useState<string>('');
  const [time, setTime] = useState<number | null>(null);
  const [interval, setInterval] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [maxOccurrences, setMaxOccurrences] = useState<number | null>(null);
  const [channelId, setChannelId] = useState<string | null>(() => {
    if (!selectedGuildId && botDmChannelId) return botDmChannelId;
    return null;
  });

  const canConfirm = Boolean(time) && Boolean(channelId);

  function handleConfirm() {
    const formattedMessage = convertReactMentionsToDiscordMentions(message);
    if (time && channelId) {
      onConfirm({
        message: formattedMessage,
        time,
        interval,
        end_time: endTime,
        max_occurrences: maxOccurrences,
        channel_id: channelId,
      });
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
      <ModalInputs
        message={message}
        onMessageChange={setMessage}
        interval={interval}
        onIntervalChange={setInterval}
        time={time}
        onTimeChange={setTime}
        endTime={endTime}
        onEndTimeChange={setEndTime}
        maxOccurrences={maxOccurrences}
        onMaxOccurrencesChange={setMaxOccurrences}
        channelId={channelId}
        setChannelId={setChannelId}
      />
    </BaseModal>
  );
};

export default CreateReminderModal;
