import type { EmbedsRegistry, EmbedRenderFunction } from './types';

const embeds = require.context('./domains', false, /\.ts$/);
const customEmbeds = require.context('./domains_custom', false, /\.ts$/);

const obj: EmbedsRegistry = {};

embeds.keys().forEach((key: string) => {
  const objKey = key.replace(/\.ts|\.\//gi, '');
  const module = embeds(key) as { default: EmbedRenderFunction };
  obj[objKey] = module.default;
});

customEmbeds.keys().forEach((key: string) => {
  const objKey = key.replace(/\.ts|\.\//gi, '');
  const module = customEmbeds(key) as { default: EmbedRenderFunction };
  obj[objKey] = module.default;
});

export default obj;
