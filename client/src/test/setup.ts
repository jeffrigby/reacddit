// Add DOM matchers for better testing
import { expect, vi } from 'vitest';
// Import global mocks
import './globalMocks.tsx';

declare module 'vitest' {
  interface Assertion<T = any> {
    toBeInTheDocument(): T;
    toHaveAttribute(attr: string, value?: string): T;
    toHaveTextContent(text: string | RegExp): T;
    toHaveClass(...classes: string[]): T;
    toBeChecked(): T;
    toBeDisabled(): T;
    toHaveValue(value: string | number): T;
    toContainElement(element: Element | null): T;
  }
}

// Add basic DOM matchers
expect.extend({
  toBeInTheDocument(received: Element | null) {
    const pass = received !== null && document.body.contains(received);
    return {
      pass,
      message: () =>
        `expected element${pass ? ' not' : ''} to be in the document`,
    };
  },
  toHaveAttribute(received: Element | null, attr: string, value?: string) {
    if (!received) {
      return {
        pass: false,
        message: () =>
          'expected element to have attribute but element was null',
      };
    }
    const hasAttr = received.hasAttribute(attr);
    if (value === undefined) {
      return {
        pass: hasAttr,
        message: () =>
          `expected element${hasAttr ? ' not' : ''} to have attribute "${attr}"`,
      };
    }
    const attrValue = received.getAttribute(attr);
    const pass = hasAttr && attrValue === value;
    return {
      pass,
      message: () =>
        `expected element to have attribute "${attr}" with value "${value}" but got "${attrValue}"`,
    };
  },
  toHaveTextContent(received: Element | null, text: string | RegExp) {
    if (!received) {
      return {
        pass: false,
        message: () =>
          'expected element to have text content but element was null',
      };
    }
    const textContent = received.textContent ?? '';
    const pass =
      typeof text === 'string'
        ? textContent.includes(text)
        : text.test(textContent);
    return {
      pass,
      message: () =>
        `expected element${pass ? ' not' : ''} to have text content "${text}" but got "${textContent}"`,
    };
  },
  toHaveClass(received: Element | null, ...classes: string[]) {
    if (!received) {
      return {
        pass: false,
        message: () => 'expected element to have classes but element was null',
      };
    }
    const classList = Array.from(received.classList);
    const missingClasses = classes.filter((cls) => !classList.includes(cls));
    const pass = missingClasses.length === 0;
    return {
      pass,
      message: () =>
        pass
          ? `expected element not to have classes ${classes.join(', ')}`
          : `expected element to have classes ${classes.join(', ')} but missing ${missingClasses.join(', ')}`,
    };
  },
  toBeChecked(received: Element | null) {
    if (!received) {
      return {
        pass: false,
        message: () => 'expected element to be checked but element was null',
      };
    }
    const pass = (received as HTMLInputElement).checked === true;
    return {
      pass,
      message: () => `expected element${pass ? ' not' : ''} to be checked`,
    };
  },
  toBeDisabled(received: Element | null) {
    if (!received) {
      return {
        pass: false,
        message: () => 'expected element to be disabled but element was null',
      };
    }
    const pass = (received as HTMLInputElement).disabled === true;
    return {
      pass,
      message: () => `expected element${pass ? ' not' : ''} to be disabled`,
    };
  },
  toHaveValue(received: Element | null, value: string | number) {
    if (!received) {
      return {
        pass: false,
        message: () => 'expected element to have value but element was null',
      };
    }
    const actualValue = (received as HTMLInputElement).value;
    const pass = actualValue === String(value);
    return {
      pass,
      message: () =>
        `expected element to have value "${value}" but got "${actualValue}"`,
    };
  },
  toContainElement(received: Element | null, element: Element | null) {
    if (!received) {
      return {
        pass: false,
        message: () =>
          'expected element to contain another element but element was null',
      };
    }
    if (!element) {
      return {
        pass: false,
        message: () =>
          'expected element to contain another element but target element was null',
      };
    }
    const pass = received.contains(element);
    return {
      pass,
      message: () =>
        `expected element${pass ? ' not' : ''} to contain the target element`,
    };
  },
});

// Mock window.matchMedia which is not available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver which is not available in jsdom
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver which is not available in jsdom
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Bootstrap's data-bs-toggle functionality
Object.defineProperty(global, 'bootstrap', {
  value: {
    Dropdown: vi.fn().mockImplementation(() => ({
      toggle: vi.fn(),
      show: vi.fn(),
      hide: vi.fn(),
      dispose: vi.fn(),
    })),
  },
  writable: true,
});
