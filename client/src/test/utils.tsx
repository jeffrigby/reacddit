import type { ReactElement } from 'react';
import type { RenderOptions } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import type { RootState } from '@/types/redux';

// Default state for testing
const defaultTestState: RootState = {
  listingsFilter: {
    sort: 'hot',
    target: '',
    multi: false,
    userType: '',
    user: '',
    listType: 'r',
  },
  redditMe: {
    me: null,
  },
  siteSettings: {
    stream: false,
    debugMode: false,
    theme: 'auto',
    autoRefresh: false,
    view: 'expanded' as const,
  },
  listings: {},
  reddit: {},
  redditBearer: {},
  redditMultiReddits: {},
  subreddits: {},
  history: {},
};

// Create a test store with proper typing - follows RTK best practices
export const createTestStore = (preloadedState?: Partial<RootState>) => {
  // Create a simple reducer that just returns the preloaded state
  const testReducer = (state = { ...defaultTestState, ...preloadedState }) =>
    state;

  return configureStore({
    reducer: testReducer,
    preloadedState: {
      ...defaultTestState,
      ...preloadedState,
    } as RootState,
  });
};

export interface TestRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof createTestStore>;
  routerProps?: {
    initialEntries?: string[];
    initialIndex?: number;
  };
}

// Test render function following RTK testing patterns
export const renderWithProviders = (
  ui: ReactElement,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    routerProps = {},
    ...renderOptions
  }: TestRenderOptions = {}
) => {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter {...routerProps}>{children}</MemoryRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Common test utilities and mocks

/**
 * Mock React Router hooks for components that use routing
 */
export const createRouterMocks = () => {
  const mockNavigate = vi.fn();
  const mockUseLocation = vi.fn();

  return {
    mockNavigate,
    mockUseLocation,
    resetMocks: () => {
      mockNavigate.mockClear();
      mockUseLocation.mockClear();
    },
  };
};

/**
 * Mock window.scrollTo for components that trigger scrolling
 */
export const mockWindowScrollTo = () => {
  const mockScrollTo = vi.fn();
  Object.defineProperty(window, 'scrollTo', {
    value: mockScrollTo,
    writable: true,
  });
  return mockScrollTo;
};

/**
 * Mock keyboard events for testing hotkeys
 */
export const createKeyboardEvent = (
  key: string,
  eventInitDict?: KeyboardEventInit
) => {
  return new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...eventInitDict,
  });
};

/**
 * Mock DOM methods commonly used in components
 */
export const mockDOMMethods = () => {
  const mockScrollTo = vi.fn();
  const mockFocus = vi.fn();
  const mockBlur = vi.fn();
  const mockSelect = vi.fn();
  const mockAddClass = vi.fn();
  const mockRemoveClass = vi.fn();
  const mockSetAttribute = vi.fn();

  Object.defineProperty(window, 'scrollTo', {
    value: mockScrollTo,
    writable: true,
  });
  vi.spyOn(HTMLInputElement.prototype, 'focus').mockImplementation(mockFocus);
  vi.spyOn(HTMLInputElement.prototype, 'blur').mockImplementation(mockBlur);
  vi.spyOn(HTMLInputElement.prototype, 'select').mockImplementation(mockSelect);
  vi.spyOn(document.body.classList, 'add').mockImplementation(mockAddClass);
  vi.spyOn(document.body.classList, 'remove').mockImplementation(
    mockRemoveClass
  );
  vi.spyOn(document.documentElement, 'setAttribute').mockImplementation(
    mockSetAttribute
  );

  return {
    mockScrollTo,
    mockFocus,
    mockBlur,
    mockSelect,
    mockAddClass,
    mockRemoveClass,
    mockSetAttribute,
    resetMocks: () => {
      mockScrollTo.mockClear();
      mockFocus.mockClear();
      mockBlur.mockClear();
      mockSelect.mockClear();
      mockAddClass.mockClear();
      mockRemoveClass.mockClear();
      mockSetAttribute.mockClear();
    },
  };
};

/**
 * Mock Redux slice actions for component testing
 */
export const createReduxActionMocks = () => {
  const mockSiteSettings = vi.fn();
  const mockListingsAction = vi.fn();
  const mockRedditAction = vi.fn();

  return {
    mockSiteSettings,
    mockListingsAction,
    mockRedditAction,
    resetMocks: () => {
      mockSiteSettings.mockClear();
      mockListingsAction.mockClear();
      mockRedditAction.mockClear();
    },
  };
};

/**
 * Mock common external libraries
 */
export const createCommonLibraryMocks = () => {
  const mockHotkeyStatus = vi.fn();
  const mockQueryStringParse = vi.fn();
  const mockQueryStringStringify = vi.fn();

  return {
    mockHotkeyStatus,
    mockQueryStringParse,
    mockQueryStringStringify,
    resetMocks: () => {
      mockHotkeyStatus.mockClear();
      mockQueryStringParse.mockClear();
      mockQueryStringStringify.mockClear();
    },
  };
};

/**
 * Helper to create checkbox component test renderer with common patterns
 */
export const createCheckboxComponentRenderer = <
  T extends Record<string, unknown>,
>(
  Component: React.ComponentType<T>,
  stateKey: string,
  defaultProps: T = {} as T
) => {
  return (
    stateValue: boolean = false,
    overrides: Partial<RootState> = {},
    componentProps: Partial<T> = {}
  ) => {
    const preloadedState: Partial<RootState> = {
      siteSettings: {
        [stateKey]: stateValue,
        view: 'expanded',
        stream: false,
        debugMode: false,
        theme: 'auto',
        autoRefresh: false,
      },
      ...overrides,
    };
    return renderWithProviders(
      <Component {...defaultProps} {...componentProps} />,
      { preloadedState }
    );
  };
};

/**
 * Helper to get button elements by common patterns
 */
export const getButtonByLabel = (name: string | RegExp) => {
  return screen.getByRole('button', { name });
};

/**
 * Helper to check if element has multiple classes
 */
export const expectToHaveClasses = (element: Element, ...classes: string[]) => {
  classes.forEach((className) => {
    expect(element).toHaveClass(className);
  });
};

/**
 * Helper to create keyboard events with default properties
 */
export const createHotkeyEvent = (
  key: string,
  options: KeyboardEventInit = {}
) => {
  return createKeyboardEvent(key, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
};

/**
 * Helper to simulate rapid user interactions for testing
 */
export const simulateRapidClicks = async (element: Element, count: number) => {
  const user = userEvent.setup();
  for (let i = 0; i < count; i++) {
    await user.click(element);
  }
};

// Re-export everything for convenience
export * from '@testing-library/react';
// Keep the old render name for backward compatibility but prefer renderWithProviders
export { renderWithProviders as render };
