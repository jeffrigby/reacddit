import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBookmark,
  faComments,
  faEyeSlash,
  faFile,
  faStar,
  faThumbsDown,
  faThumbsUp,
  faUser,
} from '@fortawesome/free-regular-svg-icons';
import type { USER_TARGETS } from '@/utils/navigationState';

export interface AccountLink {
  /** Segment after /user/<name>/ */
  target: (typeof USER_TARGETS)[number];
  text: string;
  title: string;
  icon: IconDefinition;
  /** Key that follows g to open the page, if any */
  hotkey?: string;
}

/** The signed-in user's own pages, in menu order. */
export const ACCOUNT_LINKS: readonly AccountLink[] = [
  {
    target: 'overview',
    text: 'Overview',
    title: 'Show My Posts and Comments',
    icon: faUser,
    hotkey: 'v',
  },
  {
    target: 'posts',
    text: 'Posts',
    title: 'Show My Submitted Posts',
    icon: faFile,
    hotkey: 'b',
  },
  {
    target: 'comments',
    text: 'Comments',
    title: 'Show My Comments',
    icon: faComments,
    hotkey: 'c',
  },
  {
    target: 'upvoted',
    text: 'Upvoted',
    title: 'Show My Upvoted Posts',
    icon: faThumbsUp,
    hotkey: 'u',
  },
  {
    target: 'downvoted',
    text: 'Downvoted',
    title: 'Show My Downvoted Posts',
    icon: faThumbsDown,
    hotkey: 'd',
  },
  {
    target: 'saved',
    text: 'Saved',
    title: 'Show My Saved Posts',
    icon: faBookmark,
    hotkey: 's',
  },
  {
    target: 'hidden',
    text: 'Hidden',
    title: 'Show My Hidden Posts',
    icon: faEyeSlash,
  },
  {
    target: 'gilded',
    text: 'Gilded',
    title: 'Show My Gilded Posts and Comments',
    icon: faStar,
  },
];
