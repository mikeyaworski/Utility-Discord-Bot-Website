import { useAlert } from 'alerts';
import { SetState } from 'types';
import { PlayerStatusData } from 'types/sockets';
import { getClockString } from 'utils';

export function getTrackDurationStrings(
  currentTime: number,
  duration: number,
): [string, string] {
  const totalDuration = getClockString(duration);
  const minPortions = (totalDuration.match(/:/g) || []).length + 1;
  return [getClockString(currentTime, minPortions), totalDuration];
}

export function useTryUpdate({
  playerStatus,
  setPlayerStatus,
  setBusy,
}: {
  playerStatus: PlayerStatusData | null,
  setPlayerStatus: SetState<PlayerStatusData | null>,
  setBusy: SetState<boolean>,
}): (fn: () => Promise<void>) => void {
  const alert = useAlert();
  return async function tryUpdate(fn: () => Promise<void>) {
    if (!playerStatus) return;
    setBusy(true);
    const playerStatusBeforeUpdate = { ...playerStatus };
    try {
      await fn();
      setBusy(false);
    } catch (err) {
      setBusy(false);
      setPlayerStatus(playerStatusBeforeUpdate);
      // @ts-ignore
      const body = await err.text();
      alert.error(body);
    }
  };
}
