import React, { useContext } from 'react';
import { Box, TextField, Autocomplete, InputAdornment, Avatar, Typography, Skeleton } from '@mui/material';
import { AuthContext } from 'contexts/auth';
import { GuildContext } from 'contexts/guild';
import { getGuildIcon } from 'utils';
import { useGetGuild, useGuild } from 'hooks';

const avatarSize = 24;

interface Option {
  label: string,
  value: string,
}

const GuildSelector: React.FC = () => {
  const { selectGuild } = useContext(GuildContext);
  const { user } = useContext(AuthContext);
  const guild = useGuild();
  const getGuild = useGetGuild();

  const options: Option[] = user?.guilds.map(guild => ({
    label: guild.name,
    value: guild.id,
  })) || [];
  options.unshift({
    label: 'Bot DMs',
    value: '',
  });

  function getAvatar(guildId: string | null | undefined) {
    const avatarGuild = getGuild(guildId);
    return (
      <Avatar
        sx={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: !avatarGuild ? 0 : undefined,
        }}
        alt="Avatar"
        src={avatarGuild ? getGuildIcon(avatarGuild) : '/logo500.png'}
      />
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 400 }}>
      <Autocomplete
        disablePortal
        options={options}
        fullWidth
        disableClearable
        disabled={!user}
        renderOption={(props, option) => (
          <li {...props}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getAvatar(option.value)}
              <Typography variant="body1">
                {option.label}
              </Typography>
            </Box>
          </li>
        )}
        renderInput={params => (
          <TextField
            {...params}
            label="Guild"
            InputProps={{
              ...params.InputProps,
              startAdornment: !user ? (
                <InputAdornment position="start">
                  <Skeleton variant="circular" width={avatarSize} height={avatarSize} />
                </InputAdornment>
              ) : (
                <InputAdornment position="start">
                  {getAvatar(guild?.id)}
                </InputAdornment>
              ),
            }}
          />
        )}
        onChange={(event, newValue) => selectGuild(newValue ? newValue.value : null)}
        value={{
          label: guild?.name || (!user ? 'Loading...' : 'Bot DMs'),
          value: guild?.id || '',
        }}
      />
    </Box>
  );
};

export default GuildSelector;
