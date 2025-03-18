import { produce } from 'immer';

/**
 * Retrieves all menus from localStorage.
 * @returns {object} - The menus stored in localStorage, or an empty object if no menus are found.
 */
export const getAllMenus = () => {
  const storedMenus = localStorage.getItem('menus');
  return storedMenus ? JSON.parse(storedMenus) : {};
};

/**
 * Updates the status of a menu item in the menus object and saves the updated menus object in localStorage.
 * @param {string} menuID - The ID of the menu item to update.
 * @param {boolean} status - The new status of the menu item.
 * @returns {undefined}
 */
export const setMenuStatus = (menuID, status) => {
  const menus = getAllMenus();
  const save = {};
  save[menuID] = status;
  const newMenus = { ...menus, ...save };
  localStorage.setItem('menus', JSON.stringify(newMenus));
};

/**
 * Retrieves the status of a menu.
 * @param {string} menuID - The ID of the menu.
 * @param {boolean} [defaultState=false] - The default state to return if the menuID is not found.
 * @returns {boolean} - The status of the menu.
 */
export const getMenuStatus = (menuID, defaultState = false) => {
  const menus = getAllMenus();
  return menuID in menus ? menus[menuID] : defaultState;
};

/**
 * Determines the status of the hotkey.
 * @return {boolean} true if hotkey is active, false otherwise.
 */
export const hotkeyStatus = () => {
  const { activeElement } = document;
  const { nodeName } = activeElement;

  if (nodeName === 'TEXTAREA') {
    return false;
  }

  return !(nodeName === 'INPUT' && activeElement.type === 'text');
};

/**
 * Removes keys from an object based on the given criteria.
 * @param {Object} obj - The object to prune.
 * @param {number} maxKeys - The maximum number of keys to keep.
 * @param {number} maxAge - The maximum age (in seconds) of keys to keep.
 * @returns {Object} - The pruned object.
 */
export const pruneObject = (obj, maxKeys, maxAge) =>
  produce(obj, (draft) => {
    const keys = Object.keys(draft);

    // Remove the keys older than an hour
    keys.forEach((key) => {
      const { saved } = draft[key];
      if (saved > 0) {
        const elapsed = Date.now() - saved;
        if (elapsed > maxAge * 1000) {
          delete draft[key];
        }
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
 * Transforms the children array of entries into an object, where each child object is mapped by its name.
 * Then updates the entries object with the new children mapping.
 * @param {object} entries - The entries object.
 * @returns {object} - The updated entries object.
 */
export const keyEntryChildren = (entries) => {
  const arrayToObject = (arr, keyField) =>
    Object.assign({}, ...arr.map((item) => ({ [item.data[keyField]]: item })));

  const newChildren = arrayToObject(entries.data.children, 'name');
  return produce(entries, (draft) => {
    draft.data.children = newChildren;
  });
};

/**
 * Checks if the given value is numeric.
 * @param {any} value - The value to be checked.
 * @returns {boolean} - True if the value is numeric, false otherwise.
 */
export const isNumeric = (value) => {
  if (typeof value === 'number') {
    return true;
  }
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return !Number.isNaN(num);
  }
  return false;
};
