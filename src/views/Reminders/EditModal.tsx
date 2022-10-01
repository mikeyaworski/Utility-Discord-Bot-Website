import React, { useEffect, useState } from 'react';
import BaseModal, { BaseModalProps } from 'modals/Base';
import { Reminder } from 'types';
import { Typography } from '@mui/material';
import { useConvertDiscordMentionsToReactMentions } from 'hooks';
import { convertReactMentionsToDiscordMentions } from 'utils';
import ModalInputs from './ModalInputs';
import type { Payload } from './CreateModal';

type Props = Omit<BaseModalProps, 'onConfirm'> & {
  reminder: Reminder,
  onConfirm: (editedReminder: Reminder, newReminders: Payload[]) => void,
}

const EditReminderModal: React.FC<Props> = ({
  reminder,
  onConfirm,
  ...baseModalProps
}) => {
  const convertDiscordMentionsToReactMentions = useConvertDiscordMentionsToReactMentions();

  const [message, setMessage] = useState<string>(convertDiscordMentionsToReactMentions(reminder.model.message || '') || '');
  const [times, setTimes] = useState<number[]>([reminder.model.time]);
  const [interval, setInterval] = useState<number | null>(reminder.model.interval);
  const [endTime, setEndTime] = useState<number | null>(reminder.model.end_time);
  const [maxOccurrences, setMaxOccurrences] = useState<number | null>(reminder.model.max_occurrences);
  const [channelId, setChannelId] = useState<string>(reminder.model.channel_id);

  useEffect(() => {
    setMessage(convertDiscordMentionsToReactMentions(reminder.model.message || '') || '');
    setTimes([reminder.model.time]);
    setInterval(reminder.model.interval);
    setEndTime(reminder.model.end_time);
    setMaxOccurrences(reminder.model.max_occurrences);
    setChannelId(reminder.model.channel_id);
  }, [reminder, convertDiscordMentionsToReactMentions]);

  function handleConfirm() {
    if (times.length === 0) return;
    const [editedTime, ...newTimes] = times;
    const timeMaybeChanged = reminder.model.time !== editedTime
      || newTimes.length > 0
      || reminder.model.interval !== interval
      || reminder.model.end_time !== endTime
      || reminder.model.max_occurrences !== maxOccurrences;
    const nextRun = timeMaybeChanged ? null : reminder.nextRun;
    const formattedMessage = convertReactMentionsToDiscordMentions(message);
    onConfirm({
      ...reminder,
      nextRun,
      model: {
        ...reminder.model,
        message: formattedMessage,
        time: editedTime,
        interval,
        end_time: endTime,
        max_occurrences: maxOccurrences,
        channel_id: channelId,
      },
    }, newTimes.map(time => ({
      message: formattedMessage,
      time,
      interval,
      end_time: endTime,
      max_occurrences: maxOccurrences,
      channel_id: channelId,
    })));
  }

  return (
    <BaseModal
      {...baseModalProps}
      onConfirm={() => handleConfirm()}
      canConfirm={Boolean(channelId) && Boolean(times[0])}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>Edit Reminder</Typography>
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
        guildId={reminder.model.guild_id}
      />
    </BaseModal>
  );
};

export default EditReminderModal;
