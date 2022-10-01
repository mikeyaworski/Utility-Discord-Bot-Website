import { useGuildData } from 'hooks';
import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import type { Channel, Role, Member } from 'types';
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

  const selectGuild = useCallback((guildId: string | null) => {
    setSelectedGuildId(guildId || null);
  }, []);

  useEffect(() => {
    if (user) {
      if (!selectedGuildId) localStorage.removeItem(localStorageKey);
      else localStorage.setItem(localStorageKey, selectedGuildId);
    }
  }, [selectedGuildId, user]);

  const {
    members,
    roles,
    channels,
  } = useGuildData(selectedGuildId);

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
