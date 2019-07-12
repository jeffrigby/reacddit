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
  // console.log(menus[menuID], menus[menuID] !== undefined);
  return menuID in menus ? menus[menuID] : defaultState;
};

export const hotkeyStatus = () => {
  const { activeElement } = document;
  const { nodeName } = activeElement;
  return !(
    nodeName === 'textarea' ||
    (nodeName === 'input' && activeElement.type === 'text')
  );
};
