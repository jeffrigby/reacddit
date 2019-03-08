import { parse } from 'tldjs';
import getUrls from 'get-urls';
import stripTags from 'locutus/php/strings/strip_tags';
import Embeds from './embeds';
import redditVideoPreview from './defaults/redditVideoPreview';
import redditImagePreview from './defaults/redditImagePreview';

const getKeys = url => {
  const regex = /[^a-zA-Z\d\s:]/g;
  if (url.substr(0, 5) === 'self.') {
    return {
      domain: url.replace(regex, ''),
      greedyDomain: 'self',
    };
  }

  const parsedDomain = parse(url);
  if (!parsedDomain.domain) {
    // no domain extracted. skip this.
    return null;
  }
  const domain = parsedDomain.domain.replace(regex, '');
  const greedyDomain = parsedDomain.domain
    .replace(parsedDomain.publicSuffix, '')
    .replace(regex, '');

  return { domain, greedyDomain };
};

const inlineLinks = entry => {
  // Remove the end </a> to fix a bug with the regex
  const text = stripTags(entry.selftext_html, '<a>').replace(/<\/a>/g, ' ');
  const links = getUrls(text);
  const inline = [];
  links.forEach(url => {
    const cleanUrl = url.replace(/^\(|\)$/g, '');
    const keys = getKeys(cleanUrl);
    if (!keys) return;

    const fakeEntry = {
      ...entry,
      url: cleanUrl,
    };

    if (typeof Embeds[keys.greedyDomain] === 'function') {
      const greedyContent = Embeds[keys.greedyDomain](fakeEntry);
      if (greedyContent) {
        inline.push(Embeds[keys.greedyDomain](fakeEntry));
      }
    }

    if (typeof Embeds[keys.domain] === 'function') {
      const content = Embeds[keys.domain](fakeEntry);
      if (content) {
        inline.push(Embeds[keys.domain](fakeEntry));
      }
    }
  });

  return inline;
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
          renderFunction: keys.domain,
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
  const keys = getKeys(entry.domain);

  const content = await getContent(keys, entry);

  if (keys.greedyDomain === 'self' && entry.selftext_html) {
    const inline = inlineLinks(entry);
    if (inline.length > 0) {
      content.inline = inline;
    }
  }

  return content;
};

export default RenderContent;
