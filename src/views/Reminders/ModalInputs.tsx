import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Box, InputAdornment, TextField, IconButton, Autocomplete, Tooltip } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Clear as ClearIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import { filterOutFalsy, parseDelay, parseTimeInput } from 'utils';
import MentionableInput from 'components/MentionableInput';
import { GuildContext } from 'contexts/guild';
import ChannelInput from 'components/ChannelInput';

interface Props {
  message: string,
  onMessageChange: (message: string) => void,
  interval: number | null,
  onIntervalChange: (interval: number | null) => void,
  times: number[],
  onTimesChange: (times: number[]) => void,
  endTime: number | null,
  onEndTimeChange: (endTime: number | null) => void,
  maxOccurrences: number | null,
  onMaxOccurrencesChange: (maxOccurrences: number | null) => void,
  channelId: string | null,
  setChannelId: (newChannelId: string) => void,
  guildId: string | null,
}

const ModalInputs: React.FC<Props> = ({
  message,
  onMessageChange,
  interval,
  onIntervalChange,
  times,
  onTimesChange,
  endTime,
  onEndTimeChange,
  maxOccurrences,
  onMaxOccurrencesChange,
  channelId,
  setChannelId,
  guildId,
}) => {
  const [intervalInput, setIntervalInput] = useState(interval ? `${interval}s` : '');
  const [showMultiTimeInput, setShowMultiTimeInput] = useState<boolean>(() => localStorage.getItem('showMultiTimeInput') === 'true' || false);
  const [timesMultiInput, setTimesMultiInput] = useState<string[]>(() => times.map(time => new Date(time * 1000).toISOString()));

  function getTimeFromTimeInput(input: string): number | null {
    try {
      return parseTimeInput(input);
    } catch {
      return null;
    }
  }

  const handleTimeSwap = useCallback(() => {
    setShowMultiTimeInput(old => {
      const newShowMulti = !old;
      if (newShowMulti) {
        onTimesChange(filterOutFalsy(timesMultiInput
          .map(input => getTimeFromTimeInput(input))));
      } else if (timesMultiInput.length > 0) {
        onTimesChange(filterOutFalsy([getTimeFromTimeInput(timesMultiInput[0])]));
      }
      return newShowMulti;
    });
  }, [timesMultiInput, onTimesChange]);

  useEffect(() => {
    localStorage.setItem('showMultiTimeInput', String(showMultiTimeInput));
  }, [showMultiTimeInput]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <MentionableInput
          value={message}
          onChange={onMessageChange}
          guildId={guildId}
        />
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          width: '100%',
          '& > div:first-child': {
            flexGrow: 1,
          },
        }}
        >
          {showMultiTimeInput ? (
            <Autocomplete
              multiple
              options={[]}
              freeSolo
              autoSelect
              renderInput={params => (
                <TextField
                  {...params}
                  label="Time"
                  variant="outlined"
                  placeholder={'"5 mins" or "Friday at 2pm"'}
                  error={timesMultiInput.length !== times.length}
                />
              )}
              onChange={(event, values) => {
                setTimesMultiInput(values.flat());
                onTimesChange(filterOutFalsy(values.flat().map(value => getTimeFromTimeInput(value))));
              }}
              value={timesMultiInput}
            />
          ) : (
            <DateTimePicker
              label="Time"
              value={times[0] != null ? times[0] * 1000 : null}
              onChange={newTime => {
                if (newTime) {
                  onTimesChange([newTime / 1000]);
                }
              }}
              renderInput={params => <TextField {...params} />}
            />
          )}
          <Tooltip title="Swap time between multi-input and single-input">
            <IconButton onClick={handleTimeSwap}>
              <SwapHorizIcon />
            </IconButton>
          </Tooltip>
        </Box>
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
        {guildId && (
          <ChannelInput
            channelId={channelId}
            setChannelId={setChannelId}
            guildId={guildId}
          />
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default ModalInputs;
