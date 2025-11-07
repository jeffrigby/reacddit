import { createContext } from 'react';
import type { LinkData, CommentData } from '@/types/redditApi';

export interface PostContextData {
  post: {
    data: LinkData | CommentData;
    kind: string;
  };
  isLoaded: boolean;
  actionable: boolean;
  idx: number;
  fullyOffScreen: boolean;
}

export const PostsContextData = createContext<PostContextData | object>({});
export const PostsContextActionable = createContext<boolean | object>({});
export const PostsContextVisible = createContext<boolean | object>({});
export const PostsContextStatus = createContext<string | object>({});
export const PostsContextContent = createContext<PostContextData | object>({});
