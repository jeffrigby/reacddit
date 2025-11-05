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

  if (nodeName === 'TEXTAREA') {
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
