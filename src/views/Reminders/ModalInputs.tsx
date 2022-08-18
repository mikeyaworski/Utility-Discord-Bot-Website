import React, { useContext, useState } from 'react';
import { Box, InputAdornment, TextField, IconButton, Autocomplete, Tooltip } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Clear as ClearIcon } from '@mui/icons-material';
import { getChannelLabel, parseDelay } from 'utils';
import MentionableInput from 'components/MentionableInput';
import { GuildContext } from 'contexts/guild';
import type { Option } from 'types';

interface Props {
  message: string,
  onMessageChange: (message: string) => void,
  interval: number | null,
  onIntervalChange: (interval: number | null) => void,
  time: number | null,
  onTimeChange: (time: number) => void,
  endTime: number | null,
  onEndTimeChange: (endTime: number | null) => void,
  maxOccurrences: number | null,
  onMaxOccurrencesChange: (maxOccurrences: number | null) => void,
  channelId: string | null,
  setChannelId: (newChannelId: string) => void,
}

const ModalInputs: React.FC<Props> = ({
  message,
  onMessageChange,
  interval,
  onIntervalChange,
  time,
  onTimeChange,
  endTime,
  onEndTimeChange,
  maxOccurrences,
  onMaxOccurrencesChange,
  channelId,
  setChannelId,
}) => {
  const { channels, selectedGuildId } = useContext(GuildContext);
  const [intervalInput, setIntervalInput] = useState(interval ? `${interval}s` : '');

  const channelOptions: Option[] = channels?.map(channel => ({
    label: getChannelLabel(channel, channels),
    value: channel.id,
  })) || [];

  // TODO: Add the ability to create multiple time inputs. Could have freeform text like on the
  // discord UI (but use tags input), or have a plus button to add another time input.
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <MentionableInput
          value={message}
          onChange={onMessageChange}
        />
        <DateTimePicker
          label="Time"
          value={time != null ? time * 1000 : null}
          onChange={newTime => {
            if (newTime) {
              onTimeChange(newTime / 1000);
            }
          }}
          renderInput={params => <TextField {...params} />}
        />
        <Tooltip title={'Interval to send reminder on repeat. Examples: "24 hours" or "8640000"'}>
          <TextField
            value={intervalInput}
            onChange={e => {
              setIntervalInput(e.target.value);
              if (!e.target.value) onIntervalChange(null);
              else {
                try {
                  onIntervalChange(Math.floor(parseDelay(e.target.value) / 1000));
                } catch {
                  onIntervalChange(null);
                }
              }
            }}
            label="Interval"
            error={Boolean(intervalInput && !interval)}
          />
        </Tooltip>
        <DateTimePicker
          label="End Time"
          value={endTime ? endTime * 1000 : null}
          onChange={newTime => {
            onEndTimeChange(newTime ? newTime / 1000 : null);
          }}
          renderInput={params => <TextField {...params} />}
        />
        <TextField
          value={maxOccurrences || ''}
          onChange={e => onMaxOccurrencesChange(Number(e.target.value))}
          label="Max Occurrences"
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            min: 0,
          }}
          // eslint-disable-next-line react/jsx-no-duplicate-props
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onMaxOccurrencesChange(null)}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {selectedGuildId && (
          <Autocomplete
            disablePortal
            options={channelOptions}
            fullWidth
            disableClearable
            renderInput={params => (
              <TextField
                {...params}
                label="Channel"
              />
            )}
            onChange={(event, newValue) => {
              if (newValue) setChannelId(newValue.value);
            }}
            value={channelOptions.find(o => o.value === channelId)}
          />
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default ModalInputs;
