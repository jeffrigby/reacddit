import Koa from "koa";
import Router from "@koa/router";
import session from "koa-session";
import koaLogger from "koa-logger";
import { logger } from "./logger.js";
import bodyParser from "koa-bodyparser";
import { randomUUID } from "crypto";
import qs from "qs";
import { config } from "./config.js";
import {
  axiosInstance,
  encryptToken,
  decryptToken,
  deriveSigningKey,
  getErrorMessage,
  isTokenExpired,
  addExtraInfoToToken,
} from "./util.js";
import type {
  ExtendedToken,
  RedditAccessTokenResponse,
  BearerTokenResponse,
  CookieStorage,
} from "./types/reddit.js";
import type { SessionData } from "./types/session.js";
import axios, { AxiosError, type AxiosResponse } from "axios";

function getSessionConfig() {
  return {
    key: "reacddit:sess" /** (string) cookie key (default is koa:sess) */,
    /** (number || 'session') maxAge in ms (default is 1 day) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: config.SESSION_LENGTH_SECS * 1000,
    autoCommit: true /** (boolean) automatically commit headers (default true) */,
    overwrite: true /** (boolean) can overwrite or not (default true) */,
    httpOnly: true /** (boolean) httpOnly or not (default true) */,
    signed: true /** (boolean) signed or not (default true) */,
    rolling: true /** (boolean) Force a session identifier cookie to be set on every response.
     The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */,
    renew: true /** (boolean) renew session when session is nearly expired, so we can always keep user logged in.
     (default is false) */,
    sameSite: "lax" as const,
    encode: (rawData: unknown): string => {
      const encrypted = encryptToken(rawData);
      return JSON.stringify(encrypted);
    },
    decode: (stringifiedEncryptedData: string): unknown => {
      try {
        const encryptedData = JSON.parse(stringifiedEncryptedData);
        return decryptToken(encryptedData);
      } catch (error) {
        logger.error("Failed to decode session", {
          error: getErrorMessage(error),
        });
        return null;
      }
    },
  };
}

/**
 * Set the session information
 * @param token - The token object to store in the session
 * @param ctx - The Koa context
 */
function setSession(token: ExtendedToken, ctx: Koa.Context): void {
  ctx.session.token = token;
}

/**
 * Set the client-accessible cookie with token information
 * @param token - The token object
 * @param ctx - The Koa context
 */
function setCookie(token: ExtendedToken, ctx: Koa.Context): void {
  const cookieStorage: CookieStorage = {
    accessToken: token.access_token,
    expires: token.expires,
    auth: token.auth,
    loginURL: getLoginUrl(ctx),
  };

  const tokenJson = JSON.stringify(cookieStorage);

  const expireDate = new Date();
  const expiryTime = expireDate.getTime() + config.SESSION_LENGTH_SECS * 1000;
  expireDate.setTime(expiryTime);

  ctx.cookies.set("token", tokenJson, {
    maxAge: config.SESSION_LENGTH_SECS * 1000,
    expires: expireDate,
    httpOnly: false,
    secure: true,
    overwrite: true,
    sameSite: "lax",
  });
}

/**
 * Set both the session and cookie with token information
 * The session is encrypted, while the cookie is accessible to the client
 * Errors are caught and logged to allow the flow to continue even if cookie setting fails
 * @param token - The token object
 * @param ctx - The Koa context
 */
function setSessAndCookie(token: ExtendedToken, ctx: Koa.Context): void {
  try {
    setSession(token, ctx);
    setCookie(token, ctx);
  } catch (error) {
    logger.error("Error setting session and cookie", {
      error: getErrorMessage(error),
    });
  }
}

/**
 * Asynchronously requests an anonymous access token from Reddit.
 *
 * @throws If the request to Reddit API fails.
 * @returns A Promise that resolves to an object representing the access token.
 */
async function getAnonToken(): Promise<{ token: RedditAccessTokenResponse }> {
  // Request parameters
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("scope", config.REDDIT_SCOPE);

  try {
    const res: AxiosResponse<RedditAccessTokenResponse> =
      await axiosInstance.post("/api/v1/access_token", params);
    return { token: res.data };
  } catch (error) {
    const detail: Record<string, unknown> = {};
    if (error instanceof AxiosError && error.response) {
      detail.status = error.response.status;
    }
    if (error instanceof Error) {
      detail.error = error.message;
    }
    logger.error("Anon access token error", detail);
    throw new Error("Failed to retrieve anonymous access token from Reddit.");
  }
}

