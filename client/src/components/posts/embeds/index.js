import { getPublicSuffix, getDomain } from 'tldts';
import stripTags from 'locutus/php/strings/strip_tags';
import parse from 'url-parse';
import Embeds from './embeds';
import redditVideoPreview from './defaults/redditVideoPreview';
import redditImagePreview from './defaults/redditImagePreview';
import redditMediaEmbed from './defaults/redditMediaEmbed';
import redditGallery from './defaults/redditGallery';

const urlRegex = require('url-regex-safe');

const getKeys = (url) => {
  const regex = /[^a-zA-Z\d\s:]/g;
  if (url.substr(0, 5) === 'self.') {
    return {
      domain: url.replace(regex, ''),
      greedyDomain: 'self',
    };
  }

  const parsedDomain = getDomain(url, { detectIp: false });
  const suffix = getPublicSuffix(url, { detectIp: false });
  const domain = parsedDomain.replace(regex, '');
  const greedyDomain = parsedDomain.replace(suffix, '').replace(regex, '');

  return { domain, greedyDomain };
};

const inlineLinks = (entry, kind) => {
  // Remove the end </a> to fix a bug with the regex
  const textContent = kind === 't1' ? entry.body_html : entry.selftext_html;
  const text = stripTags(textContent, '<a>').replace(/<\/a>/g, ' ');

  // const links = getUrls(text);
  const links = text.match(urlRegex()) || [];

  const dupes = [];
  const inline = [];
  const renderedLinks = [];
  links.forEach((url) => {
    const cleanUrl = url.replace(/^\(|\)$/g, '');

    // If a match doesn't start with http skip it.
    if (!cleanUrl.match(/^http/)) return;

    const keys = getKeys(cleanUrl);
    if (!keys) return;

    if (dupes.includes(url)) return;
    dupes.push(url);

    const fakeEntry = {
      ...entry,
      url: cleanUrl,
    };
    delete fakeEntry.preview;

    let embedContent;
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
};

const nonSSLFallback = (content, entry) => {
  const isSSL = window.location.protocol;
  if (isSSL === 'https:' && content.src) {
    const { protocol } = parse(content.src);
    if (protocol === 'http:') {
      // Check for preview image:
      if (content.renderFunction !== 'redditImagePreview') {
        try {
          const image = redditImagePreview(entry);
          if (image) {
            return {
              ...image,
              renderFunction: 'redditImagePreview',
            };
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
        }
      }

      // Return error.
      return {
        ...content,
        type: 'httpserror',
      };
    }
  }
  return content;
};

/**
 * Get the content for a post.
 * @param keys {Object} - The keys to use for the content.
 * @param entry {Object} - The entry to get the content for.
 * @returns {Promise<{allow: *, renderFunction: string, src: *, type: string}|{}|{renderFunction: string, sources: ([{src, type: string}]|*[]), thumb: *, width: never, id: never, type: string, height: never}|{renderFunction: string, src: (*), type: string}|{renderFunction: string, media: [], type: string}|{[p: string]: *}>}
 */
const getContent = async (keys, entry) => {
  // is this a gallery?
  if (entry.is_gallery) {
    try {
      const gallery = redditGallery(entry);
      if (gallery) {
        return {
          ...gallery,
          renderFunction: 'redditGallery',
        };
      }
    } catch (e) {
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
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
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }

  // console.log('NOTFOUND', keys.domain, keys.greedyDomain, entry.url);

  // Fallback video content
  try {
    const video = redditVideoPreview(entry);
    if (video) {
      return {
        ...video,
        renderFunction: 'redditVideoPreview',
      };
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }

  // Fallback media content
  try {
    const embed = redditMediaEmbed(entry);
    if (embed) {
      return {
        ...embed,
        renderFunction: 'redditMediaEmbed',
      };
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }

  // Check for preview image:
  try {
    const image = redditImagePreview(entry);
    if (image) {
      return {
        ...image,
        renderFunction: 'redditImagePreview',
      };
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }

  return {};
};

/**
 * Get the content for a post.
 * @param entry {Object} - The entry to get the content for.
 * @param kind {string} - The kind of entry. (t1, t3, etc)
 * @returns {Promise<{renderFunction: string, src: (*), type: string}|(*&{type: string})|{src}|*|{allow: *, renderFunction: string, src: *, type: string}|{}|{renderFunction: string, sources: ({src, type: string}[]|*[]), thumb: *, width: never, id: never, type: string, height: never}|{renderFunction: string, src: *, type: string}|{renderFunction: string, media: [], type: string}|{[p: string]: *}|null>}
 * @constructor
 */
const RenderContent = async (entry, kind) => {
  try {
    if (kind === 't1') {
      // const getInline = inlineLinks(entry);
      const content = await getContent({ greedyDomain: 'comment' }, entry);
      const commentInlineLinks = inlineLinks(entry, kind);
      if (commentInlineLinks.inline.length > 0) {
        content.inline = commentInlineLinks.inline;
        content.inlineLinks = commentInlineLinks.renderedLinks;
      }
      return content;
    }

    const { domain, selftext_html: selfTextHtml } = entry;

    if (!domain) {
      return null;
    }

    const keys = getKeys(domain);
    const content = await getContent(keys, entry);

    if (keys.greedyDomain === 'self' && selfTextHtml) {
      const getInline = inlineLinks(entry, kind);
      if (getInline.inline.length > 0) {
        content.inline = getInline.inline;
        content.inlineLinks = getInline.renderedLinks;
      }
    }

    return nonSSLFallback(content, entry);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
  return null;
};

export default RenderContent;
