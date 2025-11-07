import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import cookies from 'js-cookie';
import queryString from 'query-string';
import {
  type MeResponse,
  type TokenData,
  type TokenApiResponse,
  type TokenStorageResult,
  type SearchSubredditsResponse,
  type SearchSubredditsPostBody,
  type SubredditAboutResponse,
  type SubredditRulesResponse,
  type SubredditTrafficResponse,
  type SubredditSettingsResponse,
  type SearchParams,
  type SearchResponseWithUrl,
  type SubredditListingsParams,
  type ListingResponseWithUrl,
  type LinkData,
  type CommentData,
  type UserActivityParams,
  type DuplicatesParams,
  type Listing,
  type CommentsResponse,
  type ApiResponse,
  type MultiInfoResponse,
  type SubredditsListingParams,
  type SubredditsListingResponse,
  type MoreChildrenParams,
  type MoreChildrenResponse,
} from '@/types/redditApi';

// Constants
const FORM_URLENCODED_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
} as const;

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
    'expires' in data
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
      const response = await axios.get(
        `${import.meta.env.VITE_API_PATH}/bearer`
      );
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

/**
 * Search for subreddits by query.
 * @param query - The search query
 * @param options - Optional search parameters
 */
export async function searchSubreddits(
  query: string,
  options: Partial<
    Omit<SearchSubredditsPostBody, 'query' | 'api_type' | 'raw_json'>
  > = {}
): Promise<SearchSubredditsResponse> {
  const defaults: SearchSubredditsPostBody = {
    query,
    exact: false,
    include_over_18: false,
    include_unadvertisable: true,
    raw_json: 1,
    api_type: 'json',
  };

  const params = setParams(
    defaults as unknown as Record<string, unknown>,
    options
  );

  const response = await redditAPI.post(
    '/api/search_subreddits',
    queryString.stringify(params),
    { headers: FORM_URLENCODED_HEADERS }
  );

  return response.data;
}

/**
 * Get information about a subreddit
 * @param subreddit - The subreddit name (without r/ prefix)
 * @param type - Optional type of information to retrieve ('edit', 'rules', 'traffic')
 * @param options - Optional query parameters
 * @returns Promise with the subreddit information based on the type
 */
export async function subredditAbout(
  subreddit: string,
  type?: 'edit' | 'rules' | 'traffic',
  options: { raw_json?: 1 } = {}
): Promise<
  | SubredditAboutResponse
  | SubredditRulesResponse
  | SubredditTrafficResponse
  | SubredditSettingsResponse
> {
  const defaults = {
    raw_json: 1 as const,
  };

  const params = setParams(
    defaults as unknown as Record<string, unknown>,
    options as Record<string, unknown>
  );

  let url = `/r/${subreddit}/about`;
  if (type && ['edit', 'rules', 'traffic'].includes(type)) {
    url += `/${type}`;
  }

  const response = await redditAPI.get(url, { params });
  return response.data;
}

/**
 * Search for posts within a subreddit or sitewide
 * @param target - The subreddit name (without r/ prefix), or null for sitewide search
 * @param options - Search parameters including query, sort, time range, etc.
 * @returns Promise with search results and request URL
 */
export async function getListingSearch(
  target: string | null,
  options: Partial<SearchParams>
): Promise<SearchResponseWithUrl> {
  const defaults: Partial<SearchParams> = {
    after: undefined,
    before: undefined,
    category: undefined,
    count: 0,
    include_facets: false,
    limit: 25,
    q: '',
    restrict_sr: true,
    show: 'all',
    sr_detail: false,
    t: undefined,
    type: undefined,
    raw_json: 1,
    sort: 'relevance',
  };

  const params = setParams(
    defaults as unknown as Record<string, unknown>,
    options as Record<string, unknown>
  );

  const url = target ? `r/${target}/search` : 'search';
  const response = await redditAPI.get(url, { params });
  const query = queryString.stringify(params);

  return {
    ...response.data,
    requestUrl: `${url}?${query}`,
  };
}

/**
 * Search for posts within a multireddit
 * @param user - The username who owns the multi ('me' for current user)
 * @param target - The multireddit name
 * @param options - Search parameters
 * @returns Promise with search results and request URL
 */