/**
 * Revokes a token
 * @param token - The token to revoke
 * @param tokenType - The token type hint ('access_token' or 'refresh_token')
 * @throws If token revocation fails
 */
async function revokeToken(
  token: string,
  tokenType: "access_token" | "refresh_token",
): Promise<void> {
  try {
    await axiosInstance.post("/api/v1/revoke_token", {
      token,
      token_type_hint: tokenType,
    });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    logger.error("Revoke token error", { error: errorMessage });
    throw new Error(`Failed to revoke ${tokenType}: ${errorMessage}`);
  }
}

/**
 * Refresh an existing token with the refresh token
 * @param prevToken - The previous token object containing refresh_token
 * @returns The refreshed token object with updated expiry
 * @throws If token refresh fails or refresh_token is missing
 */
async function getRefreshToken(
  prevToken: ExtendedToken,
): Promise<RedditAccessTokenResponse> {
  if (!prevToken.refresh_token) {
    throw new Error("Cannot refresh token: refresh_token is missing");
  }

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", prevToken.refresh_token);

  try {
    const newToken: AxiosResponse<RedditAccessTokenResponse> =
      await axiosInstance.post("/api/v1/access_token", params);
    return newToken.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    logger.error("Refresh access token error", { error: errorMessage });
    throw new Error(`Failed to refresh token: ${errorMessage}`);
  }
}

/**
 * Generate an object to return.
 * @param token - The access token object
 * @param params - Optional parameters to include
 * @returns Combined object with access token properties and optional parameters
 */
function getBearer(
  token: ExtendedToken,
  params: Partial<BearerTokenResponse> = {},
): BearerTokenResponse {
  // Check for required properties
  if (!token.access_token) {
    throw new Error("Missing access token");
  }
  if (!token.expires) {
    throw new Error("Missing expiry time");
  }
  if (token.auth === undefined) {
    throw new Error("Missing auth");
  }

  const { access_token, expires, auth } = token;

  return {
    accessToken: access_token,
    expires,
    auth,
    type: "new",
    loginUrl: "",
    ...params,
  };
}

/**
 * Generate the login URL to return with anon tokens
 * @param ctx - The Koa context
 * @returns Login URL string
 */
function getLoginUrl(ctx: Koa.Context): string {
  const state = ctx.session.state || randomUUID();
  ctx.session.state = state;

  // Construct the query parameters
  const queryParams = new URLSearchParams({
    client_id: config.REDDIT_CLIENT_ID,
    response_type: "code",
    state,
    redirect_uri: config.REDDIT_CALLBACK_URI,
    duration: "permanent",
    scope: config.REDDIT_SCOPE.split(",").join(" "),
  });

  // Construct the full authorization URL
  return `https://www.reddit.com/api/v1/authorize?${queryParams.toString()}`;
}

const app = new Koa<Koa.DefaultState, Koa.Context & { session: SessionData }>();
app.proxy = true;

app.keys = [deriveSigningKey()];
app.use(session(getSessionConfig(), app));
app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", config.CLIENT_PATH);
  ctx.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  ctx.set("Access-Control-Allow-Headers", "Content-Type");
  ctx.set("Access-Control-Allow-Credentials", "true");
  if (ctx.method === "OPTIONS") {
    ctx.status = 204;
    return;
  }
  await next();
});
app.use(bodyParser({ jsonLimit: "16kb" }));
app.use(async (ctx, next) => {
  await next();
  ctx.set("X-Content-Type-Options", "nosniff");
  ctx.set("X-Frame-Options", "DENY");
  ctx.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  ctx.set("Cache-Control", "no-store");
  ctx.set("X-XSS-Protection", "0");
});
app.use(koaLogger());

const router = new Router();

/**
 * GET /api/login
 * Redirects to the Reddit authorization page to begin OAuth flow
 * @route GET /api/login
 */
router.get("/api/login", (ctx) => {
  const authorizationUri = getLoginUrl(ctx);
  ctx.redirect(authorizationUri);
});

/**
 * GET /api/callback
 * OAuth callback endpoint - handles the redirect from Reddit after user authorization
 * Exchanges the authorization code for an access token
 * @route GET /api/callback
 */
