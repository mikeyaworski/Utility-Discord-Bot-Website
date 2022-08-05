import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { User } from 'types';
import { fetchApi } from 'utils';

type RefetchUser = () => Promise<User | null | undefined>;

interface AuthContext {
  user: User | null | undefined,
  refetchUser: RefetchUser,
}

export const AuthContext = createContext<AuthContext>({
  user: undefined,
  refetchUser: () => Promise.resolve(undefined),
});

interface Props {
  children: React.ReactNode,
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null | undefined>();

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

  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  const value = useMemo(() => ({
    user,
    refetchUser,
  }), [user, refetchUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