export async function getListingSearchMulti(
  user: string,
  target: string,
  options: Partial<SearchParams>
): Promise<SearchResponseWithUrl> {
  const defaults: Partial<SearchParams> & { is_multi?: 1 } = {
    after: undefined,
    before: undefined,
    category: undefined,
    count: 0,
    include_facets: false,
    limit: 25,
    q: '',
    restrict_sr: true,
    show: 'all',
    sr_detail: false,
    t: undefined,
    type: undefined,
    raw_json: 1,
    sort: 'relevance',
    is_multi: 1,
  };

  const params = setParams(
    defaults as unknown as Record<string, unknown>,
    options as Record<string, unknown>
  );

  const url =
    user === 'me'
      ? `me/m/${target}/search`
      : `/user/${user}/m/${target}/search`;

  const response = await redditAPI.get(url, { params });
  const query = queryString.stringify(params);

  return {
    ...response.data,
    requestUrl: `${url}?${query}`,
  };
}

/**
 * Get listings for a subreddit
 * @param subreddit - The subreddit name (without r/ prefix), or null for frontpage
 * @param sort - Sort order (hot, new, top, rising, controversial, etc.)
 * @param options - Pagination and filter options
 * @returns Promise with subreddit listings and request URL
 */
export async function getListingSubreddit(
  subreddit: string | null,
  sort: string,
  options: Partial<SubredditListingsParams> = {}
): Promise<ListingResponseWithUrl<LinkData>> {
  const defaults: Partial<SubredditListingsParams> = {
    after: undefined,
    before: undefined,
    count: 0,
    include_categories: false,
    limit: 25,
    show: 'all',
    sr_detail: false,
    raw_json: 1,
  };

  const params = setParams(
    defaults as unknown as Record<string, unknown>,
    options as Record<string, unknown>
  );

  const url = subreddit ? `/r/${subreddit}/${sort}` : sort;
  const response = await redditAPI.get(url, { params });
  const query = queryString.stringify(params);

  return {
    ...response.data,
    requestUrl: `${url}?${query}`,
  };
}

/**
 * Get listings for a multireddit
 * @param user - The username who owns the multi ('me' for current user)
 * @param name - The multireddit name
 * @param sort - Sort order
 * @param options - Pagination and filter options
 * @returns Promise with multireddit listings and request URL
 */
export async function getListingMulti(
  user: string,
  name: string,
  sort: string,
  options: Partial<SubredditListingsParams> = {}
): Promise<ListingResponseWithUrl<LinkData>> {
  const defaults: Partial<SubredditListingsParams> = {
    after: undefined,
    before: undefined,
    count: 0,
    include_categories: false,
    limit: 25,
    show: 'all',
    sr_detail: false,
    raw_json: 1,
  };

  const params = setParams(
    defaults as unknown as Record<string, unknown>,
    options as Record<string, unknown>
  );

  const url =
    user === 'me' ? `me/m/${name}/${sort}` : `user/${user}/m/${name}/${sort}`;

  const response = await redditAPI.get(url, { params });
  const query = queryString.stringify(params);

  return {
    ...response.data,
    requestUrl: `${url}?${query}`,
  };
}

/**
 * Get user activity listings (posts, comments, etc.)
 * @param user - The username
 * @param type - Activity type (submitted, comments, overview, gilded, etc.)
 * @param sort - Sort order
 * @param options - Pagination and filter options
 * @returns Promise with user activity listings and request URL
 */
export async function getListingUser(
  user: string,
  type: string,
  sort: string,
  options: Partial<UserActivityParams> = {}
): Promise<ListingResponseWithUrl<LinkData | CommentData>> {
  const defaults: Partial<UserActivityParams> = {
    after: undefined,
    before: undefined,
    count: 0,
    include_categories: false,
    limit: 25,
    show: undefined,
    sr_detail: false,
    raw_json: 1,
  };

  const params = setParams(
    defaults as unknown as Record<string, unknown>,
    options as Record<string, unknown>
  );

  const url = `user/${user}/${type}?sort=${sort}`;
  const response = await redditAPI.get(url, { params });
  const query = queryString.stringify(params);

  return {
    ...response.data,
    requestUrl: `${url}?${query}`,
  };
}

/**
 * Get duplicate/crosspost listings for a post
 * @param article - The post ID (without t3_ prefix)
 * @param options - Filter and pagination options
 * @returns Promise with duplicates and request URL (returns tuple with original post and duplicates)
 */