router.get("/api/callback", async (ctx) => {
  const { code, state, error } = ctx.query;
  const savedState = ctx.session.state;
  ctx.session.state = null;

  const handleError = (logMessage: string, status: number): void => {
    logger.error(logMessage);
    ctx.status = status;
    ctx.body = { status: "error", message: "Authentication failed" };
  };

  if (!code || !state) {
    return handleError("Code and/or state query strings missing.", 400);
  }

  if (error) {
    return handleError(`ERROR RETRIEVING THE TOKEN. ${error}`, 403);
  }

  if (!savedState) {
    return handleError("ERROR: SAVED STATE NOT FOUND.", 403);
  }

  if (state !== savedState) {
    return handleError("ERROR: THE STATE DOESN'T MATCH.", 403);
  }

  const options = {
    grant_type: "authorization_code",
    code: code as string,
    redirect_uri: config.REDDIT_CALLBACK_URI,
  };

  try {
    const AccessToken: AxiosResponse<RedditAccessTokenResponse> =
      await axiosInstance.post("/api/v1/access_token", qs.stringify(options));

    const { data } = AccessToken;
    logger.info("Token retrieved successfully");

    if (data.access_token) {
      logger.info("Token retrieved, redirecting to client");
      const accessToken = addExtraInfoToToken(data, true);
      setSessAndCookie(accessToken, ctx);
      ctx.redirect(`${config.CLIENT_PATH}/?login`);
      return;
    }
  } catch (exception) {
    return handleError(`ACCESS TOKEN ERROR ${getErrorMessage(exception)}`, 502);
  }

  ctx.body = "callback";
});

/**
 * Helper function to set the session, cookie and response body
 * @param token - The token object
 * @param ctx - The Koa context
 * @param type - The type of token response ('new', 'cached', 'refresh', 'newanon')
 */
function setSessionAndRespond(
  token: ExtendedToken,
  ctx: Koa.Context,
  type: BearerTokenResponse["type"],
): void {
  setSessAndCookie(token, ctx);
  ctx.body = getBearer(token, { type, loginUrl: getLoginUrl(ctx) });
}

/**
 * Helper function to grant an anonymous token and set the session
 * @param ctx - The Koa context
 * @param type - Token response type ('new' or 'newanon')
 * @param reason - Log message explaining why anon token is being granted
 */
async function grantAnonToken(
  ctx: Koa.Context,
  type: "new" | "newanon",
  reason: string,
): Promise<void> {
  logger.info(reason);
  const anonToken = await getAnonToken();
  setSessionAndRespond(addExtraInfoToToken(anonToken.token, false), ctx, type);
}

/**
 * Helper function to handle the scenario when there's no token available.
 * Grants an anonymous token and sets the session.
 * @param ctx - The Koa context
 */
async function getAnonTokenAndSetSession(ctx: Koa.Context): Promise<void> {
  await grantAnonToken(ctx, "new", "ANON TOKEN GRANTED");
}

/**
 * Helper function to handle the scenario when the token isn't expired.
 * Returns the cached token from the session.
 * @param ctx - The Koa context
 * @param token - The token object
 */
async function returnCachedTokenAndSetSession(
  ctx: Koa.Context,
  token: ExtendedToken,
): Promise<void> {
  logger.info("Cached token returned");
  setSessionAndRespond(token, ctx, "cached");
}

/**
 * Helper function to handle the scenario when the token is expired or refresh is forced.
 * Attempts to refresh the token if a refresh_token exists, otherwise gets an anonymous token.
 * @param ctx - The Koa context
 * @param token - The token object
 * @param forceRefresh - Whether the refresh was explicitly requested
 */
async function refreshOrGetAnonTokenAndSetSession(
  ctx: Koa.Context,
  token: ExtendedToken,
  forceRefresh: boolean,
): Promise<void> {
  if (!token.refresh_token) {
    await grantAnonToken(
      ctx,
      "newanon",
      "NO REFRESH TOKEN. GETTING ANON TOKEN.",
    );
    return;
  }

  try {
    const refreshedTokenResult = await getRefreshToken(token);

    const newToken: ExtendedToken = {
      ...refreshedTokenResult,
      refresh_token: token.refresh_token,
      expires: addExtraInfoToToken(refreshedTokenResult, true).expires,
      auth: true,
    };

    const message = forceRefresh
      ? "FORCED REFRESH. NEW TOKEN GRANTED"
      : "TOKEN EXPIRED. NEW TOKEN GRANTED";
    logger.info(message);
    setSessionAndRespond(newToken, ctx, "refresh");
  } catch {
    await grantAnonToken(
      ctx,
      "new",
      "REFRESH TOKEN ERROR. GETTING ANON TOKEN.",
    );
  }
}

/**
 * GET /api/bearer
 * Returns a valid bearer token (either from cache, refreshed, or new anonymous)
 * Query params:
 *   - refresh: if present, forces a token refresh
 * @route GET /api/bearer
 */
