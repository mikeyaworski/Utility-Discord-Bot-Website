import { Reminder } from 'types';

export enum SocketEventTypes {
  REMINDER_CREATED = 'REMINDER_CREATED',
  REMINDER_UPDATED = 'REMINDER_UPDATED',
  REMINDER_DELETED = 'REMINDER_DELETED',
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
  data: { id: string },
}