export async function getListingDuplicates(
  article: string,
  options: Partial<DuplicatesParams> = {}
): Promise<[Listing<LinkData>, Listing<LinkData>] & { requestUrl: string }> {
  const defaults: Partial<DuplicatesParams> = {
    after: undefined,
    before: undefined,
    count: 0,
    crossposts_only: false,
    sort: 'num_comments',
    limit: 25,
    show: 'all',
    sr: undefined,
    sr_detail: false,
    raw_json: 1,
    article_id: article,
  };

  const params = setParams(
    defaults as unknown as Record<string, unknown>,
    options as Record<string, unknown>
  );

  const url = `duplicates/${article}`;
  const response = await redditAPI.get(url, { params });
  const query = queryString.stringify(params);

  const result = response.data as [Listing<LinkData>, Listing<LinkData>] & {
    requestUrl: string;
  };
  result.requestUrl = `${url}?${query}`;

  return result;
}

/**
 * Get comments for a post
 * @param target - The subreddit name
 * @param postName - The post ID (without t3_ prefix)
 * @param comment - Optional specific comment ID to focus on
 * @param options - Query parameters
 * @returns Promise with comments and request URL (returns tuple with post and comments)
 */
export async function getComments(
  target: string,
  postName: string,
  comment: string | null,
  options: Record<string, unknown> = {}
): Promise<CommentsResponse & { requestUrl: string }> {
  const defaults = {
    raw_json: 1 as const,
    comment: comment ?? undefined,
  };

  const params = setParams(defaults, options);

  const url = `r/${target}/comments/${postName}/`;
  const response = await redditAPI.get(url, { params });
  const query = queryString.stringify(params);

  const result = response.data as CommentsResponse & { requestUrl: string };
  result.requestUrl = `${url}?${query}`;

  return result;
}

/**
 * Load more comments (expand "load more comments" links)
 * @param linkID - The post fullname (t3_xxx)
 * @param children - Array of comment IDs to load
 * @param options - Additional parameters
 * @returns Promise with more comments data
 */
export async function getMoreComments(
  linkID: string,
  children: string[],
  options: Partial<MoreChildrenParams> = {}
): Promise<MoreChildrenResponse> {
  const defaults: Partial<MoreChildrenParams> = {
    link_id: linkID as `t3_${string}`,
    children: children.join(','),
    raw_json: 1,
    api_type: 'json',
    depth: undefined,
    id: undefined,
    limit_children: false,
  };

  const params = setParams(
    defaults as unknown as Record<string, unknown>,
    options as Record<string, unknown>
  );

  const response = await redditAPI.get('api/morechildren', { params });
  return response.data;
}

/**
 * Create a new multireddit (custom feed)
 * @param name - Multireddit name (max 50 characters)
 * @param description - Description in markdown format
 * @param visibility - Visibility setting (private, public, or hidden)
 * @returns Promise with API response
 */
export async function multiAdd(
  name: string,
  description: string,
  visibility: 'private' | 'public' | 'hidden'
): Promise<ApiResponse> {
  const url = '/api/multi';
  const data = {
    model: JSON.stringify({
      description_md: description,
      display_name: name,
      visibility,
    }),
  };

  const response = await redditAPI.post(url, queryString.stringify(data), {
    headers: FORM_URLENCODED_HEADERS,
  });

  return response.data;
}

/**
 * Get information about a multireddit
 * @param multiPath - The multireddit path
 * @returns Promise with multireddit information
 */
export async function multiInfo(multiPath: string): Promise<MultiInfoResponse> {
  const url = `/api/multi/${multiPath}`;
  const response = await redditAPI.get(url);
  return response.data;
}

/**
 * Get subreddits list (user's subscriptions or popular/default lists)
 * @param where - Type of subreddits (subscriber, contributer, moderator, streams, default, popular, etc.)
 * @param options - Pagination options
 * @returns Promise with subreddits list
 */
export async function subreddits(
  where: string,
  options: Partial<SubredditsListingParams> = {}
): Promise<SubredditsListingResponse> {
  const defaults: Partial<SubredditsListingParams> = {
    limit: 100,
    count: undefined,
    before: undefined,
    after: undefined,
    show: undefined,
    sr_detail: undefined,
    raw_json: 1,
  };

  const params = setParams(
    defaults as unknown as Record<string, unknown>,
    options as Record<string, unknown>
  );

  const mine = where.match(/subscriber|contributer|moderator|streams/);
  const url =
    mine === null ? `/subreddits/${where}` : `/subreddits/mine/${where}`;

  const response = await redditAPI.get(url, { params });
  return response.data;
}
