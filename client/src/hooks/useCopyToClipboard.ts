import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCopyToClipboardResult {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
}

/**
 * Copy text to the clipboard and flag success for `resetMs` ms.
 * Re-invocations restart the timer; the timer is cleared on unmount.
 */
export function useCopyToClipboard(resetMs: number): UseCopyToClipboardResult {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
    []
  );

  const copy = useCallback(
    (text: string): Promise<boolean> =>
      navigator.clipboard.writeText(text).then(
        () => {
          setCopied(true);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          timeoutRef.current = setTimeout(() => {
            setCopied(false);
          }, resetMs);
          return true;
        },
        (err: unknown) => {
          console.error('Failed to copy to clipboard', err);
          return false;
        }
      ),
    [resetMs]
  );

  return { copied, copy };
}
