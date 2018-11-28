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

 The content of the file looks like this:

    const render = entry => {
      const html = entry.selftext_html ? entry.selftext_html : '';

      const content = {
        type: 'self',
        html,
      };

      return content;

    };

    export default render;

The return must with be null, if the functin fails, or an object containing the render information.

The function may return a promise, for API lookups (see gfycat)

Valid content object type:
 - video
 - image
 - iframe16x9
 - iframe4x4

Video structure:
    const videoPreview = {
      width: media.width,
      height: media.height,
      mp4: media.fallback_url, (optional)
      webm: apiInfo.webmUrl, (optional)
      m3u8: media.hls_url, (optional)
      id: entry.name,
      type: 'video',
      sources, (optional)
      thumb: entry.thumbnail, (optional)
    };

Image Structure
    const imagePreview = {
      type: 'image',
      width: 650, (optional)
      height: 650, (optional)
      src: entry.url,
    };


iFrame Structure
  const content = {
    type: 'iframe16x9', (or 4x4)
    src: url,
  };
