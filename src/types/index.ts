import type { Dispatch, SetStateAction } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IntentionalAny = any;

export type Falsy = | undefined | '' | false | null | 0;

// https://discord.com/developers/docs/resources/guild#guild-object
export interface Guild {
  id: string,
  name: string,
  icon: string,
}

// https://discord.com/developers/docs/resources/user#user-object
export interface User {
  id: string,
  username: string,
  discriminator: string,
  avatar: string,
  guilds: Guild[],
}

export interface Option<T = string> {
  label: string,
  value: T,
}

export interface ReminderModel {
  id: string,
  guild_id: string | null,
  channel_id: string,
  owner_id: string,
  time: number,
  end_time: number | null,
  max_occurrences: number | null,
  interval: number | null,
  message: string | null,
  createdAt: string,
  updatedAt: string,
}

export interface ChessGameModel {
  id: number,
  guild_id: string,
  channel_id: string,
  white_user_id: string | null;
  black_user_id: string | null;
  owner_user_id: string;
  challenged_user_id: string | null;
  pgn: string;
  started: boolean;
  createdAt: string,
  updatedAt: string,
}

export interface Reminder {
  model: ReminderModel,
  nextRun: number | null | undefined,
}

export interface ChessGame {
  model: ChessGameModel,
  label: string,
}

export enum ChannelType {
  VOICE,
  DM,
  TEXT,
  THREAD,
  OTHER,
}

export interface Channel {
  id: string,
  name: string,
  type: ChannelType,
  parent: null | {
    id: string,
    name: string,
  },
}

export interface Role {
  id: string,
  name: string,
  mentionable: boolean,
}

export interface Member {
  id: string,
  userId: string,
  name: string,
  avatar: string | null,
}

export type SetState<T> = Dispatch<SetStateAction<T>>;

export enum MessagePartType {
  RAW,
  ROLE_MENTION,
  MEMBER_MENTION,
  CHANNEL_MENTION,
}

export interface MessagePart {
  type: MessagePartType,
  value: string,
}
