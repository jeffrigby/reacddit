import { getPublicSuffix, getDomain } from 'tldts';
import type { LinkData, CommentData } from '@/types/redditApi';
import type {
  EmbedsRegistry,
  EmbedRenderFunction,
  EmbedContent,
  DomainKeys,
} from './types';

// Use Vite's import.meta.glob for dynamic module loading
const embedModules = import.meta.glob('./domains/*.ts', { eager: true });
const customEmbedModules = import.meta.glob('./domains_custom/*.ts', {
  eager: true,
});

const Embeds: EmbedsRegistry = {};

// Process standard embed modules
Object.entries(embedModules).forEach(([path, module]) => {
  const key = path.replace(/^\.\/domains\/(.*)\.ts$/, '$1');
  Embeds[key] = (module as { default: EmbedRenderFunction }).default;
});

// Process custom embed modules
Object.entries(customEmbedModules).forEach(([path, module]) => {
  const key = path.replace(/^\.\/domains_custom\/(.*)\.ts$/, '$1');
  Embeds[key] = (module as { default: EmbedRenderFunction }).default;
});

// Regex to keep only alphanumeric characters for handler names
const ALPHANUMERIC_ONLY = /[^a-zA-Z0-9]/g;

/**
 * Extract domain keys from a URL for handler lookup
 * @param url - The URL to extract keys from
 * @returns Domain keys for handler lookup, or null if invalid
 *
 * @example
 * getKeys('https://youtube.com/watch?v=123')
 * // Returns: { domain: 'youtubecom', greedyDomain: 'youtube' }
 */
export function getKeys(url: string): DomainKeys | null {
  // Handle self posts (text posts)
  if (url.startsWith('self.')) {
    return {
      domain: url.replace(ALPHANUMERIC_ONLY, ''),
      greedyDomain: 'self',
    };
  }

  // Extract domain using tldts library
  const parsedDomain = getDomain(url, { detectIp: false });
  const suffix = getPublicSuffix(url, { detectIp: false });

  if (!parsedDomain) {
    return null;
  }

  // Create handler-friendly names (e.g., 'youtube.com' → 'youtubecom')
  const domain = parsedDomain.replace(ALPHANUMERIC_ONLY, '');

  // Create greedy domain by removing TLD (e.g., 'youtube.com' → 'youtube')
  const greedyDomain = parsedDomain
    .replace(suffix ?? '', '')
    .replace(ALPHANUMERIC_ONLY, '');

  return { domain, greedyDomain };
}

/**
 * Try domain handlers in order: greedyDomain first, then exact domain
 * @param keys - Domain keys containing greedyDomain and domain
 * @param entry - Reddit entry to render
 * @returns Embed content with renderFunction set, or null
 */
export async function tryDomainHandlers(
  keys: DomainKeys,
  entry: LinkData | CommentData
): Promise<EmbedContent> {
  // Try greedy domain first (e.g., "youtube" from "youtube.com")
  if (typeof Embeds[keys.greedyDomain] === 'function') {
    const content = await Embeds[keys.greedyDomain](entry);
    if (content) {
      return { ...content, renderFunction: keys.greedyDomain };
    }
  }

  // Try exact domain if greedy didn't match (e.g., "youtubecom")
  if (typeof Embeds[keys.domain] === 'function') {
    const content = await Embeds[keys.domain](entry);
    if (content) {
      return { ...content, renderFunction: keys.domain };
    }
  }

  return null;
}

export default Embeds;
