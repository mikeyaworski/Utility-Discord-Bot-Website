import type { Dispatch, SetStateAction } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IntentionalAny = any;

export type Falsy = | undefined | '' | false | null | 0;

export interface IdObject {
  id: string,
}

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

export enum TrackVariant {
  YOUTUBE_VOD,
  YOUTUBE_LIVESTREAM,
  TWITCH_VOD,
  TWITCH_LIVESTREAM,
}

export interface CurrentTrackPlayTime {
  // all in MS
  started: number | null, // timestamp
  pauseStarted: number | null, // timestamp
  totalPauseTimeMs: number,
  seekedMs: number | null,
  speed: number,
}

export interface Track {
  id: string,
  link: string,
  sourceLink: string | undefined,
  variant: TrackVariant,
  title: string,
  duration?: number,
}

export interface PlayerStatus {
  currentTime: CurrentTrackPlayTime,
  playbackSpeed: number,
  isLooped: boolean,
  isShuffled: boolean,
  isPaused: boolean,
  currentTrack: Track | null,
  queue: Track[],
  totalQueueSize: number,
}

export interface PlayInputs {
  vodLink?: string | null,
  favoriteId?: string | null,
  streamLink?: string | null,
  queryStr?: string | null,
  pushToFront?: boolean,
  shuffle?: boolean,
}

export interface Favorite {
  id: number,
  guild_id: string,
  user_id: string,
  custom_id: string | null,
  label: string | null,
  variant: 'LINK',
  value: string,
  createdAt: string,
  updatedAt: string,
}

export interface ChatGptConversationMessage {
  role: 'user' | 'assistant',
  content: string,
}

export type MovieListMinimal = Pick<MovieList, 'id' | 'custom_id' | 'name'>;

export interface Movie {
  id: string,
  guild_id: string,
  title: string,
  is_favorite: boolean,
  was_watched: boolean,
  length: number | null, // in minutes
  actors: string | null, // comma-separated
  director: string | null,
  genre: string | null, // comma-separated
  year: number | null,
  imdb_id: string | null,
  imdb_rating: number | null, // 0-100
  metacritic_rating: number | null, // 0-100
  rotten_tomatoes_rating: number | null, // 0-100
  rating: string | null,
  language: string | null,

  // Associations
  notes?: MovieNote[],
  lists: MovieListMinimal[],
}

export interface MovieWithOrder extends Movie {
  order: number,
}

export interface MovieWithOrderOnly {
  id: string,
  order: number,
}

export interface MovieListFromServer {
  id: string,
  guild_id: string,
  name: string,
  custom_id: string | null,

  // Associations
  movies: MovieWithOrderOnly[],
}

export interface MovieList {
  id: string,
  guild_id: string,
  name: string,
  custom_id: string | null,

  // Associations
  movies: MovieWithOrder[],
}

export interface MovieNote {
  id: string,
  movie_id: string,
  author_id: string,
  note: string,

  // Associations
  movie?: Movie,
}
