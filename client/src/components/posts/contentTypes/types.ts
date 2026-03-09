/**
 * Type definitions for post content components
 *
 * Note: Embed content types (HttpsErrorContent, RawHTMLEmbedContent, RedditGalleryContent,
 * ImgurAlbumEmbedContent, SocialNetwork, etc.) are defined in @/components/posts/embeds/types.ts
 */

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
