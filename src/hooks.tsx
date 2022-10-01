import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useMediaQuery, useTheme } from '@mui/material';
import { AuthContext } from 'contexts/auth';
import { GuildContext } from 'contexts/guild';
import type { Guild, Channel, Member, Role, SetState } from 'types';
import { convertDiscordMentionsToReactMentions, fetchApi, getChannelLabel, parseDiscordMentions } from 'utils';
import ConfirmModal from 'modals/Confirm';
import { BaseModalProps } from 'modals/Base';

export function useGetGuild(): (guildId: string | null | undefined) => Guild | null | undefined {
  const { user } = useContext(AuthContext);
  return (guildId: string | null | undefined) => {
    return user?.guilds.find(g => g.id === guildId);
  };
}

export function useGuild(guildId?: string | null): Guild | null | undefined {
  const { selectedGuildId } = useContext(GuildContext);
  if (guildId === undefined) guildId = selectedGuildId;
  const getGuild = useGetGuild();
  return getGuild(guildId);
}

export function useMembers(guildId: string | null | undefined): Member[] | undefined {
  const { user } = useContext(AuthContext);
  const [members, setMembers] = useState<Member[] | undefined>();
  useEffect(() => {
    if (!user) return () => {};
    if (!guildId) {
      setMembers([]);
      return () => {};
    }
    setMembers(undefined);
    const controller = new AbortController();
    fetchApi<Member[]>({
      path: `/guilds/${guildId}/members`,
      signal: controller.signal,
    }).then(res => {
      setMembers(res);
    });
    return () => controller.abort();
  }, [guildId, user]);

  return members;
}

export function useRoles(guildId: string | null | undefined): Role[] | undefined {
  const { user } = useContext(AuthContext);
  const [roles, setRoles] = useState<Role[] | undefined>();
  useEffect(() => {
    if (!user) return () => {};
    if (!guildId) {
      setRoles([]);
      return () => {};
    }
    setRoles(undefined);
    const controller = new AbortController();
    fetchApi<Role[]>({
      path: `/guilds/${guildId}/roles`,
      signal: controller.signal,
    }).then(res => {
      setRoles(res);
    });
    return () => controller.abort();
  }, [guildId, user]);

  return roles;
}

export function useChannels(guildId: string | null | undefined): Channel[] | undefined {
  const { user } = useContext(AuthContext);
  const [channels, setChannels] = useState<Channel[] | undefined>();
  useEffect(() => {
    if (!user) return () => {};
    if (!guildId) {
      setChannels([]);
      return () => {};
    }
    setChannels(undefined);
    const controller = new AbortController();
    fetchApi<Channel[]>({
      path: `/guilds/${guildId}/channels`,
      signal: controller.signal,
    }).then(res => {
      setChannels(res);
    });
    return () => controller.abort();
  }, [guildId, user]);

  return channels;
}

interface UseGuildDataReturn {
  members: Member[] | undefined,
  roles: Role[] | undefined,
  channels: Channel[] | undefined,
}
export function useGuildData(guildId: string | null | undefined): UseGuildDataReturn {
  const members = useMembers(guildId);
  const roles = useRoles(guildId);
  const channels = useChannels(guildId);
  return {
    members,
    channels,
    roles,
  };
}

