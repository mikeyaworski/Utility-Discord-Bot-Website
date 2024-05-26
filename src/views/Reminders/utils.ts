import { parseTimeInput, filterOutFalsy } from 'utils';

export function getTimeFromTimeInput(input: string): number | null {
  try {
    return parseTimeInput(input);
  } catch {
    return null;
  }
}

export function getFilteredTimesFromInput(inputs: (number | string)[]): number[] {
  return filterOutFalsy(inputs.map(input => {
    if (typeof input === 'string') return getTimeFromTimeInput(input);
    return input;
  }));
}
