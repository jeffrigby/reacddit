import { createContext, useContext } from 'react';
import type { Context } from 'react';
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

export const PostsContextData: Context<PostContextData | null> =
  createContext<PostContextData | null>(null);
export const PostsContextActionable: Context<boolean | null> = createContext<
  boolean | null
>(null);

export function usePostContext(): PostContextData {
  const context = useContext(PostsContextData);
  if (!context) {
    throw new Error(
      'usePostContext must be used within a PostsContextData provider'
    );
  }
  return context;
}
