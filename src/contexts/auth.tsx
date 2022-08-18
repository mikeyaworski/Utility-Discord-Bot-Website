import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { User } from 'types';
import { fetchApi } from 'utils';

type RefetchUser = () => Promise<User | null | undefined>;
type RefetchBotDm = () => Promise<string | null | undefined>;

interface AuthContext {
  user: User | null | undefined,
  refetchUser: RefetchUser,
  botDmChannelId: string | null | undefined,
  refetchBotDm: RefetchBotDm,
}

export const AuthContext = createContext<AuthContext>({
  user: undefined,
  refetchUser: () => Promise.resolve(undefined),
  botDmChannelId: undefined,
  refetchBotDm: () => Promise.resolve(undefined),
});

interface Props {
  children: React.ReactNode,
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null | undefined>();
  const [botDmChannelId, setBotDmChannelId] = useState<string | null | undefined>();

  const refetchUser: RefetchUser = useCallback(async () => {
    try {
      const res = await fetchApi<User>({
        path: '/auth/me',
      });
      if (res) {
        setUser(res);
        return res;
      }
    } catch {
      setUser(null);
    }
    return null;
  }, []);

  const refetchBotDm: () => Promise<string | null> = useCallback(async () => {
    try {
      const res = await fetchApi<{ id: string }>({
        path: '/dms/channel',
      });
      if (res) {
        setBotDmChannelId(res.id);
        return res.id;
      }
    } catch {
      setBotDmChannelId(null);
    }
    return null;
  }, []);

  useEffect(() => {
    refetchUser().then(user => {
      if (user) refetchBotDm();
    });
  }, [refetchUser, refetchBotDm]);

  const value = useMemo(() => ({
    user,
    refetchUser,
    botDmChannelId,
    refetchBotDm,
  }), [
    user,
    refetchUser,
    botDmChannelId,
    refetchBotDm,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
