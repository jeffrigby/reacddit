## Custom Embeds

This directory is for custom embed code for domains that are not rendered.  
The filename is based on the entry.domain key return by reddit.

The files are included automatically when built. In other words, you don't need to  
include the filename anywhere.

The filename must be one of the following:

- The domain name, without any sub domains. Remove the periods as well.
- The domain name without subdomain or top level domain (com, net, org, etc.)

For example if the entry.domain is gfycat.com. The embed renderer will look for  
the following files in this order.

- gfycat.js
- gfycatcom.js

The content of the file looks something like this:

```javascript 1.8
const render = (entry) => {
  const html = entry.selftext_html ? entry.selftext_html : '';
  const content = {
    type: 'self',
    html,
  };
  return content;
};

export default render;
```

The return must with be null, if the functin fails, or an object containing the render information.  
The function may also return a promise, for API lookups (see gfycat)

**Valid content object type:**

- video
- image
- iframe16x9
- iframe4x4

**Video structure:**

````javascript
const videoPreview = {  width: media.width,
  height: media.height,
  mp4: media.fallback_url, (optional)
  webm: apiInfo.webmUrl, (optional)
  m3u8: media.hls_url, (optional) entry.name,
  type;: 'video',  sources, (optional);
  entry.thumbnail, (optional);}
}```
**Image Structure**
```javascript
const imagePreview = {
  type: 'image',
  width: 650, (optional);
  650, (optional);
  entry.url,
}
````

**iFrame Structure**

```javascript
const content = {
  type: 'iframe16x9', // (or 4x4)
  src: url,
};
```
