const Common = {
  stripTrailingSlash(str) {
    if (str.substr(-1) === '/') {
      return str.substr(0, str.length - 1);
    }
    return str;
  },

  isEmpty(obj) {
    if (obj === null) return true;
    if (typeof obj !== 'object') return true;
    if (obj.length > 0) return false;
    if (obj.length === 0) return true;
    return Object.getOwnPropertyNames(obj).length <= 0;
  },
};

export default Common;
