import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCopyToClipboardResult {
  copied: boolean;
  error: Error | null;
  copy: (text: string) => Promise<boolean>;
}

/**
 * Copy text to the clipboard and flag success or failure for `resetMs` ms.
 * Re-invocations restart the timer; the timer is cleared on unmount.
 *
 * Returns `copied` for success state and `error` for failure state so callers
 * can surface clipboard rejections to users instead of failing silently.
 */
export function useCopyToClipboard(resetMs: number): UseCopyToClipboardResult {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
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
    (text: string): Promise<boolean> => {
      const onSuccess = (): boolean => {
        setCopied(true);
        setError(null);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setCopied(false);
        }, resetMs);
        return true;
      };

      const onFailure = (err: unknown): boolean => {
        const normalized =
          err instanceof Error ? err : new Error('Failed to copy to clipboard');
        console.error('Failed to copy to clipboard', err);
        setCopied(false);
        setError(normalized);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setError(null);
        }, resetMs);
        return false;
      };

      // Wrap in Promise.resolve().then(...) so a missing `navigator.clipboard`
      // (insecure context, sandboxed iframe, old webview) is surfaced through
      // the rejection path instead of throwing synchronously to the caller.
      return Promise.resolve()
        .then(() => {
          if (!navigator.clipboard?.writeText) {
            throw new Error('Clipboard API is unavailable');
          }
          return navigator.clipboard.writeText(text);
        })
        .then(onSuccess, onFailure);
    },
    [resetMs]
  );

  return { copied, error, copy };
}
