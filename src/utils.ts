import { Guild } from 'types';
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
  if (!res.ok) throw new Error(String(res.status));
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
