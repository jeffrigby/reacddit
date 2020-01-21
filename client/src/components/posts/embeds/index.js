import { getPublicSuffix, getDomain } from 'tldts';
import getUrls from 'get-urls';
import stripTags from 'locutus/php/strings/strip_tags';
import parse from 'url-parse';
import Embeds from './embeds';
import redditVideoPreview from './defaults/redditVideoPreview';
import redditImagePreview from './defaults/redditImagePreview';
import redditMediaEmbed from './defaults/redditMediaEmbed';

const getKeys = url => {
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

const inlineLinks = entry => {
  // Remove the end </a> to fix a bug with the regex
  const text = stripTags(entry.selftext_html, '<a>').replace(/<\/a>/g, ' ');
  const links = getUrls(text);
  const dupes = [];
  const inline = [];
  const renderedLinks = [];
  links.forEach(url => {
    const cleanUrl = url.replace(/^\(|\)$/g, '');
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
  }
  return content;
};

const getContent = async (keys, entry) => {
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

const RenderContent = async entry => {
  try {
    const keys = getKeys(entry.domain);
    const content = await getContent(keys, entry);

    if (keys.greedyDomain === 'self' && entry.selftext_html) {
      const getInline = inlineLinks(entry);
      if (getInline.inline.length > 0) {
        content.inline = getInline.inline;
        content.inlineLinks = getInline.renderedLinks;
      }
    }

    return nonSSLFallback(content, entry);
  } catch (e) {
    // console.log(e);
  }
  return null;
};

export default RenderContent;
