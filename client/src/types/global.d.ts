/**
 * Global type declarations for Reacddit
 */

declare const BUILDTIME: string;

// Extend Window interface with custom properties
interface Window {
  __REDUX_DEVTOOLS_EXTENSION__?: () => unknown;
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
