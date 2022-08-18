import React, { useEffect, useState } from 'react';
import BaseModal, { BaseModalProps } from 'modals/Base';
import { Reminder } from 'types';
import { Typography } from '@mui/material';
import { useConvertDiscordMentionsToReactMentions } from 'hooks';
import { convertReactMentionsToDiscordMentions } from 'utils';
import ModalInputs from './ModalInputs';

type Props = Omit<BaseModalProps, 'onConfirm'> & {
  reminder: Reminder,
  onConfirm: (newReminder: Reminder) => void,
}

const EditReminderModal: React.FC<Props> = ({
  reminder,
  onConfirm,
  ...baseModalProps
}) => {
  const convertDiscordMentionsToReactMentions = useConvertDiscordMentionsToReactMentions();

  const [message, setMessage] = useState<string>(convertDiscordMentionsToReactMentions(reminder.model.message || '') || '');
  const [time, setTime] = useState<number>(reminder.model.time);
  const [interval, setInterval] = useState<number | null>(reminder.model.interval);
  const [endTime, setEndTime] = useState<number | null>(reminder.model.end_time);
  const [maxOccurrences, setMaxOccurrences] = useState<number | null>(reminder.model.max_occurrences);
  const [channelId, setChannelId] = useState<string>(reminder.model.channel_id);

  useEffect(() => {
    setMessage(convertDiscordMentionsToReactMentions(reminder.model.message || '') || '');
    setTime(reminder.model.time);
    setInterval(reminder.model.interval);
    setEndTime(reminder.model.end_time);
    setMaxOccurrences(reminder.model.max_occurrences);
    setChannelId(reminder.model.channel_id);
  }, [reminder, convertDiscordMentionsToReactMentions]);

  function handleConfirm() {
    const timeMaybeChanged = reminder.model.time !== time
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
        time,
        interval,
        end_time: endTime,
        max_occurrences: maxOccurrences,
        channel_id: channelId,
      },
    });
  }

  return (
    <BaseModal
      {...baseModalProps}
      onConfirm={() => handleConfirm()}
      canConfirm={Boolean(channelId) && Boolean(time)}
    >
      <Typography variant="h5" sx={{ mb: 2 }}>Edit Reminder</Typography>
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

export default EditReminderModal;
