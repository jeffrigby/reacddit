import { getPublicSuffix, getDomain } from 'tldts';
import stripTags from 'locutus/php/strings/strip_tags';
import parse from 'url-parse';
import type { LinkData, CommentData } from '../../../types/redditApi';
import type {
  EmbedContent,
  DomainKeys,
  InlineLinksResult,
  HttpsErrorContent,
} from './types';
import Embeds from './embeds';
import redditVideoPreview from './defaults/redditVideoPreview';
import redditImagePreview from './defaults/redditImagePreview';
import redditMediaEmbed from './defaults/redditMediaEmbed';
import redditGallery from './defaults/redditGallery';
const urlRegex = require('url-regex-safe');

function getKeys(url: string): DomainKeys | null {
  const regex = /[^a-zA-Z\d\s:]/g;
  if (url.substr(0, 5) === 'self.') {
    return {
      domain: url.replace(regex, ''),
      greedyDomain: 'self',
    };
  }

  const parsedDomain = getDomain(url, { detectIp: false });
  const suffix = getPublicSuffix(url, { detectIp: false });

  if (!parsedDomain) {
    return null;
  }

  const domain = parsedDomain.replace(regex, '');
  const greedyDomain = parsedDomain
    .replace(suffix ?? '', '')
    .replace(regex, '');

  return { domain, greedyDomain };
}

function inlineLinks(
  entry: LinkData | CommentData,
  kind: string
): InlineLinksResult {
  // Remove the end </a> to fix a bug with the regex
  const textContent =
    kind === 't1'
      ? (entry as CommentData).body_html
      : (entry as LinkData).selftext_html;
  const text = stripTags(textContent ?? '', '<a>').replace(/<\/a>/g, ' ');

  // const links = getUrls(text);
  const links = text.match(urlRegex()) ?? [];

  const dupes: string[] = [];
  const inline: EmbedContent[] = [];
  const renderedLinks: string[] = [];

  links.forEach((url: string) => {
    const cleanUrl = url.replace(/^\(|\)$/g, '');

    // If a match doesn't start with http skip it.
    if (!cleanUrl.match(/^http/)) {
      return;
    }

    const keys = getKeys(cleanUrl);
    if (!keys) {
      return;
    }

    if (dupes.includes(url)) {
      return;
    }
    dupes.push(url);

    const fakeEntry = {
      ...entry,
      url: cleanUrl,
    };
    delete (fakeEntry as Partial<LinkData>).preview;

    let embedContent: EmbedContent;
    if (typeof Embeds[keys.greedyDomain] === 'function') {
      const greedyContent = Embeds[keys.greedyDomain](fakeEntry);
      if (greedyContent) {
        embedContent = Embeds[keys.greedyDomain](fakeEntry);
        if (embedContent) {
          renderedLinks.push(url);
          inline.push(embedContent);
        }
      }
    }

    if (typeof Embeds[keys.domain] === 'function') {
      embedContent = Embeds[keys.domain](fakeEntry);
      if (embedContent) {
        renderedLinks.push(url);
        inline.push(embedContent);
      }
    }
  });

  return { renderedLinks, inline };
}

function nonSSLFallback(
  content: EmbedContent,
  entry: LinkData | CommentData
): EmbedContent {
  const isSSL = window.location.protocol;
  if (isSSL === 'https:' && content && 'src' in content && content.src) {
    const { protocol } = parse(content.src);
    if (protocol === 'http:') {
      // Check for preview image:
      if (content.renderFunction !== 'redditImagePreview') {
        try {
          const image = redditImagePreview(entry as LinkData);
          if (image) {
            return {
              ...image,
              renderFunction: 'redditImagePreview',
            };
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Return error.
      const errorContent: HttpsErrorContent = {
        ...content,
        type: 'httpserror',
      };
      return errorContent;
    }
  }
  return content;
}

/**
 * Get the content for a post.
 * @param keys - The keys to use for the content.
 * @param entry - The entry to get the content for.
 * @returns Promise resolving to embed content
 */
async function getContent(
  keys: DomainKeys,
  entry: LinkData | CommentData
): Promise<EmbedContent> {
  // is this a gallery?
  if ('is_gallery' in entry && entry.is_gallery) {
    try {
      const gallery = redditGallery(entry as LinkData);
      if (gallery) {
        return {
          ...gallery,
          renderFunction: 'redditGallery',
        };
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (typeof Embeds[keys.greedyDomain] === 'function') {
    try {
      const greedyDomainContent = await Embeds[keys.greedyDomain](entry);
      if (greedyDomainContent) {
        return {
          ...greedyDomainContent,
          renderFunction: keys.greedyDomain,
        };
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (typeof Embeds[keys.domain] === 'function') {
    try {
      const domainContent = await Embeds[keys.domain](entry);
      if (domainContent) {
        return {
          ...domainContent,
          initRenderFunction: keys.domain,
        };
      }
    } catch (e) {
      console.error(e);
    }
  }

  // console.log('NOTFOUND', keys.domain, keys.greedyDomain, entry.url);

  // Fallback video content
  try {
    const video = redditVideoPreview(entry as LinkData);
    if (video) {
      return {
        ...video,
        renderFunction: 'redditVideoPreview',
      };
    }
  } catch (e) {
    console.error(e);
  }

  // Fallback media content
  try {
    const embed = redditMediaEmbed(entry as LinkData);
    if (embed) {
      return {
        ...embed,
        renderFunction: 'redditMediaEmbed',
      };
    }
  } catch (e) {
    console.error(e);
  }

  // Check for preview image:
  try {
    const image = redditImagePreview(entry as LinkData);
    if (image) {
      return {
        ...image,
        renderFunction: 'redditImagePreview',
      };
    }
  } catch (e) {
    console.error(e);
  }

  return null;
}

/**
 * Get the content for a post.
 * @param entry - The entry to get the content for.
 * @param kind - The kind of entry. (t1, t3, etc)
 * @returns Promise resolving to rendered content or null
 */
async function RenderContent(
  entry: LinkData | CommentData,
  kind: string
): Promise<EmbedContent> {
  try {
    if (kind === 't1') {
      // const getInline = inlineLinks(entry);
      const content = await getContent({ greedyDomain: 'comment' }, entry);
      const commentInlineLinks = inlineLinks(entry, kind);
      if (commentInlineLinks.inline.length > 0 && content) {
        return {
          ...content,
          inline: commentInlineLinks.inline,
          inlineLinks: commentInlineLinks.renderedLinks,
        } as EmbedContent;
      }
      return content;
    }

    const { domain, selftext_html: selfTextHtml } = entry as LinkData;

    if (!domain) {
      return null;
    }

    const keys = getKeys(domain);
    if (!keys) {
      return null;
    }

    const content = await getContent(keys, entry);

    if (keys.greedyDomain === 'self' && selfTextHtml) {
      const getInline = inlineLinks(entry, kind);
      if (getInline.inline.length > 0 && content) {
        return {
          ...content,
          inline: getInline.inline,
          inlineLinks: getInline.renderedLinks,
        } as EmbedContent;
      }
    }

    return nonSSLFallback(content, entry);
  } catch (e) {
    console.error(e);
  }
  return null;
}

export default RenderContent;
