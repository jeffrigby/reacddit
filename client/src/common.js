import produce from 'immer';

export const getAllMenus = () => {
  const storedMenus = localStorage.getItem('menus');
  return storedMenus ? JSON.parse(storedMenus) : {};
};

export const setMenuStatus = (menuID, status) => {
  const menus = getAllMenus();
  const save = {};
  save[menuID] = status;
  const newMenus = { ...menus, ...save };
  localStorage.setItem('menus', JSON.stringify(newMenus));
};

export const getMenuStatus = (menuID, defaultState = false) => {
  const menus = getAllMenus();
  return menuID in menus ? menus[menuID] : defaultState;
};

export const hotkeyStatus = () => {
  const { activeElement } = document;
  const { nodeName } = activeElement;

  if (nodeName === 'TEXTAREA') {
    return false;
  }

  return !(nodeName === 'INPUT' && activeElement.type === 'text');
};

export const pruneObject = (obj, maxKeys, maxAge) =>
  produce(obj, (draft) => {
    const keys = Object.keys(draft);

    // Remove the keys older than an hour
    keys.forEach((key) => {
      const { saved } = draft[key];
      if (saved > 0) {
        const elapsed = Date.now() - saved;
        if (elapsed > maxAge * 1000) delete draft[key];
      }
    });

    const slice = keys.length - maxKeys;

    if (slice >= 0) {
      const deleteKeys = keys.slice(0, slice);
      deleteKeys.forEach((deleteKey) => {
        delete draft[deleteKey];
      });
    }
  });

/**
 * Key the entry children to the name key
 * @param entries - entries from a listing
 */
export const keyEntryChildren = (entries) => {
  const arrayToObject = (arr, keyField) =>
    Object.assign({}, ...arr.map((item) => ({ [item.data[keyField]]: item })));

  const newChildren = arrayToObject(entries.data.children, 'name');
  return produce(entries, (draft) => {
    draft.data.children = newChildren;
  });
};
