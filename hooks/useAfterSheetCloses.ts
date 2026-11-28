import { useCallback, useEffect, useRef } from 'react';

/** How long to wait for a sheet to say it has closed before going on anyway. */
export const SHEET_CLOSED_FALLBACK_MS = 600;

/**
 * Waits for a sheet to finish closing before something native opens in its
 * place (#867). iOS presents a screen, such as Quick Look's, only over one
 * that is staying, so a preview started while a sheet still slid away failed,
 * and the lesson opened in the browser instead.
 *
 * Give `onSheetClosed` to the sheet's AppSheet as `onClosed`. To close it,
 * call `afterSheetCloses()`, close the sheet, then await what it returned. It
 * resolves once: when the sheet says it has closed, or after
 * SHEET_CLOSED_FALLBACK_MS if it never does (it was never shown, or it had
 * already closed), so what comes next always happens, and only once.
 */
export function useAfterSheetCloses(fallbackMs = SHEET_CLOSED_FALLBACK_MS) {
  const waiting = useRef<(() => void) | null>(null);

  const onSheetClosed = useCallback(() => waiting.current?.(), []);

  const afterSheetCloses = useCallback(
    () =>
      new Promise<void>((resolve) => {
        // Only the latest close is waited for: a wait still under way ends now.
        waiting.current?.();
        const finish = () => {
          clearTimeout(timer);
          if (waiting.current === finish) waiting.current = null;
          resolve();
        };
        const timer = setTimeout(finish, fallbackMs);
        waiting.current = finish;
      }),
    [fallbackMs],
  );

  // Leaving the screen ends a wait, so no timer outlives it.
  useEffect(() => () => waiting.current?.(), []);

  return { afterSheetCloses, onSheetClosed };
}
