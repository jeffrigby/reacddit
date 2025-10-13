import { produce } from 'immer';

interface MenusStorage {
  [menuID: string]: boolean;
}

interface PrunableObject {
  [key: string]: {
    saved: number;
    [key: string]: unknown;
  };
}

/**
 * Retrieves all menus from localStorage.
 * @returns The menus stored in localStorage, or an empty object if no menus are found.
 */
export function getAllMenus(): MenusStorage {
  const storedMenus = localStorage.getItem('menus');
  return storedMenus ? JSON.parse(storedMenus) : {};
}

/**
 * Updates the status of a menu item in the menus object and saves the updated menus object in localStorage.
 * @param menuID - The ID of the menu item to update.
 * @param status - The new status of the menu item.
 */
export function setMenuStatus(menuID: string, status: boolean): void {
  const menus = getAllMenus();
  const newMenus = { ...menus, [menuID]: status };
  localStorage.setItem('menus', JSON.stringify(newMenus));
}

/**
 * Retrieves the status of a menu.
 * @param menuID - The ID of the menu.
 * @param defaultState - The default state to return if the menuID is not found.
 * @returns The status of the menu.
 */
export function getMenuStatus(menuID: string, defaultState = false): boolean {
  const menus = getAllMenus();
  return menuID in menus ? menus[menuID] : defaultState;
}

/**
 * Determines the status of the hotkey.
 * @return true if hotkey is active, false otherwise.
 */
export function hotkeyStatus(): boolean {
  const { activeElement } = document;

  if (!activeElement) {
    return true;
  }

  const { nodeName } = activeElement;

  if (nodeName === 'TEXTAREA') {
    return false;
  }

  return !(
    nodeName === 'INPUT' && (activeElement as HTMLInputElement).type === 'text'
  );
}

/**
 * Removes keys from an object based on the given criteria.
 * @param obj - The object to prune.
 * @param maxKeys - The maximum number of keys to keep.
 * @param maxAge - The maximum age (in seconds) of keys to keep.
 * @returns The pruned object.
 */
export function pruneObject<T extends PrunableObject>(
  obj: T,
  maxKeys: number,
  maxAge: number
): T {
  return produce(obj, (draft) => {
    const now = Date.now();
    const maxAgeMs = maxAge * 1000;

    // Remove keys older than maxAge
    Object.keys(draft).forEach((key) => {
      const { saved } = draft[key];
      if (saved > 0) {
        const elapsed = now - saved;
        if (elapsed > maxAgeMs) {
          delete draft[key];
        }
      }
    });

    // Remove excess keys if still over maxKeys limit
    const remainingKeys = Object.keys(draft);
    const keysToDelete = remainingKeys.length - maxKeys;

    if (keysToDelete > 0) {
      remainingKeys.slice(0, keysToDelete).forEach((deleteKey) => {
        delete draft[deleteKey];
      });
    }
  });
}

interface RedditEntry {
  data: {
    children: Array<{
      data: {
        name: string;
        [key: string]: unknown;
      };
    }>;
    [key: string]: unknown;
  };
}

interface KeyedRedditEntry {
  data: {
    children: {
      [name: string]: {
        data: {
          name: string;
          [key: string]: unknown;
        };
      };
    };
    [key: string]: unknown;
  };
}

/**
 * Transforms the children array of entries into an object, where each child object is mapped by its name.
 * Then updates the entries object with the new children mapping.
 * @param entries - The entries object.
 * @returns The updated entries object.
 */
export function keyEntryChildren(entries: RedditEntry): KeyedRedditEntry {
  const newChildren = entries.data.children.reduce(
    (acc, item) => ({
      ...acc,
      [item.data.name]: item,
    }),
    {} as KeyedRedditEntry['data']['children']
  );

  return produce(entries, (draft) => {
    (draft as unknown as KeyedRedditEntry).data.children = newChildren;
  }) as KeyedRedditEntry;
}

/**
 * Checks if the given value is numeric.
 * @param value - The value to be checked.
 * @returns True if the value is numeric, false otherwise.
 */
export function isNumeric(value: unknown): value is number | string {
  if (typeof value === 'number') {
    return true;
  }
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return !Number.isNaN(num);
  }
  return false;
}
