import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import cookies from 'js-cookie';
import {
  type MeResponse,
  type TokenData,
  type TokenApiResponse,
  type TokenStorageResult,
} from '@/types/redditApi';

// Utility function to clean null/empty values from params
export function setParams(
  defaults: Record<string, unknown>,
  options: Record<string, unknown> = {}
): Record<string, unknown> {
  const params = { ...defaults, ...options };

  // Remove null, undefined, or empty string values
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== null && value !== undefined && value !== ''
    )
  );
}

// Type guard to check if parsed token is valid TokenData
function isTokenData(data: unknown): data is TokenData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'accessToken' in data &&
    'expires' in data &&
    typeof (data as TokenData).accessToken === 'string' &&
    typeof (data as TokenData).expires === 'number'
  );
}

/**
 * Get the token out of storage if it's not expired
 */
export function getTokenStorage(): TokenStorageResult {
  const cookieToken = cookies.get('token');

  if (!cookieToken) {
    return { token: null, cookieTokenParsed: {} };
  }

  try {
    const parsedToken = JSON.parse(cookieToken);

    if (!isTokenData(parsedToken)) {
      return { token: null, cookieTokenParsed: {} };
    }

    const { expires, accessToken } = parsedToken;
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const token = expires >= currentTimestamp ? accessToken : 'expired';

    return { token, cookieTokenParsed: parsedToken };
  } catch {
    // If parsing fails, treat as no token
    return { token: null, cookieTokenParsed: {} };
  }
}

/**
 * Get the token from cookie if possible, if not get it from the server.
 * @param reset - Always get it from the server.
 */
export async function getToken(reset = false): Promise<TokenApiResponse> {
  const { token: storageToken, cookieTokenParsed } = getTokenStorage();

  // Check if we need to fetch a new token
  if (storageToken === 'expired' || reset || storageToken === null) {
    try {
      const response = await axios.get(`${process.env.API_PATH}/bearer`);
      return {
        token: response.data.accessToken,
        cookieTokenParsed,
      };
    } catch {
      // Clear storage on token fetch failure
      localStorage.clear();
      sessionStorage.clear();
      return { token: null, cookieTokenParsed };
    }
  }

  return { token: storageToken, cookieTokenParsed };
}

/**
 * Helper function to grab the loginURL from the cookie
 */
export function getLoginUrl(): string {
  const cookieToken = cookies.get('token');

  if (!cookieToken) {
    throw new Error('No token cookie found');
  }

  try {
    const tokenData = JSON.parse(cookieToken);

    if (!isTokenData(tokenData) || !tokenData.loginURL) {
      throw new Error('No loginURL found in token');
    }

    return tokenData.loginURL;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse token cookie');
  }
}

// Create axios instance with interceptor
export const redditAPI: AxiosInstance = axios.create({
  baseURL: 'https://oauth.reddit.com',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

// Add request interceptor for authentication
redditAPI.interceptors.request.use(
  async (
    config: InternalAxiosRequestConfig
  ): Promise<InternalAxiosRequestConfig> => {
    const newConfig = config;
    const { token } = await getToken(false);

    if (token != null) {
      newConfig.headers.Authorization = `Bearer ${token}`;
    } else {
      throw new Error('No valid token found');
    }

    return newConfig;
  },
  (error: unknown) => Promise.reject(error)
);

/**
 * Get the logged-in user's account information.
 * Includes a cache buster to prevent Firefox caching.
 */
export async function me(): Promise<MeResponse> {
  // Cache buster is to prevent Firefox from caching this request
  const response = await redditAPI.get(`/api/v1/me?cb=${Date.now()}`);
  return response.data;
}
