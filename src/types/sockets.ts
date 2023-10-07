import { Reminder, ChessGame, PlayerStatus } from 'types';

export enum SocketEventTypes {
  REMINDER_CREATED = 'REMINDER_CREATED',
  REMINDER_UPDATED = 'REMINDER_UPDATED',
  REMINDER_DELETED = 'REMINDER_DELETED',
  CHESS_CHALLENGED = 'CHESS_CHALLENGED',
  CHESS_CHALLENGE_ACCEPTED = 'CHESS_CHALLENGE_ACCEPTED',
  CHESS_CHALLENGE_DECLINED = 'CHESS_CHALLENGE_DECLINED',
  CHESS_GAME_UPDATED = 'CHESS_GAME_UPDATED',
  CHESS_GAME_RESIGNED = 'CHESS_GAME_RESIGNED',
  PLAYER_STATUS_CHANGED = 'PLAYER_STATUS_CHANGED',
  PLAYER_DISCONNECTED = 'PLAYER_DISCONNECTED',
}

export interface ChessGameIdData {
  id: ChessGame['model']['id'],
}

export interface ChessGameForfeitData extends ChessGameIdData {
  resigner: string,
}

export interface PlayerStatusData extends PlayerStatus {
  guildId: string,
  channel: {
    name: string,
  }
}

export interface PlayerDisconnectedData {
  guildId: string,
  channelId?: string,
}

export type SocketEvent =
{
  type: SocketEventTypes.REMINDER_CREATED,
  data: Reminder,
}
|
{
  type: SocketEventTypes.REMINDER_UPDATED,
  data: Reminder,
}
|
{
  type: SocketEventTypes.REMINDER_DELETED,
  data: { id: Reminder['model']['id'] },
}
|
{
  type: SocketEventTypes.CHESS_CHALLENGED,
  data: ChessGame,
}
|
{
  type: SocketEventTypes.CHESS_CHALLENGE_ACCEPTED,
  data: ChessGame,
}
|
{
  type: SocketEventTypes.CHESS_CHALLENGE_DECLINED,
  data: ChessGameIdData,
}
|
{
  type: SocketEventTypes.CHESS_GAME_UPDATED,
  data: ChessGame,
}
|
{
  type: SocketEventTypes.CHESS_GAME_RESIGNED,
  data: ChessGameForfeitData,
}
|
{
  type: SocketEventTypes.PLAYER_STATUS_CHANGED,
  data: PlayerStatusData,
}|
{
  type: SocketEventTypes.PLAYER_DISCONNECTED,
  data: PlayerDisconnectedData,
}
