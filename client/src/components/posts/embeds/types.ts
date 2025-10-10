/**
 * Type definitions for the embeds system
 */
import type { LinkData, CommentData } from '../../../types/redditApi';

// Video source types
export interface VideoSource {
  type: string;
  src: string;
}

// Gallery media item
export interface GalleryMediaItem {
  key: string;
  type: string;
  source: {
    url: string;
    width: number;
    height: number;
  };
  thumb: {
    url: string;
    width: number;
    height: number;
  };
  preview: {
    url: string;
    width: number;
    height: number;
  };
}

// Base embed content interface
export interface BaseEmbedContent {
  renderFunction?: string;
}

// Image embed content
export interface ImageEmbedContent extends BaseEmbedContent {
  type: 'image';
  src: string;
  width?: number;
  height?: number;
  title?: string;
}

// Video embed content
export interface VideoEmbedContent extends BaseEmbedContent {
  type: 'video';
  sources: VideoSource[];
  id?: string;
  width?: number;
  height?: number;
  thumb?: string | null;
  hasAudio?: boolean;
  audioWarning?: boolean;
  media?: {
    iframe?: string;
    apiInfo?: Record<string, unknown>;
  };
  imgurRenderType?:
    | 'imgurGifVPath'
    | 'imgurMP4Path'
    | 'imgurMP4'
    | 'albumMP4'
    | 'imgurImagePath';
}

// IFrame embed content
export interface IFrameEmbedContent extends BaseEmbedContent {
  type: 'iframe';
  src: string;
  width?: number;
  height?: number;
  title?: string;
  allow?: string;
  referrerPolicy?: string;
}

// Self/Comment text content
export interface SelfTextContent extends BaseEmbedContent {
  type: 'self';
  html: string;
  inline: EmbedContent[];
  inlineLinks?: string[];
}

// Reddit Gallery content
export interface RedditGalleryContent extends BaseEmbedContent {
  type: 'redditGallery';
  media: GalleryMediaItem[];
}

// HTTPS error content
export interface HttpsErrorContent extends BaseEmbedContent {
  type: 'httpserror';
  src?: string;
}

// Social media embed content
export interface SocialEmbedContent extends BaseEmbedContent {
  type: 'social';
  network: string;
  url: string;
}

// Union type for all possible embed content
export type EmbedContent =
  | ImageEmbedContent
  | VideoEmbedContent
  | IFrameEmbedContent
  | SelfTextContent
  | RedditGalleryContent
  | HttpsErrorContent
  | SocialEmbedContent
  | null;

/**
 * Handler function contract for domain-specific embed renderers
 *
 * @param entry - Reddit post (LinkData) or comment (CommentData) to render
 * @returns Embed content (sync) or Promise<EmbedContent> (async)
 *
 * Handler Requirements:
 * - Return null if the URL pattern doesn't match your domain's expected format
 * - Throw errors for API failures (will be caught upstream with fallbacks)
 * - Support both sync and async implementations
 * - Don't set renderFunction - this is added automatically by tryDomainHandlers
 *
 * @example
 * ```typescript
 * // Synchronous handler
 * function youtubeHandler(entry: LinkData): IFrameEmbedContent | null {
 *   const videoId = extractVideoId(entry.url);
 *   if (!videoId) return null;
 *   return { type: 'iframe', src: `https://youtube.com/embed/${videoId}` };
 * }
 *
 * // Asynchronous handler
 * async function gfycatHandler(entry: LinkData): Promise<VideoEmbedContent | null> {
 *   const id = extractId(entry.url);
 *   const apiData = await fetch(`https://api.gfycat.com/${id}`);
 *   if (!apiData) return null;
 *   return { type: 'video', sources: [...] };
 * }
 * ```
 */
export type EmbedRenderFunction = (
  entry: LinkData | CommentData
) => EmbedContent | Promise<EmbedContent>;

// Embeds registry type
export type EmbedsRegistry = Record<string, EmbedRenderFunction>;

// Keys interface
export interface DomainKeys {
  domain: string;
  greedyDomain: string;
}

// Inline links result
export interface InlineLinksResult {
  renderedLinks: string[];
  inline: EmbedContent[];
}
