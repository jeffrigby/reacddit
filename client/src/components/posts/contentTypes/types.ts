/**
 * Type definitions for post content components
 */

/**
 * Content for HTTPSError component
 */
export interface HTTPSErrorContent {
  src?: string;
}

/**
 * Content for RawHTML component
 */
export interface RawHTMLContent {
  html: string;
}

/**
 * Media item in Reddit gallery
 */
export interface RedditGalleryMediaItem {
  preview: {
    url: string;
    width: number;
    height: number;
  };
  thumb: {
    url: string;
    width: number;
    height: number;
  };
  // Legacy support for 'u' property
  u?: string;
}

/**
 * Content for RedditGallery component
 */
export interface RedditGalleryContent {
  media: RedditGalleryMediaItem[];
}

/**
 * Content for ImageComp component
 */
export interface ImageContent {
  src: string;
  title?: string;
  width?: number;
  height?: number;
  class?: string;
}

/**
 * Imgur image in an album
 */
export interface ImgurImage {
  id: string;
  animated: boolean;
  link?: string;
  src?: string;
  width?: number;
  height?: number;
  // Video-specific properties when animated=true
  sources?: Array<{ src: string; type: string }>;
  hasAudio?: boolean;
  audioWarning?: boolean;
  thumb?: string;
}

/**
 * Content for ImgurAlbum component
 */
export interface ImgurAlbumContent {
  images_count: number;
  cover_height: number;
  cover_width: number;
  images: ImgurImage[];
}

/**
 * Supported social media networks
 */
export type SocialNetwork = 'x' | 'instagram' | 'facebook';
