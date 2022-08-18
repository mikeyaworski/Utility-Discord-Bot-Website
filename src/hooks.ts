import { useCallback, useContext } from 'react';
import { AuthContext } from 'contexts/auth';
import { GuildContext } from 'contexts/guild';
import type { Guild, Channel } from 'types';
import { convertDiscordMentionsToReactMentions, getChannelLabel, parseDiscordMentions } from 'utils';
import { useMediaQuery, useTheme } from '@mui/material';

export function useGetGuild(): (guildId: string | null | undefined) => Guild | null | undefined {
  const { user } = useContext(AuthContext);
  return (guildId: string | null | undefined) => {
    return user?.guilds.find(g => g.id === guildId);
  };
}

export function useGuild(): Guild | null | undefined {
  const { selectedGuildId } = useContext(GuildContext);
  const getGuild = useGetGuild();
  return getGuild(selectedGuildId);
}

export function useChannel(channelId: string): Channel | null | undefined {
  const { channels } = useContext(GuildContext);
  return channels?.find(c => c.id === channelId);
}

export function useConvertDiscordMentionsToReactMentions(): (data: string) => string | null {
  const { members, roles, channels } = useContext(GuildContext);
  return useCallback((data: string) => {
    if (!members || !roles || !channels) return null;
    return convertDiscordMentionsToReactMentions(data, { roles, members, channels });
  }, [roles, members, channels]);
}

export function useParseDiscordMentions(): (data: string) => ReturnType<typeof parseDiscordMentions> {
  const { members, roles, channels } = useContext(GuildContext);
  return useCallback((data: string) => {
    if (!members || !roles || !channels) return [];
    return parseDiscordMentions(data, { roles, members, channels });
  }, [roles, members, channels]);
}

export function useGetChannelLabel(): (channel: Channel) => string {
  const { channels } = useContext(GuildContext);
  return useCallback((channel: Channel) => {
    if (!channels) return `#${channel.name}`;
    return getChannelLabel(channel, channels);
  }, [channels]);
}

export function useIsMobile(): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('md'));
}
