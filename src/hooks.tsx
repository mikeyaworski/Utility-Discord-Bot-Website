import React, { useCallback, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useMediaQuery, useTheme } from '@mui/material';
import { AuthContext } from 'contexts/auth';
import { GuildContext } from 'contexts/guild';
import type { Guild, Channel, SetState } from 'types';
import { convertDiscordMentionsToReactMentions, getChannelLabel, parseDiscordMentions } from 'utils';
import ConfirmModal from 'modals/Confirm';
import { BaseModalProps } from 'modals/Base';

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
