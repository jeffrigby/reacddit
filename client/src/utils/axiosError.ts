import { isAxiosError } from 'axios';

/**
 * Extract HTTP status from an unknown error if it is an axios error.
 * Returns undefined when no status is available.
 */
export function getAxiosErrorStatus(err: unknown): number | undefined {
  if (isAxiosError(err)) {
    return err.response?.status;
  }
  return undefined;
}
