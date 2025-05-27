import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type {
  TokenData,
  MeResponse,
  FavoriteResponse,
  AccountData,
  UserPreferences,
} from '@/types/redditApi';
// Create mocks using vi.hoisted for proper hoisting
const mocks = vi.hoisted(() => ({
  axiosGet: vi.fn(),
  axiosInstanceGet: vi.fn(),
  axiosInstancePost: vi.fn(),
  cookiesGet: vi.fn(),
  queryStringify: vi.fn(),
}));

// Mock axios module with proper TypeScript support
vi.mock('axios', async (importActual) => {
  const actual = await importActual<typeof import('axios')>();

  const mockAxiosInstance = {
    get: mocks.axiosInstanceGet,
    post: mocks.axiosInstancePost,
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
  };

  return {
    default: {
      ...actual.default,
      create: vi.fn(() => mockAxiosInstance),
      get: mocks.axiosGet,
    },
  };
});

// Mock other dependencies
vi.mock('js-cookie', () => ({
  default: {
    get: mocks.cookiesGet,
  },
}));

vi.mock('query-string', () => ({
  default: {
    stringify: mocks.queryStringify,
  },
}));

// Import after mocking
import {
  setParams,
  getTokenStorage,
  getToken,
  getLoginUrl,
  me,
  favorite,
} from './redditApiTs';

// Mock data
const mockTokenData: TokenData = {
  accessToken: 'mock-access-token-123',
  expires: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
  loginURL: 'https://reddit.com/api/v1/authorize?client_id=123',
};

const mockAccountData: AccountData = {
  id: 'test123',
  name: 'testuser',
  is_employee: false,
  is_mod: false,
  is_gold: true,
  created: 1234567890,
  created_utc: 1234567890,
  link_karma: 1000,
  comment_karma: 5000,
  total_karma: 6000,
  verified: true,
  icon_img: 'https://example.com/icon.png',
  has_verified_email: true,
  pref_nightmode: false,
};

const mockUserPreferences: Partial<UserPreferences> = {
  nightmode: false,
  lang: 'en',
  over_18: false,
};

const mockMeResponse: MeResponse = {
  kind: 't2_test123',
  data: {
    ...mockAccountData,
    ...mockUserPreferences,
  },
};

const mockFavoriteResponse: FavoriteResponse = {};

