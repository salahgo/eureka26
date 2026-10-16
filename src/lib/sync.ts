/**
 * Same-browser synchronisation between presenter pages (/admin, /results, /qr).
 * BroadcastChannel carries the new value; the `storage` event is a fallback.
 * This never reaches other devices: participants' phones are not connected to the presenter.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { readJSON, writeJSON } from './storage';

const CHANNEL_NAME = 'eureka26-sync';
const TAB_ID = Math.random().toString(36).slice(2);

interface SyncMessage {
  key: string;
  value: unknown;
  from: string;
}

let channel: BroadcastChannel | null = null;
function getChannel(): BroadcastChannel | null {
  if (channel) return channel;
  if (typeof BroadcastChannel === 'undefined') return null;
  try {
    channel = new BroadcastChannel(CHANNEL_NAME);
  } catch {
    channel = null;
  }
  return channel;
}

export function broadcast(key: string, value: unknown): void {
  getChannel()?.postMessage({ key, value, from: TAB_ID } satisfies SyncMessage);
}

export function syncAvailable(): boolean {
  return typeof BroadcastChannel !== 'undefined';
}

/**
 * React state persisted in localStorage and mirrored across tabs/windows of the same browser profile.
 */
export function useSharedState<T>(key: string, init: () => T, normalize: (raw: unknown) => T = (v) => v as T) {
  const normRef = useRef(normalize);
  normRef.current = normalize;
  const [value, setValue] = useState<T>(() => {
    const raw = readJSON<unknown>(key, null);
    return raw === null ? init() : normRef.current(raw);
  });

  useEffect(() => {
    const ch = getChannel();
    const onMessage = (e: MessageEvent<SyncMessage>) => {
      if (!e.data || e.data.key !== key || e.data.from === TAB_ID) return;
      setValue(normRef.current(e.data.value));
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      if (e.newValue === null) {
        setValue(init());
        return;
      }
      try {
        setValue(normRef.current(JSON.parse(e.newValue)));
      } catch {
        /* ignore corrupted value */
      }
    };
    ch?.addEventListener('message', onMessage);
    window.addEventListener('storage', onStorage);
    return () => {
      ch?.removeEventListener('message', onMessage);
      window.removeEventListener('storage', onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        writeJSON(key, resolved);
        broadcast(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update] as const;
}
