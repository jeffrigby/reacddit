import parse from 'url-parse';
import type { LinkData, ImageDetails } from '@/types/redditApi';
import type { ImageEmbedContent } from '@/components/posts/embeds/types';

const IMAGE_HEIGHT_THRESHOLD = 748;
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|ico)$/i;

function findBestResolution(
  resolutions: ImageDetails[]
): ImageDetails | undefined {
  return resolutions.find((res) => res.height > IMAGE_HEIGHT_THRESHOLD);
}

interface BaseImage {
  title: string;
  type: 'image';
  renderFunction: string;
}

function createImageProps(
  base: BaseImage,
  { width, height, url }: ImageDetails
): ImageEmbedContent {
  return {
    ...base,
    width,
    height,
    src: url,
  };
}

function redditImagePreview(entry: LinkData): ImageEmbedContent | null {
  const baseImage: BaseImage = {
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
}

export default redditImagePreview;