describe('redditApiTs', () => {
  // Store original environment variable
  const originalApiPath = process.env.API_PATH;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset Date.now mock
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));

    // Set up environment
    process.env.API_PATH = 'http://localhost:3001';

    // Default localStorage/sessionStorage mocks
    Object.defineProperty(window, 'localStorage', {
      value: {
        clear: vi.fn(),
      },
      writable: true,
    });

    Object.defineProperty(window, 'sessionStorage', {
      value: {
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env.API_PATH = originalApiPath;
  });

  describe('setParams', () => {
    it('merges defaults with options', () => {
      const defaults = { a: 1, b: 2 };
      const options = { b: 3, c: 4 };

      const result = setParams(defaults, options);

      expect(result).toEqual({ a: 1, b: 3, c: 4 });
    });

    it('filters out null, undefined, and empty string values', () => {
      const params = {
        valid: 'value',
        nullValue: null,
        undefinedValue: undefined,
        emptyString: '',
        zero: 0,
        false: false,
      };

      const result = setParams(params);

      expect(result).toEqual({
        valid: 'value',
        zero: 0,
        false: false,
      });
    });

    it('handles empty defaults and options', () => {
      expect(setParams({})).toEqual({});
      expect(setParams({}, {})).toEqual({});
    });
  });

  describe('getTokenStorage', () => {
    it('returns null when no token cookie exists', () => {
      mocks.cookiesGet.mockReturnValue(undefined);

      const result = getTokenStorage();

      expect(result).toEqual({
        token: null,
        cookieTokenParsed: {},
      });
    });

    it('returns valid token when not expired', () => {
      const tokenString = JSON.stringify(mockTokenData);
      mocks.cookiesGet.mockReturnValue(tokenString);

      const result = getTokenStorage();

      expect(result).toEqual({
        token: mockTokenData.accessToken,
        cookieTokenParsed: mockTokenData,
      });
    });

    it('returns expired when token is past expiration', () => {
      const expiredTokenData: TokenData = {
        ...mockTokenData,
        expires: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };
      const tokenString = JSON.stringify(expiredTokenData);
      mocks.cookiesGet.mockReturnValue(tokenString);

      const result = getTokenStorage();

      expect(result).toEqual({
        token: 'expired',
        cookieTokenParsed: expiredTokenData,
      });
    });

    it('handles invalid JSON in cookie', () => {
      mocks.cookiesGet.mockReturnValue('invalid-json');

      const result = getTokenStorage();

      expect(result).toEqual({
        token: null,
        cookieTokenParsed: {},
      });
    });

    it('handles invalid token data structure', () => {
      const invalidToken = { notValidToken: true };
      const tokenString = JSON.stringify(invalidToken);
      mocks.cookiesGet.mockReturnValue(tokenString);

      const result = getTokenStorage();

      expect(result).toEqual({
        token: null,
        cookieTokenParsed: {},
      });
    });

    it('handles token without required fields', () => {
      const incompleteToken = { accessToken: 'token' }; // missing expires
      const tokenString = JSON.stringify(incompleteToken);
      mocks.cookiesGet.mockReturnValue(tokenString);

      const result = getTokenStorage();

      expect(result).toEqual({
        token: null,
        cookieTokenParsed: {},
      });
    });
  });

  describe('getToken', () => {
    it('returns stored token when valid and not expired', async () => {
      const tokenString = JSON.stringify(mockTokenData);
      mocks.cookiesGet.mockReturnValue(tokenString);

      const result = await getToken();

      expect(result).toEqual({
        token: mockTokenData.accessToken,
        cookieTokenParsed: mockTokenData,
      });
      expect(mocks.axiosGet).not.toHaveBeenCalled();
    });

    it('fetches new token when stored token is expired', async () => {
      const expiredTokenData: TokenData = {
        ...mockTokenData,
        expires: Math.floor(Date.now() / 1000) - 3600,
      };
      const tokenString = JSON.stringify(expiredTokenData);
      mocks.cookiesGet.mockReturnValue(tokenString);

      const mockResponse = {
        data: { accessToken: 'new-token-456' },
      };
      mocks.axiosGet.mockResolvedValue(mockResponse);

      const result = await getToken();

      expect(mocks.axiosGet).toHaveBeenCalledWith(
        'http://localhost:3001/bearer'
      );
      expect(result).toEqual({
        token: 'new-token-456',
        cookieTokenParsed: expiredTokenData,
      });
    });

    it('fetches new token when reset is true', async () => {
      const tokenString = JSON.stringify(mockTokenData);
      mocks.cookiesGet.mockReturnValue(tokenString);

      const mockResponse = {
        data: { accessToken: 'reset-token-789' },
      };
      mocks.axiosGet.mockResolvedValue(mockResponse);

      const result = await getToken(true);

      expect(mocks.axiosGet).toHaveBeenCalledWith(
        'http://localhost:3001/bearer'
      );
      expect(result).toEqual({
        token: 'reset-token-789',
        cookieTokenParsed: mockTokenData,
      });
    });

    it('fetches new token when no stored token exists', async () => {
      mocks.cookiesGet.mockReturnValue(undefined);

      const mockResponse = {
        data: { accessToken: 'fresh-token-000' },
      };
      mocks.axiosGet.mockResolvedValue(mockResponse);

      const result = await getToken();

      expect(mocks.axiosGet).toHaveBeenCalledWith(
        'http://localhost:3001/bearer'
      );
      expect(result).toEqual({
        token: 'fresh-token-000',
        cookieTokenParsed: {},
      });
    });

    it('clears storage and returns null on fetch failure', async () => {
      mocks.cookiesGet.mockReturnValue(undefined);
      mocks.axiosGet.mockRejectedValue(new Error('Network error'));

      const result = await getToken();

      expect(localStorage.clear).toHaveBeenCalled();
      expect(sessionStorage.clear).toHaveBeenCalled();
      expect(result).toEqual({
        token: null,
        cookieTokenParsed: {},
      });
    });
  });

  describe('getLoginUrl', () => {
    it('returns login URL from valid token cookie', () => {
      const tokenString = JSON.stringify(mockTokenData);
      mocks.cookiesGet.mockReturnValue(tokenString);

      const result = getLoginUrl();

      expect(result).toBe(mockTokenData.loginURL);
    });

    it('throws error when no token cookie exists', () => {
      mocks.cookiesGet.mockReturnValue(undefined);

      expect(() => getLoginUrl()).toThrow('No token cookie found');
    });

    it('throws error when token is invalid JSON', () => {
      mocks.cookiesGet.mockReturnValue('invalid-json');

      expect(() => getLoginUrl()).toThrow(); // Just check that it throws
    });

    it('throws error when token data is invalid', () => {
      const invalidToken = { notValidToken: true };
      const tokenString = JSON.stringify(invalidToken);
      mocks.cookiesGet.mockReturnValue(tokenString);

      expect(() => getLoginUrl()).toThrow('No loginURL found in token');
    });

    it('throws error when loginURL is missing from valid token', () => {
      const tokenWithoutLoginURL: TokenData = {
        accessToken: 'token',
        expires: Date.now() + 3600,
        // no loginURL
      };
      const tokenString = JSON.stringify(tokenWithoutLoginURL);
      mocks.cookiesGet.mockReturnValue(tokenString);

      expect(() => getLoginUrl()).toThrow('No loginURL found in token');
    });
  });

  // Note: redditAPI initialization is tested implicitly through the me() and favorite() functions

  describe('me', () => {
    it('fetches user account information with cache buster', async () => {
      mocks.axiosInstanceGet.mockResolvedValue({ data: mockMeResponse });

      const result = await me();

      expect(mocks.axiosInstanceGet).toHaveBeenCalledWith(
        `/api/v1/me?cb=${Date.now()}`
      );
      expect(result).toEqual(mockMeResponse);
    });

    it('includes proper cache buster parameter', async () => {
      const fixedTime = 1234567890000;
      vi.setSystemTime(fixedTime);

      mocks.axiosInstanceGet.mockResolvedValue({ data: mockMeResponse });

      await me();

      expect(mocks.axiosInstanceGet).toHaveBeenCalledWith(
        `/api/v1/me?cb=${fixedTime}`
      );
    });

    it('propagates API errors', async () => {
      const apiError = new Error('Reddit API Error');
      mocks.axiosInstanceGet.mockRejectedValue(apiError);

      await expect(me()).rejects.toThrow('Reddit API Error');
    });
  });

  describe('favorite', () => {
    beforeEach(() => {
      mocks.queryStringify.mockImplementation((obj) =>
        Object.entries(obj)
          .map(([k, v]) => `${k}=${v}`)
          .join('&')
      );
    });

    it('favorites a subreddit successfully', async () => {
      const mockResponse = {
        status: 200,
        data: mockFavoriteResponse,
      };
      mocks.axiosInstancePost.mockResolvedValue(mockResponse);

      const result = await favorite(true, 'reactjs');

      expect(mocks.queryStringify).toHaveBeenCalledWith({
        make_favorite: 'true',
        sr_name: 'reactjs',
      });

      expect(mocks.axiosInstancePost).toHaveBeenCalledWith(
        '/api/favorite',
        'make_favorite=true&sr_name=reactjs',
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      expect(result).toEqual(mockFavoriteResponse);
    });

    it('unfavorites a subreddit successfully', async () => {
      const mockResponse = {
        status: 200,
        data: mockFavoriteResponse,
      };
      mocks.axiosInstancePost.mockResolvedValue(mockResponse);

      const result = await favorite(false, 'javascript');

      expect(mocks.queryStringify).toHaveBeenCalledWith({
        make_favorite: 'false',
        sr_name: 'javascript',
      });

      expect(mocks.axiosInstancePost).toHaveBeenCalledWith(
        '/api/favorite',
        'make_favorite=false&sr_name=javascript',
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );

      expect(result).toEqual(mockFavoriteResponse);
    });

    it('throws error when response status is not 200 for favoriting', async () => {
      const mockResponse = {
        status: 500,
        data: { error: 'Internal server error' },
      };
      mocks.axiosInstancePost.mockResolvedValue(mockResponse);

      await expect(favorite(true, 'testsubreddit')).rejects.toThrow(
        'Failed to favorite subreddit: testsubreddit'
      );
    });

    it('throws error when response status is not 200 for unfavoriting', async () => {
      const mockResponse = {
        status: 404,
        data: { error: 'Not found' },
      };
      mocks.axiosInstancePost.mockResolvedValue(mockResponse);

      await expect(favorite(false, 'nonexistent')).rejects.toThrow(
        'Failed to unfavorite subreddit: nonexistent'
      );
    });

    it('propagates network errors', async () => {
      const networkError = new Error('Network failure');
      mocks.axiosInstancePost.mockRejectedValue(networkError);

      await expect(favorite(true, 'subreddit')).rejects.toThrow(
        'Network failure'
      );
    });

    it('handles boolean to string conversion correctly', async () => {
      const mockResponse = {
        status: 200,
        data: mockFavoriteResponse,
      };
      mocks.axiosInstancePost.mockResolvedValue(mockResponse);

      await favorite(true, 'test');

      expect(mocks.queryStringify).toHaveBeenCalledWith({
        make_favorite: 'true',
        sr_name: 'test',
      });

      await favorite(false, 'test');

      expect(mocks.queryStringify).toHaveBeenCalledWith({
        make_favorite: 'false',
        sr_name: 'test',
      });
    });

    it('sends correct content type header', async () => {
      const mockResponse = {
        status: 200,
        data: mockFavoriteResponse,
      };
      mocks.axiosInstancePost.mockResolvedValue(mockResponse);

      await favorite(true, 'test');

      const [, , config] = mocks.axiosInstancePost.mock.calls[0];
      expect(config?.headers).toEqual({
        'Content-Type': 'application/x-www-form-urlencoded',
      });
    });
  });

  describe('Integration Tests', () => {
    it('handles complete token lifecycle', async () => {
      // Start with no token
      mocks.cookiesGet.mockReturnValue(undefined);

      // First call should fetch token
      const mockTokenResponse = {
        data: { accessToken: 'fresh-token' },
      };
      mocks.axiosGet.mockResolvedValue(mockTokenResponse);

      const tokenResult = await getToken();
      expect(tokenResult.token).toBe('fresh-token');

      // Subsequent calls should use stored token
      const validTokenData: TokenData = {
        accessToken: 'fresh-token',
        expires: Math.floor(Date.now() / 1000) + 3600,
        loginURL: 'https://reddit.com/auth',
      };
      mocks.cookiesGet.mockReturnValue(JSON.stringify(validTokenData));

      const cachedResult = await getToken();
      expect(cachedResult.token).toBe('fresh-token');
      expect(mocks.axiosGet).toHaveBeenCalledTimes(1); // Only called once
    });

    it('handles API operations with authentication', async () => {
      // Set up valid token
      const tokenString = JSON.stringify(mockTokenData);
      mocks.cookiesGet.mockReturnValue(tokenString);

      // Mock API responses
      mocks.axiosInstanceGet.mockResolvedValue({ data: mockMeResponse });
      mocks.axiosInstancePost.mockResolvedValue({
        status: 200,
        data: mockFavoriteResponse,
      });

      // Test me() function
      const meResult = await me();
      expect(meResult).toEqual(mockMeResponse);

      // Test favorite() function
      const favoriteResult = await favorite(true, 'programming');
      expect(favoriteResult).toEqual(mockFavoriteResponse);
    });
  });
});
