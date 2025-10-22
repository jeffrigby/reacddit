/**
 * Global type declarations for Reacddit
 */

/// <reference types="vite/client" />

declare const BUILDTIME: string;

// Vite environment variables
interface ImportMetaEnv {
  readonly VITE_API_PATH: string;
  readonly VITE_PUBLIC_URL: string;
  readonly VITE_BUILDTIME: string;
  readonly MODE: 'development' | 'production';
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

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
