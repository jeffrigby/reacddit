const embeds = require.context('./domains', false, /\.js$/);
const customEmbeds = require.context('./domains_custom', false, /\.js$/);

const obj = {};

customEmbeds.keys().forEach((key) => {
  const objKey = key.replace(/\.js|\.\//gi, '');
  obj[objKey] = customEmbeds(key).default;
});

embeds.keys().forEach((key) => {
  const objKey = key.replace(/\.js|\.\//gi, '');
  obj[objKey] = embeds(key).default;
});

module.exports = obj;
