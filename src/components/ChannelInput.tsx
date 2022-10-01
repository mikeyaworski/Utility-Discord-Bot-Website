import React, { useContext } from 'react';
import { TextField, Autocomplete } from '@mui/material';
import { getChannelLabel } from 'utils';
import { GuildContext } from 'contexts/guild';
import type { Option } from 'types';
import { useChannels } from 'hooks';

interface Props {
  channelId: string | null,
  setChannelId: (newChannelId: string) => void,
  guildId?: string | null,
}

const ChannelInput: React.FC<Props> = ({
  channelId,
  setChannelId,
  guildId,
}) => {
  const { channels: globalChannels } = useContext(GuildContext);
  const localChannels = useChannels(guildId);
  const channels = guildId ? localChannels : globalChannels;

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
      autoHighlight
      renderInput={params => (
        <TextField
          {...params}
          label="Channel"
        />
      )}
      onChange={(event, newValue) => {
        if (newValue) setChannelId(newValue.value);
      }}
      value={channelOptions.find(o => o.value === channelId) || { label: '', value: '' }}
    />
  );
};

export default ChannelInput;