router.get("/api/bearer", async (ctx) => {
  const token = ctx.session.token;
  const forceRefresh = ctx.query["refresh"] !== undefined;

  // Case 1: No existing token. Get an anon token.
  if (!token) {
    await getAnonTokenAndSetSession(ctx);
    return;
  }

  // Case 2: Token is not expired and no forced refresh.
  if (!isTokenExpired(token) && !forceRefresh) {
    await returnCachedTokenAndSetSession(ctx, token);
    return;
  }

  // Case 3: Token expired or forced refresh.
  // If it's an auth user, refresh the token. If not, get a new anon token.
  await refreshOrGetAnonTokenAndSetSession(ctx, token, forceRefresh);
});

// Regex for validating Reddit share links
const SHARE_LINK_REGEX =
  /^https?:\/\/(www\.)?reddit\.com\/r\/[a-zA-Z0-9_]+\/s\/[a-zA-Z0-9]+\/?$/;

// Max URLs per batch request
const MAX_BATCH_SIZE = 20;

type ShareResolveResult = { postId: string } | { error: string };

/**
 * Resolve a single share link to a post ID by following redirects
 */
async function resolveShareUrl(url: string): Promise<ShareResolveResult> {
  if (!SHARE_LINK_REGEX.test(url)) {
    return { error: "Invalid Reddit share link format" };
  }

  try {
    const response = await axios.head(url, {
      maxRedirects: 0,
      validateStatus: (status) => status === 301 || status === 302,
      timeout: 5000,
    });

    const location = response.headers["location"];
    if (typeof location !== "string") {
      return { error: "Share link did not redirect" };
    }

    const postId = location.match(/\/comments\/([a-z0-9]+)/i)?.[1];
    if (!postId) {
      return { error: "Could not extract post ID from redirect" };
    }

    return { postId };
  } catch {
    return { error: "Failed to resolve share link" };
  }
}

/**
 * POST /api/resolve-share
 * Resolves one or more Reddit share links to post IDs by following redirects
 * @route POST /api/resolve-share
 * @body { urls: string[] }
 * @returns { results: { [url: string]: { postId: string } | { error: string } } }
 */
router.post("/api/resolve-share", async (ctx) => {
  const body = ctx.request.body as { urls?: unknown };

  // Validate body has urls array
  if (!body || !Array.isArray(body.urls)) {
    ctx.status = 400;
    ctx.body = { error: "Missing urls array in request body" };
    return;
  }

  const urls = body.urls as unknown[];

  // Reject empty arrays
  if (urls.length === 0) {
    ctx.status = 400;
    ctx.body = { error: "URLs array cannot be empty" };
    return;
  }

  // Validate all items are strings
  if (!urls.every((u): u is string => typeof u === "string")) {
    ctx.status = 400;
    ctx.body = { error: "All URLs must be strings" };
    return;
  }

  // Limit batch size
  if (urls.length > MAX_BATCH_SIZE) {
    ctx.status = 400;
    ctx.body = { error: `Maximum ${MAX_BATCH_SIZE} URLs per request` };
    return;
  }

  // Deduplicate URLs
  const uniqueUrls = [...new Set(urls)];

  // Resolve all unique URLs in parallel
  const entries = await Promise.all(
    uniqueUrls.map(async (url) => {
      const result = await resolveShareUrl(url);
      return [url, result] as const;
    }),
  );

  ctx.body = { results: Object.fromEntries(entries) };
});

/**
 * GET /api/logout
 * Logs out the user by revoking their tokens, clearing the session, and redirecting to the client
 * @route GET /api/logout
 */
router.get("/api/logout", async (ctx) => {
  const token = ctx.session.token;

  if (token) {
    // Revoke tokens in parallel, logging but not failing on errors
    const revokePromises: Promise<void>[] = [];

    if (token.access_token) {
      revokePromises.push(
        revokeToken(token.access_token, "access_token").catch((error) => {
          logger.error("Failed to revoke access token", {
            error: getErrorMessage(error),
          });
        }),
      );
    }

    if (token.refresh_token) {
      revokePromises.push(
        revokeToken(token.refresh_token, "refresh_token").catch((error) => {
          logger.error("Failed to revoke refresh token", {
            error: getErrorMessage(error),
          });
        }),
      );
    }

    await Promise.all(revokePromises);
  }

  // Always clear session and redirect, even if no token existed
  ctx.session.token = null;
  ctx.cookies.set("token", null, { overwrite: true });

  return ctx.redirect(`${config.CLIENT_PATH}/?logout`);
});

app.use(router.routes()).use(router.allowedMethods());

export default app;
