import React, { useState } from 'react';
import { Box, InputAdornment, TextField, IconButton } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Clear as ClearIcon } from '@mui/icons-material';
import { parseDelay } from 'utils';

interface Props {
  message: string,
  onMessageChange: (message: string) => void,
  interval: number | null,
  onIntervalChange: (interval: number | null) => void,
  time: number,
  onTimeChange: (time: number) => void,
  endTime: number | null,
  onEndTimeChange: (endTime: number | null) => void,
  maxOccurrences: number | null,
  onMaxOccurrencesChange: (maxOccurrences: number | null) => void,
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
}) => {
  const [intervalInput, setIntervalInput] = useState(interval ? `${interval}s` : '');
  // TODO: Add the ability to create multiple time inputs. Could have freeform text like on the
  // discord UI (but use tags input), or have a plus button to add another time input
  // TODO: Finish inputs
  // TODO: Use https://www.npmjs.com/package/react-mentions for roles, users and channels that get mentioned
  // TODO: Label the interval input with a description of the valid inputs
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          value={message}
          onChange={e => onMessageChange(e.target.value)}
          label="Message"
        />
        <DateTimePicker
          label="Time"
          value={time * 1000}
          onChange={newTime => {
            if (newTime) {
              onTimeChange(newTime / 1000);
            }
          }}
          renderInput={params => <TextField {...params} />}
        />
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
      </Box>
    </LocalizationProvider>
  );
};

export default ModalInputs;
