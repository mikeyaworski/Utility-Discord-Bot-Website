/* eslint-disable no-console */
import { IntentionalAny } from 'types';

export function log(...args: IntentionalAny[]): void {
  console.log(...args);
}

export function error(...args: IntentionalAny[]): void {
  console.error(...args);
}
