// Barrel export for all contexts - allows clean imports like:
// import { useModals, PostsContextData, IntersectionObserverProvider } from '@/contexts';

// Modal Context
export { ModalProvider, useModals } from './ModalContext';

// Post Contexts
export {
  PostsContextData,
  PostsContextActionable,
  PostsContextVisible,
  PostsContextStatus,
  PostsContextContent,
  type PostContextData,
} from './PostContext';

// Listings Context
export { ListingsContextLastExpanded } from './ListingsContext';

// IntersectionObserver Context
export {
  IntersectionObserverProvider,
  useIntersectionObservers,
  IntersectionObserverContext,
} from './IntersectionObserverContext';
