import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import type { Channel } from 'types';
import { fetchApi } from 'utils';
import { AuthContext } from './auth';

interface GuildContext {
  selectedGuildId: string | null,
  selectGuild: (guildId: string | null) => void,
  channels: Channel[] | undefined,
}

export const GuildContext = createContext<GuildContext>({
  selectedGuildId: null,
  selectGuild: () => {},
  channels: undefined,
});

interface Props {
  children: React.ReactNode,
}

const localStorageKey = 'selectedGuildId';

export const GuildProvider: React.FC<Props> = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [selectedGuildId, setSelectedGuildId] = useState<string | null>(() => {
    return localStorage.getItem(localStorageKey);
  });
  const [channels, setChannels] = useState<Channel[] | undefined>();

  const selectGuild = useCallback((guildId: string | null) => {
    setSelectedGuildId(guildId || null);
  }, []);

  useEffect(() => {
    if (!user) return () => {};
    if (!selectedGuildId) {
      setChannels(channels => (channels ? [] : channels));
      localStorage.removeItem(localStorageKey);
      return () => {};
    }
    localStorage.setItem(localStorageKey, selectedGuildId);
    setChannels(undefined);
    const controller = new AbortController();
    fetchApi<Channel[]>({
      path: '/channels',
      queryParams: [
        ['guild_id', selectedGuildId],
      ],
      signal: controller.signal,
    }).then(res => {
      setChannels(res);
    });
    return () => controller.abort();
  }, [selectedGuildId, user]);

  const value = useMemo(() => ({
    selectedGuildId,
    selectGuild,
    channels,
  }), [
    selectedGuildId,
    selectGuild,
    channels,
  ]);

  return (
    <GuildContext.Provider value={value}>
      {children}
    </GuildContext.Provider>
  );
};
