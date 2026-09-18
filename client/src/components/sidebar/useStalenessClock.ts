import { useSyncExternalStore } from 'react';

// Interval of the shared clock the staleness classes are measured against.
// The finest staleness bucket is thirty minutes, so a coarse tick suffices.
const STALENESS_TICK_MS = 300_000; // 5 minutes

let now = Date.now();
let intervalId: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function emit(): void {
  now = Date.now();
  listeners.forEach((listener) => listener());
}

function startTick(): void {
  intervalId ??= setInterval(emit, STALENESS_TICK_MS);
}

function stopTick(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function handleVisibility(): void {
  stopTick();
  if (!document.hidden) {
    if (Date.now() - now >= STALENESS_TICK_MS) {
      emit();
    }
    startTick();
  }
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) {
    document.addEventListener('visibilitychange', handleVisibility);
    handleVisibility();
  }
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      stopTick();
      document.removeEventListener('visibilitychange', handleVisibility);
    }
  };
}

function getSnapshot(): number {
  return now;
}

/**
 * A single module-wide clock reading, refreshed every five minutes while the
 * tab is visible and on return to the tab once a tick has elapsed. Every
 * subscriber sees the same value, so rows in different sections age together.
 */
export function useStalenessClock(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
