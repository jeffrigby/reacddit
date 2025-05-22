/**
 * Type utilities for the Reacddit client
 */

/**
 * Safe type assertion helper
 * @param value Any value to check
 * @param check Function that checks if the value matches expected type
 * @param defaultValue Value to return if check fails
 */
export function typeSafe<T>(
  value: unknown,
  check: (val: unknown) => boolean,
  defaultValue: T
): T {
  return check(value) ? (value as T) : defaultValue;
}

/**
 * Checks if a value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Safely gets a property from an object with type checking
 */
export function safeGet<T>(obj: unknown, key: string, defaultValue: T): T {
  if (isObject(obj) && key in obj) {
    return typeSafe<T>(obj[key], () => true, defaultValue);
  }
  return defaultValue;
}