interface UseGuildStateReturn {
  id: string | null,
  onChange: (newGuildId: string | null) => void,
  members: Member[] | undefined,
  roles: Role[] | undefined,
  channels: Channel[] | undefined,
}
export function useGuildState({
  fetchGuildData,
}: {
  fetchGuildData?: boolean,
}): UseGuildStateReturn {
  const {
    selectedGuildId: globalGuildId,
    members: globalMembers,
    channels: globalChannels,
    roles: globalRoles,
  } = useContext(GuildContext);
  const [id, setId] = useState(globalGuildId);
  const shouldFetchGuildData = fetchGuildData && id !== globalGuildId;
  const {
    members,
    roles,
    channels,
  } = useGuildData(shouldFetchGuildData ? id : null);

  useEffect(() => {
    setId(globalGuildId);
  }, [globalGuildId]);

  const onChange = useCallback((newGuildId: string | null) => {
    setId(newGuildId);
  }, []);

  return {
    id,
    onChange,
    members: shouldFetchGuildData ? members : globalMembers,
    roles: shouldFetchGuildData ? roles : globalRoles,
    channels: shouldFetchGuildData ? channels : globalChannels,
  };
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

export function useSocket(): Socket | undefined {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState<Socket>();
  useEffect(() => {
    if (!user) return () => {};
    const newSocket = io(process.env.REACT_APP_API_ROOT!, {
      withCredentials: true,
    });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [user]);
  return socket;
}

interface UseSetReturn<T> {
  data: Set<T>,
  setData: SetState<Set<T>>,
  add: (newValue: T) => void,
  remove: (value: T) => void,
}
export function useSet<T = unknown>(initialData?: T[]): UseSetReturn<T> {
  const [data, setData] = useState(new Set<T>(initialData));
  const add = useCallback((newValue: T) => {
    setData(old => new Set(old).add(newValue));
  }, []);
  const remove = useCallback((value: T) => {
    setData(old => {
      const newSet = new Set(old);
      newSet.delete(value);
      return newSet;
    });
  }, []);
  return {
    data,
    setData,
    add,
    remove,
  };
}

interface OpenOptions {
  title?: string,
  details?: string,
  onConfirm: () => Promise<void>,
}
interface UseConfirmationModalReturn {
  node: React.ReactNode,
  open: (options: OpenOptions) => void,
  close: () => void,
}
export function useConfirmationModal(modalProps?: Partial<BaseModalProps>): UseConfirmationModalReturn {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmFn, setConfirmFn] = useState<(() => void) | null>(null);
  const [title, setTitle] = useState<string | undefined>();
  const [details, setDetails] = useState<string | undefined>();

  const closeModal = useCallback(() => {
    setOpen(false);
    setBusy(false);
    setConfirmFn(null);
    setTitle(undefined);
    setDetails(undefined);
  }, []);

  const openModal = useCallback((options: OpenOptions) => {
    setOpen(true);
    setConfirmFn(() => options.onConfirm);
    setTitle(options.title);
    setDetails(options.details);
  }, []);

  const node = (
    <ConfirmModal
      {...modalProps}
      open={open}
      busy={busy}
      onClose={() => setOpen(false)}
      onConfirm={async () => {
        setBusy(true);
        if (confirmFn) confirmFn();
        setBusy(false);
        closeModal();
      }}
      title={title}
      details={details}
    />
  );
  return {
    node,
    open: openModal,
    close: closeModal,
  };
}

interface UseOauthStateReturn {
  get: () => string | null,
  set: (state: string) => void,
  remove: () => void,
  validate: (state: string) => boolean,
  state: string | null,
}
export function useOauthState(): UseOauthStateReturn {
  const oauthStateKey = 'oauthState';
  const get = useCallback(() => {
    return window.localStorage.getItem(oauthStateKey);
  }, []);
  const set = useCallback((state: string) => {
    window.localStorage.setItem(oauthStateKey, state);
  }, []);
  const remove = useCallback(() => {
    window.localStorage.removeItem(oauthStateKey);
  }, []);
  const validate = useCallback((state: string) => {
    return Boolean(state) && window.localStorage.getItem(oauthStateKey) === state;
  }, []);
  return {
    get,
    set,
    remove,
    validate,
    state: window.localStorage.getItem(oauthStateKey),
  };
}

export function useLogInLink(): string {
  const location = useLocation();
  const { state: oauthState } = useOauthState();
  const state = {
    redirectPath: location.pathname,
    oauthState,
  };
  return `https://discord.com/api/oauth2/authorize?client_id=${
    process.env.REACT_APP_DISCORD_BOT_CLIENT_ID
  }&redirect_uri=${
    window.location.origin
  }&response_type=code&scope=identify%20guilds&state=${
    JSON.stringify(state)
  }`;
}

export function useQueryParam(key: string): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}
