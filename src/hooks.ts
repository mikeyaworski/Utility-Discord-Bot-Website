import { useContext } from 'react';
import { AuthContext } from 'contexts/auth';
import { GuildContext } from 'contexts/guild';
import type { Guild, Channel } from 'types';

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
