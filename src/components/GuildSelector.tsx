import React, { useContext } from 'react';
import { Box, TextField, Autocomplete, InputAdornment, Avatar, Typography, Skeleton } from '@mui/material';
import { AuthContext } from 'contexts/auth';
import { GuildContext } from 'contexts/guild';
import { getGuildIcon } from 'utils';
import { useGetGuild, useGuild } from 'hooks';
import type { Option } from 'types';

const avatarSize = 24;

type Props = {
  dense: boolean,
  guildId?: undefined,
  onChange?: undefined,
} | {
  dense: boolean,
  guildId: string | null,
  onChange: (newGuildId: string | null) => void,
}

const GuildSelector: React.FC<Props> = ({
  dense,
  guildId,
  onChange,
}) => {
  const { selectGuild } = useContext(GuildContext);
  const { user, notLoggedIn } = useContext(AuthContext);
  const guild = useGuild(guildId);
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
        src={avatarGuild ? getGuildIcon(avatarGuild) : '/logo32.png'}
      />
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 400 }}>
      <Autocomplete
        disablePortal
        autoHighlight
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
              startAdornment: (
                <InputAdornment position="start">
                  {notLoggedIn ? null : !user ? (
                    <Skeleton variant="circular" width={avatarSize} height={avatarSize} />
                  ) : getAvatar(guild?.id)}
                </InputAdornment>
              ),
            }}
            // eslint-disable-next-line react/jsx-no-duplicate-props
            inputProps={{
              ...params.inputProps,
              style: dense ? {
                ...params.inputProps.style,
                paddingTop: 0,
                paddingBottom: 0,
              } : params.inputProps.style,
            }}
          />
        )}
        onChange={(event, newValue) => {
          const newGuildId = newValue ? newValue.value : null;
          if (onChange) onChange(newGuildId);
          else selectGuild(newGuildId);
        }}
        value={{
          label: guild?.name || (notLoggedIn ? '' : !user ? 'Loading...' : 'Bot DMs'),
          value: guild?.id || '',
        }}
      />
    </Box>
  );
};

export default GuildSelector;
