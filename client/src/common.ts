function getScrollContainer(): Element {
  const body = document.body;
  const html = document.documentElement;

  // Bootstrap 5 reboot sets overflow on body, making it the scroll container
  if (body.scrollHeight > body.clientHeight) {
    return body;
  }

  return html;
}

export function scrollToPosition(x: number, y: number): void {
  const scrollContainer = getScrollContainer();
  scrollContainer.scrollLeft = x;
  scrollContainer.scrollTop = y;
}

export function scrollByAmount(x: number, y: number): void {
  const scrollContainer = getScrollContainer();
  scrollContainer.scrollLeft += x;
  scrollContainer.scrollTop += y;
}

interface MenusStorage {
  [menuID: string]: boolean;
}

function getAllMenus(): MenusStorage {
  const storedMenus = localStorage.getItem('menus');
  return storedMenus ? JSON.parse(storedMenus) : {};
}

export function setMenuStatus(menuID: string, status: boolean): void {
  const menus = getAllMenus();
  const newMenus = { ...menus, [menuID]: status };
  localStorage.setItem('menus', JSON.stringify(newMenus));
}

export function getMenuStatus(menuID: string, defaultState = false): boolean {
  const menus = getAllMenus();
  return menuID in menus ? menus[menuID] : defaultState;
}

export function hotkeyStatus(): boolean {
  const { activeElement } = document;

  if (!activeElement) {
    return true;
  }

  const { nodeName } = activeElement;

  if (nodeName === 'TEXTAREA' || nodeName === 'IFRAME') {
    return false;
  }

  return !(
    nodeName === 'INPUT' && (activeElement as HTMLInputElement).type === 'text'
  );
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

export function keyEntryChildren(entries: RedditEntry): KeyedRedditEntry {
  const newChildren = entries.data.children.reduce(
    (acc, item) => ({
      ...acc,
      [item.data.name]: item,
    }),
    {} as KeyedRedditEntry['data']['children']
  );

  return {
    ...entries,
    data: {
      ...entries.data,
      children: newChildren,
    },
  } as KeyedRedditEntry;
}

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

/**
 * Check if a value is empty (null, undefined, empty string, empty array, or empty object)
 *
 * @param value - Value to check
 * @returns true if empty, false otherwise
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) {
    return true;
  }

  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
}

/**
 * Detect if the current browser is Safari (excluding Chrome on iOS/Android)
 * @returns true if Safari browser
 */
export function isSafari(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

/**
 * Detect if the current device is iOS (iPhone, iPad, iPod)
 * Note: All browsers on iOS use WebKit, so they all behave like Safari
 * Modern iPadOS (13+) reports as macOS in user agent, so we also check for touch support
 * @returns true if iOS device
 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  // Check for traditional iOS user agents (iPhone, iPod, older iPads)
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    return true;
  }

  // Modern iPadOS 13+ reports as "Macintosh" with touch support
  // Check for macOS user agent with touch capability (indicates iPad)
  const isMacWithTouch =
    navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;

  return isMacWithTouch;
}

/**
 * Format a timestamp as relative time (e.g., "2m ago", "1h ago", "2d ago")
 *
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Human-readable relative time string
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  // Handle future timestamps (shouldn't happen, but be safe)
  if (diffMs < 0) {
    return 'just now';
  }

  // Less than 1 minute
  if (diffSec < 60) {
    return 'just now';
  }

  // Less than 1 hour
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }

  // Less than 24 hours
  if (diffHour < 24) {
    return `${diffHour}h ago`;
  }

  // Less than 7 days
  if (diffDay < 7) {
    return diffDay === 1 ? 'yesterday' : `${diffDay}d ago`;
  }

  // 7+ days - show date
  const date = new Date(timestamp);
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
}
