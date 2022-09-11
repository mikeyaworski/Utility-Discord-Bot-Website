import React, { useContext } from 'react';
import { TextField, Autocomplete } from '@mui/material';
import { getChannelLabel } from 'utils';
import { GuildContext } from 'contexts/guild';
import type { Option } from 'types';

interface Props {
  channelId: string | null,
  setChannelId: (newChannelId: string) => void,
}

const ChannelInput: React.FC<Props> = ({
  channelId,
  setChannelId,
}) => {
  const { channels } = useContext(GuildContext);

  const channelOptions: Option[] = channels?.map(channel => ({
    label: getChannelLabel(channel, channels),
    value: channel.id,
  })) || [];

  return (
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
  );
};

export default ChannelInput;
