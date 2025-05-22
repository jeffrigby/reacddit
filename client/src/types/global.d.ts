/**
 * Global type declarations for Reacddit
 */

declare const BUILDTIME: string;

// Extend Window interface with custom properties
interface Window {
  __REDUX_DEVTOOLS_EXTENSION__?: any;
}

// Reddit API types - these are simplified versions to get started
interface RedditPost {
  id: string;
  name: string;
  title: string;
  author: string;
  created_utc: number;
  permalink: string;
  url: string;
  subreddit: string;
  score: number;
  num_comments: number;
  [key: string]: any;
}

interface RedditComment {
  id: string;
  author: string;
  body: string;
  created_utc: number;
  score: number;
  replies?: {
    data?: {
      children?: Array<{
        data: RedditComment;
      }>;
    };
  };
  [key: string]: any;
}

interface RedditSubreddit {
  id: string;
  display_name: string;
  url: string;
  description: string;
  subscribers: number;
  [key: string]: any;
}

// Allow importing of various asset types
declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.scss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}
