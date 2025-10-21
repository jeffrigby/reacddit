## Custom Embeds

This directory is for custom embed code for domains that are not rendered.  
The filename is based on the entry.domain key return by reddit.

The files are included automatically when built. In other words, you don't need to  
include the filename anywhere.

The filename must be one of the following:

- The domain name, without any sub domains. Remove the periods as well.
- The domain name without subdomain or top level domain (com, net, org, etc.)

For example if the entry.domain is youtube.com. The embed renderer will look for
the following files in this order.

- youtube.ts
- youtubecom.ts

The content of the file looks something like this:

```typescript
import type { RedditPost } from '@/types/redditApi';

interface RenderContent {
  type: 'self' | 'video' | 'image' | 'iframe';
  html?: string;
  // ... other properties based on type
}

function render(entry: RedditPost): RenderContent | null {
  const html = entry.selftext_html ? entry.selftext_html : '';
  const content: RenderContent = {
    type: 'self',
    html,
  };
  return content;
}

export default render;
```

**Note**: All embed files should be written in TypeScript (`.ts` extension) with proper type definitions.

The return must with be null, if the functin fails, or an object containing the render information.  
The function may also return a promise, for API lookups (see gfycat)

**Valid content object type:**

- video
- image
- iframe

**Video structure:**

```typescript
const videoPreview = {
  width: media.width,
  height: media.height,
  mp4?: media.fallback_url,
  webm?: apiInfo.webmUrl,
  m3u8?: media.hls_url,
  type: 'video',
  sources?: VideoSource[],
  thumbnail?: string,
};
```

**Image Structure**

```typescript
const imagePreview = {
  type: 'image',
  width?: number,
  height?: number,
  url: string,
};
```

**iFrame Structure**

```typescript
const content = {
  type: 'iframe', // (or 4x4)
  src: string,
};
```
