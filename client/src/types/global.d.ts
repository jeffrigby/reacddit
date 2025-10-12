/**
 * Global type declarations for Reacddit
 */

declare const BUILDTIME: string;

// Extend Window interface with custom properties
interface Window {
  __REDUX_DEVTOOLS_EXTENSION__?: () => unknown;
}

// Bootstrap global declaration
// Note: Modal has been migrated to React-Bootstrap (Phase 2.1)
declare const bootstrap: {
  Dropdown: new (element: Element | null) => {
    show: () => void;
    hide: () => void;
    toggle: () => void;
    dispose: () => void;
  };
  Collapse: new (element: Element | null) => {
    show: () => void;
    hide: () => void;
    toggle: () => void;
    dispose: () => void;
  };
  Tooltip: new (element: Element | null) => {
    show: () => void;
    hide: () => void;
    toggle: () => void;
    dispose: () => void;
  };
};

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
