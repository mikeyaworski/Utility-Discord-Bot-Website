import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import type { Channel, Role, Member } from 'types';
import { fetchApi } from 'utils';
import { AuthContext } from './auth';

interface GuildContext {
  selectedGuildId: string | null,
  selectGuild: (guildId: string | null) => void,
  channels: Channel[] | undefined,
  roles: Role[] | undefined,
  members: Member[] | undefined,
}

export const GuildContext = createContext<GuildContext>({
  selectedGuildId: null,
  selectGuild: () => {},
  channels: undefined,
  roles: undefined,
  members: undefined,
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
  const [roles, setRoles] = useState<Role[] | undefined>();
  const [members, setMembers] = useState<Member[] | undefined>();

  const selectGuild = useCallback((guildId: string | null) => {
    setSelectedGuildId(guildId || null);
  }, []);

  useEffect(() => {
    if (!user) return () => {};
    if (!selectedGuildId) {
      setChannels(old => (old ? [] : old));
      setRoles(old => (old ? [] : old));
      setMembers(old => (old ? [] : old));
      localStorage.removeItem(localStorageKey);
      return () => {};
    }
    localStorage.setItem(localStorageKey, selectedGuildId);
    setChannels(undefined);
    const controller = new AbortController();
    fetchApi<Channel[]>({
      path: `/guilds/${selectedGuildId}/channels`,
      signal: controller.signal,
    }).then(res => {
      setChannels(res);
    });
    fetchApi<Role[]>({
      path: `/guilds/${selectedGuildId}/roles`,
      signal: controller.signal,
    }).then(res => {
      setRoles(res);
    });
    fetchApi<Member[]>({
      path: `/guilds/${selectedGuildId}/members`,
      signal: controller.signal,
    }).then(res => {
      setMembers(res);
    });
    return () => controller.abort();
  }, [selectedGuildId, user]);

  const value = useMemo(() => ({
    selectedGuildId,
    selectGuild,
    channels,
    roles,
    members,
  }), [
    selectedGuildId,
    selectGuild,
    channels,
    roles,
    members,
  ]);

  return (
    <GuildContext.Provider value={value}>
      {children}
    </GuildContext.Provider>
  );
};
