/**
 * Reddit OAuth2 Access Token Response
 */
export interface RedditAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}

/**
 * Extended Token with Additional Information
 */
export interface ExtendedToken extends RedditAccessTokenResponse {
  expires: number;
  auth: boolean;
}

/**
 * Encrypted Token Structure
 */
export interface EncryptedToken {
  iv: string;
  token: string;
}

/**
 * Bearer Token Response
 */
export interface BearerTokenResponse {
  accessToken: string;
  expires: number;
  auth: boolean;
  type: "new" | "cached" | "refresh" | "newanon";
  loginUrl: string;
}

/**
 * Cookie Storage Structure
 */
export interface CookieStorage {
  accessToken: string;
  expires: number;
  auth: boolean;
  loginURL: string;
}
