import { Guild, Role, Member, Channel, ChannelType, MessagePartType, MessagePart } from 'types';
import humanizeDurationUtil from 'humanize-duration';

export async function fetchApi<T = unknown>({
  path,
  method = 'GET',
  queryParams = [],
  ...rest
}: RequestInit & {
  path: string,
  queryParams?: [string, string][],
}): Promise<T> {
  const url = new URL(`${process.env.REACT_APP_API_ROOT}${path}`);
  queryParams.forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  const res = await fetch(url.href, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...rest,
  });
  if (!res.ok) throw res;
  const contentType = res.headers.get('Content-Type');
  if (contentType?.startsWith('application/json')) {
    const data = await res.json();
    return data as T;
  }
  return null as unknown as T;
}

export function getGuildIcon(guild: Guild): string {
  // https://discord.com/developers/docs/reference#image-formatting
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}`;
}

export function humanizeDuration(durationMs: number): string {
  return humanizeDurationUtil(durationMs, {
    maxDecimalPoints: 0,
  });
}

/**
 * Accepts epochTime in seconds
 */
export function getDateString(epochTime: number): string {
  return new Date(epochTime * 1000).toISOString();
}

/**
 * For parsing command input of delays. Note that this function is NOT used for parsing input of dates.
 * Throws an error if it's not parsable.
 * TODO: support weeks, months and years as well
 * @param {string} arg Some string representation of time, e.g. "600" or "10 minutes" or "July 10th".
 *   If the argument is purely numeric, then it will be treated as milliseconds.
 * @returns An integer representing the number of milliseconds for delay.
 */
export function parseDelay(input: string): number {
  input = input.trim();
  const pureDigits = /^\d+$/;
  const milliseconds = /\d+\s?(ms|milliseconds?)$/;
  const secs = /\d+\s?(s|secs?|seconds?)$/;
  const mins = /\d+\s?(m|mins?|minutes?)$/;
  const hours = /\d+\s?(hr?|hours?)$/;
  const days = /\d+\s?(d|days?)$/;
  if (pureDigits.test(input)) {
    return parseInt(input, 10);
  }
  const numericalMatch = input.match(/\d+/);
  const numericalPart = numericalMatch ? parseInt(numericalMatch[0], 10) : null;
  let unitMultiplier: number | null = null;
  if (milliseconds.test(input)) {
    unitMultiplier = 1;
  }
  if (secs.test(input)) {
    unitMultiplier = 1000;
  }
  if (mins.test(input)) {
    unitMultiplier = 60 * 1000;
  }
  if (hours.test(input)) {
    unitMultiplier = 60 * 60 * 1000;
  }
  if (days.test(input)) {
    unitMultiplier = 24 * 60 * 60 * 1000;
  }
  if (!numericalPart || !unitMultiplier) {
    throw new Error(`Could not parse delay: ${input}`);
  }
  return numericalPart * unitMultiplier;
}

export function convertReactMentionsToDiscordMentions(data: string): string {
  const reactMentions = data.match(/@\[[^\]]+\]\(([^)]+)\)/g);
  reactMentions?.forEach(mention => {
    const matches = mention.match(/@\[[^\]]+\]\(([^)]+)\)/);
    if (matches?.[1]) {
      data = data.replace(mention, matches?.[1]);
    }
  });
  return data;
}

export function convertDiscordMentionsToReactMentions(
  data: string,
  {
    roles,
    members,
    channels,
  }: {
    roles: Role[],
    members: Member[],
    channels: Channel[],
  },
): string {
  const memberMentions = data.match(/<@!(\d+)>/g);
  const roleMentions = data.match(/<@&(\d+)>/g);
  const channelMentions = data.match(/<#(\d+)>/g);
  const getIdFromMention = (mention: string) => mention.replace(/[^\d]/g, '');
  memberMentions?.forEach(mention => {
    const id = getIdFromMention(mention);
    const member = members.find(m => m.id === id);
    if (member) data = data.replace(mention, `@[@${member.name}](${mention})`);
  });
  roleMentions?.forEach(mention => {
    const id = getIdFromMention(mention);
    const role = roles.find(m => m.id === id);
    if (role) data = data.replace(mention, `@[@${role.name}](${mention})`);
  });
  channelMentions?.forEach(mention => {
    const id = getIdFromMention(mention);
    const channel = channels.find(m => m.id === id);
    if (channel) data = data.replace(mention, `@[#${channel.name}](${mention})`);
  });
  return data;
}

/**
 * Returns an array representing strings that can be concatenated together, but each
 * element is either a raw string, or a mention.
 */
export function parseDiscordMentions(
  data: string,
  {
    roles,
    members,
    channels,
  }: {
    roles: Role[],
    members: Member[],
    channels: Channel[],
  },
): MessagePart[] {
  const mentions = data.match(/(<@!(\d+)>)|(<@&(\d+)>)|(<#(\d+)>)/g);
  if (!mentions) return [{ type: MessagePartType.RAW, value: data }];

  const getIdFromMention = (mention: string) => mention.replace(/[^\d]/g, '');
  const getMentionType = (mention: string) => {
    if (mention.startsWith('<@!')) return MessagePartType.MEMBER_MENTION;
    if (mention.startsWith('<@&')) return MessagePartType.ROLE_MENTION;
    if (mention.startsWith('<#')) return MessagePartType.CHANNEL_MENTION;
    return MessagePartType.RAW;
  };

  const elements: MessagePart[] = [];
  mentions?.forEach(mention => {
    const id = getIdFromMention(mention);
    const type = getMentionType(mention);
    const idx = data.indexOf(mention);

    const beforePart = data.substring(0, idx);
    elements.push({
      type: MessagePartType.RAW,
      value: beforePart,
    });
    data = data.substring(idx);

    let resolvedMention: string | undefined;
    switch (type) {
      case MessagePartType.MEMBER_MENTION: {
        const member = members.find(m => m.id === id);
        if (member) resolvedMention = `@${member.name}`;
        break;
      }
      case MessagePartType.ROLE_MENTION: {
        const role = roles.find(m => m.id === id);
        if (role) resolvedMention = `@${role.name}`;
        break;
      }
      case MessagePartType.CHANNEL_MENTION: {
        const channel = channels.find(m => m.id === id);
        if (channel) resolvedMention = `#${channel.name}`;
        break;
      }
      default: {
        break;
      }
    }
    if (resolvedMention) {
      data = data.substring(mention.length);
      elements.push({
        type,
        value: resolvedMention,
      });
    }
  });

  if (data) {
    elements.push({
      type: MessagePartType.RAW,
      value: data,
    });
  }
  return elements;
}

export function getChannelLabel(channel: Channel, allChannels: Channel[]): string {
  const parentCategory = allChannels.find(p => channel.parent && p.id === channel.parent.id);
  const duplicateNamedChannel = allChannels.find(c => {
    return c.type !== ChannelType.VOICE
      && c.id !== channel.id
      && c.name === channel.name
      && c.parent?.id !== channel.parent?.id;
  });
  const icon = channel.type === ChannelType.VOICE ? '🔊 ' : '#';
  const baseLabel = `${icon}${channel.name}`;
  const label = (duplicateNamedChannel && parentCategory)
    ? `${baseLabel} (${parentCategory.name})`
    : baseLabel;
  return label;
}
