import type { EmbedsRegistry, EmbedRenderFunction } from './types';

// Use Vite's import.meta.glob for dynamic module loading
const embedModules = import.meta.glob('./domains/*.ts', { eager: true });
const customEmbedModules = import.meta.glob('./domains_custom/*.ts', {
  eager: true,
});

const obj: EmbedsRegistry = {};

// Process standard embed modules
Object.entries(embedModules).forEach(([path, module]) => {
  const key = path.replace(/^\.\/domains\/(.*)\.ts$/, '$1');
  obj[key] = (module as { default: EmbedRenderFunction }).default;
});

// Process custom embed modules
Object.entries(customEmbedModules).forEach(([path, module]) => {
  const key = path.replace(/^\.\/domains_custom\/(.*)\.ts$/, '$1');
  obj[key] = (module as { default: EmbedRenderFunction }).default;
});

export default obj;
