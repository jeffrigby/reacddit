import { vi } from 'vitest';
import React from 'react';

/**
 * Global mocks for commonly mocked modules across the test suite.
 * Import these mocks in your test files with: import '@/test/globalMocks';
 */

// Mock React Router hooks
export const mockNavigate = vi.fn();
export const mockUseLocation = vi.fn(() => ({
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'default',
}));

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

// Mock React Router DOM components
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    NavLink: ({
      children,
      to,
      className,
    }: {
      children: React.ReactNode;
      to: string | { pathname: string; search: string };
      className?: string;
    }) => {
      const href = typeof to === 'string' ? to : to.pathname + to.search;
      return (
        <a className={className} href={href}>
          {children}
        </a>
      );
    },
    useLocation: () => mockUseLocation(),
  };
});

// Mock react-device-detect
export const mockDeviceDetect = {
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  isBrowser: true,
};

vi.mock('react-device-detect', () => mockDeviceDetect);

// Mock date-fns
export const mockFormatDistanceToNow = vi.fn((date: number | Date) => {
    const now = Date.now();
    const then = typeof date === 'number' ? date : date.getTime();
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) {
      return 'less than a minute';
    }
    if (seconds < 3600) {
      return `${Math.floor(seconds / 60)} minutes`;
    }
    if (seconds < 86400) {
      return `${Math.floor(seconds / 3600)} hours`;
    }
    return `${Math.floor(seconds / 86400)} days`;
});

export const mockDateFnsFormat = vi.fn((date: Date | number, formatStr: string) => {
    // Simple mock implementation
    const d = new Date(date);
    return d.toISOString();
});

export const mockDateFnsParseISO = vi.fn((dateString: string) => new Date(dateString));
export const mockDateFnsIsValid = vi.fn((date: any) => date instanceof Date && !isNaN(date.getTime()));

vi.mock('date-fns', () => ({
  formatDistanceToNow: mockFormatDistanceToNow,
  format: mockDateFnsFormat,
  parseISO: mockDateFnsParseISO,
  isValid: mockDateFnsIsValid,
}));

// Mock query-string
export const mockQueryString = {
  parse: vi.fn(() => ({})),
  stringify: vi.fn((obj: Record<string, any>) => {
    return Object.entries(obj)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
  }),
};

vi.mock('query-string', () => ({
  default: mockQueryString,
  ...mockQueryString,
}));

// Mock common module
export const mockHotkeyStatus = vi.fn(() => true);

vi.mock('@/common', () => ({
  hotkeyStatus: mockHotkeyStatus,
}));

// Mock Redux actions (for legacy components)
export const mockListingsFetchRedditNew = vi.fn();
export const mockSubredditsFetchNewSubredditInfo = vi.fn();

vi.mock('@/redux/actions/listings', () => ({
  listingsFetchRedditNew: () => mockListingsFetchRedditNew,
}));

vi.mock('@/redux/actions/subreddits', () => ({
  subredditsFilter: vi.fn((filter) => ({
    type: 'SUBREDDITS_FILTER',
    filter,
  })),
  subredditsFetchNewSubredditInfo: () => mockSubredditsFetchNewSubredditInfo,
}));

// Mock Redux slice actions
export const mockSiteSettings = vi.fn((payload) => ({
  type: 'siteSettings/setSiteSettings',
  payload,
}));

vi.mock('@/redux/slices/siteSettingsSlice', () => ({
  siteSettings: mockSiteSettings,
}));

// Reset all mocks utility
export const resetAllGlobalMocks = () => {
  mockNavigate.mockClear();
  mockUseLocation.mockClear();
  mockHotkeyStatus.mockClear();
  mockQueryString.parse.mockClear();
  mockQueryString.stringify.mockClear();
  mockSiteSettings.mockClear();
  mockListingsFetchRedditNew.mockClear();
  mockSubredditsFetchNewSubredditInfo.mockClear();
  mockFormatDistanceToNow.mockClear();

  // Reset device detect to defaults
  mockDeviceDetect.isMobile = false;
  mockDeviceDetect.isTablet = false;
  mockDeviceDetect.isDesktop = true;
  mockDeviceDetect.isBrowser = true;

  // Reset default mock implementations
  mockHotkeyStatus.mockReturnValue(true);
  mockQueryString.parse.mockReturnValue({});
  mockUseLocation.mockReturnValue({
    pathname: '/',
    search: '',
    hash: '',
    state: null,
    key: 'default',
  });
};

// Auto-reset mocks before each test
if (typeof beforeEach !== 'undefined') {
  beforeEach(() => {
    resetAllGlobalMocks();
  });
}
