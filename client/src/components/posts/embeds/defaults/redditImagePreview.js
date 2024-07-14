import parse from 'url-parse';

const IMAGE_HEIGHT_THRESHOLD = 748;
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|ico)$/i;

const findBestResolution = (resolutions) =>
  resolutions.find((res) => res.height > IMAGE_HEIGHT_THRESHOLD);

const createImageProps = (base, { width, height, url }) => ({
  ...base,
  width,
  height,
  src: url,
});

const redditImagePreview = (entry) => {
  const baseImage = {
    title: entry.title,
    type: 'image',
    renderFunction: 'redditImagePreview',
  };

  if (entry.preview?.images?.[0]) {
    const { resolutions, source } = entry.preview.images[0];

    const bestRes = findBestResolution(resolutions);
    if (bestRes) {
      return createImageProps(baseImage, bestRes);
    }

    if (source) {
      return createImageProps(baseImage, source);
    }
  }

  const { pathname } = parse(entry.url);

  if (IMAGE_EXTENSIONS.test(pathname)) {
    return {
      ...baseImage,
      src: entry.url,
    };
  }

  return null;
};

export default redditImagePreview;
