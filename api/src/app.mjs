import Koa from "koa";
import Router from "@koa/router";
import session from "koa-session";
import logger from "koa-logger";
import { randomUUID } from "crypto";
import qs from "qs";
import {
  axiosInstance,
  checkEnvErrors,
  encryptToken,
  decryptToken,
  isTokenExpired,
  addExtraInfoToToken,
} from "./util.mjs";

const {
  REDDIT_CLIENT_ID,
  REDDIT_CALLBACK_URI,
  REDDIT_SCOPE,
  CLIENT_PATH,
  SALT,
  SESSION_LENGTH_SECS,
} = process.env;

checkEnvErrors();

const CONFIG = {
  key: "reacddit:sess" /** (string) cookie key (default is koa:sess) */,
  /** (number || 'session') maxAge in ms (default is 1 day) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: SESSION_LENGTH_SECS * 1000,
  autoCommit: true /** (boolean) automatically commit headers (default true) */,
  overwrite: true /** (boolean) can overwrite or not (default true) */,
  httpOnly: true /** (boolean) httpOnly or not (default true) */,
  signed: true /** (boolean) signed or not (default true) */,
  rolling: true /** (boolean) Force a session identifier cookie to be set on every response.
   The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */,
  renew: true /** (boolean) renew session when session is nearly expired, so we can always keep user logged in.
   (default is false) */,
  encode: (rawData) => {
    // Use your encryptToken function
    const encrypted = encryptToken(rawData);
    // Return a stringified version of the whole encrypted object
    return JSON.stringify(encrypted);
  },
  decode: (stringifiedEncryptedData) => {
    // Parse the stringified encrypted object
    const encryptedData = JSON.parse(stringifiedEncryptedData);
    // Use your decryptToken function
    return decryptToken(encryptedData);
  },
};

const scope =
  REDDIT_SCOPE || "identity,mysubreddits,vote,subscribe,read,history,save";

/**
 * Set the session information
 * @param {object} token - The token object to store in the session
 * @param {object} ctx - The Koa context
 */
const setSession = (token, ctx) => {
  ctx.session.token = token;
};

/**
 * Set the client-accessible cookie with token information
 * @param {object} token - The token object
 * @param {object} ctx - The Koa context
 */
const setCookie = (token, ctx) => {
  const cookieStorage = {
    accessToken: token.access_token,
    expires: token.expires,
    auth: token.auth,
    loginURL: getLoginUrl(ctx),
  };

  const tokenJson = JSON.stringify(cookieStorage);

  const expireDate = new Date();
  const expiryTime = expireDate.getTime() + SESSION_LENGTH_SECS * 1000;
  expireDate.setTime(expiryTime);

  ctx.cookies.set("token", tokenJson, {
    maxAge: SESSION_LENGTH_SECS * 1000,
    expires: expireDate,
    httpOnly: false,
    secure: true,
    overwrite: true,
  });
};

/**
 * Set both the session and cookie with token information
 * The session is encrypted, while the cookie is accessible to the client
 * @param {object} token - The token object
 * @param {object} ctx - The Koa context
 */
const setSessAndCookie = (token, ctx) => {
  try {
    setSession(token, ctx);
    setCookie(token, ctx);
  } catch (error) {
    console.error("Error setting session and cookie:", error);
  }
};

/**
 * Asynchronously requests an anonymous access token from Reddit.
 *
 * @throws {Error} If the request to Reddit API fails.
 * @returns {Promise<Object>} A Promise that resolves to an object representing the access token.
 */
const getAnonToken = async () => {
  // Request parameters
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("scope", scope);

  try {
    const res = await axiosInstance.post("/api/v1/access_token", params);
    return addExtraInfoToToken({ token: res.data }, false);
  } catch (error) {
    if (error?.message) {
      console.error("Error: Anon Access Token error", error.message);
    }
    if (error?.response?.data) {
      console.error("Error response from Reddit:", error.response.data);
    }
    throw new Error("Failed to retrieve anonymous access token from Reddit.");
  }
};

/**
 * Revokes a token
 * @param {string} token - The token to revoke
 * @param {string} tokenType - The token type hint ('access_token' or 'refresh_token')
 * @returns {Promise<void>}
 * @throws {Error} If token revocation fails
 */
const revokeToken = async (token, tokenType) => {
  try {
    await axiosInstance.post("/api/v1/revoke_token", {
      token,
      token_type_hint: tokenType,
    });
  } catch (error) {
    console.error("Revoke Token error", error.message);
    throw new Error(`Failed to revoke ${tokenType}: ${error.message}`);
  }
};

/**
 * Refresh an existing token with the refresh token
 * @param {Object} prevToken - The previous token object containing refresh_token
 * @returns {Promise<Object>} The refreshed token object with updated expiry
 * @throws {Error} If token refresh fails
 */
const getRefreshToken = async (prevToken) => {
  const { refresh_token } = prevToken;

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refresh_token);

  try {
    const newToken = await axiosInstance.post("/api/v1/access_token", params);
    // Only auth tokens have a refresh token
    return addExtraInfoToToken(newToken.data, true);
  } catch (error) {
    console.error("Refresh Access Token error", error.message);
    throw new Error(`Failed to refresh token: ${error.message}`);
  }
};

/**
 * Generate an object to return.
 * @param {Object} token - The access token object
 * @param {Object} [params={}] - Optional parameters to include
 * @returns {Object} - Combined object with access token properties and optional parameters
 */
const getBearer = (token, params = {}) => {
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
    ...params,
  };
};

/**
 * Generate the login URL to return with anon tokens
 * @param ctx
 * @returns {String}
 */
const getLoginUrl = (ctx) => {
  const state = ctx.session.state || randomUUID();
  ctx.session.state = state;

  // Construct the query parameters
  const queryParams = new URLSearchParams({
    client_id: REDDIT_CLIENT_ID,
    response_type: "code",
    state,
    redirect_uri: REDDIT_CALLBACK_URI,
    duration: "permanent",
    scope: scope.split(",").join(" "),
  });

  // Construct the full authorization URL
  return `https://www.reddit.com/api/v1/authorize?${queryParams.toString()}`;
};

const app = new Koa();
app.proxy = true;

app.keys = [SALT];
app.use(session(CONFIG, app));
app.use(async (ctx, next) => {
  // Always read from process.env for consistency
  // This ensures the value is always current
  const clientPath = process.env.CLIENT_PATH;
  if (clientPath) {
    ctx.set("Access-Control-Allow-Origin", clientPath);
  }
  ctx.set("Access-Control-Allow-Methods", "GET");
  await next();
});
app.use(logger());

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

  const handleError = (message, status = 500) => {
    console.error(message);
    ctx.status = status;
    ctx.body = { status: "error", message };
  };

  if (!code || !state) {
    return handleError("Code and/or state query strings missing.");
  }

  if (error) {
    return handleError(`ERROR RETRIEVING THE TOKEN. ${error}`);
  }

  if (!savedState) {
    return handleError("ERROR: SAVED STATE NOT FOUND.");
  }

  if (state !== savedState) {
    return handleError("ERROR: THE STATE DOESN'T MATCH.");
  }

  // Everything looks great. Let's try to get the code.
  const options = {
    grant_type: "authorization_code",
    code,
    redirect_uri: REDDIT_CALLBACK_URI,
  };

  try {
    const AccessToken = await axiosInstance.post(
      "/api/v1/access_token",
      qs.stringify(options),
    );

    const { data } = AccessToken;
    console.log("TOKEN RETRIEVED SUCCESSFULLY.");

    if (data.access_token) {
      // we are good.
      console.log("TOKEN RETRIEVED SUCCESSFULLY. REDIRECTING TO FRONT.");
      const accessToken = addExtraInfoToToken(data, true);
      setSessAndCookie(accessToken, ctx);
      ctx.redirect(`${CLIENT_PATH}/?login`);
      return;
    }
  } catch (exception) {
    return handleError(`ACCESS TOKEN ERROR ${exception.message}`);
  }

  ctx.body = "callback";
});

/**
 * Helper function to set the session, cookie and response body
 * @param {object} token - The token object
 * @param {object} ctx - The Koa context
 * @param {string} type - The type of token response ('new', 'cached', 'refresh', 'newanon')
 */
const setSessionAndRespond = (token, ctx, type) => {
  setSessAndCookie(token, ctx);
  ctx.body = getBearer(token, { type, loginUrl: getLoginUrl(ctx) });
};

/**
 * Helper function to handle the scenario when there's no token available.
 * Grants an anonymous token and sets the session.
 * @param {object} ctx - The Koa context
 */
const getAnonTokenAndSetSession = async (ctx) => {
  console.log("ANON TOKEN GRANTED");
  const anonToken = await getAnonToken();
  setSessionAndRespond(addExtraInfoToToken(anonToken.token, false), ctx, "new");
};

/**
 * Helper function to handle the scenario when the token isn't expired.
 * Returns the cached token from the session.
 * @param {object} ctx - The Koa context
 * @param {object} token - The token object
 */
const returnCachedTokenAndSetSession = async (ctx, token) => {
  console.log("CACHED TOKEN RETURNED");
  await setSessionAndRespond(token, ctx, "cached");
};

/**
 * Helper function to handle the scenario when the token is expired or refresh is forced.
 * Attempts to refresh the token if a refresh_token exists, otherwise gets an anonymous token.
 * @param {object} ctx - The Koa context
 * @param {object} token - The token object
 * @param {boolean} forceRefresh - Whether the refresh was explicitly requested
 */
const refreshOrGetAnonTokenAndSetSession = async (ctx, token, forceRefresh) => {
  if (token.refresh_token) {
    try {
      const refreshedTokenResult = await getRefreshToken(token);

      const newToken = {
        ...refreshedTokenResult,
        refresh_token: token.refresh_token,
      };

      const message = forceRefresh
        ? "FORCED REFRESH. NEW TOKEN GRANTED"
        : "TOKEN EXPIRED. NEW TOKEN GRANTED";
      console.log(message);
      await setSessionAndRespond(
        addExtraInfoToToken(newToken, true),
        ctx,
        "refresh",
      );
    } catch {
      console.log("REFRESH TOKEN ERROR. GETTING ANON TOKEN.");
      const anonToken = await getAnonToken();
      await setSessionAndRespond(
        addExtraInfoToToken(anonToken.token),
        ctx,
        "new",
      );
    }
  } else {
    console.log("NO REFRESH TOKEN. GETTING ANON TOKEN.");
    const anonToken = await getAnonToken();
    await setSessionAndRespond(
      addExtraInfoToToken(anonToken.token, false),
      ctx,
      "newanon",
    );
  }
};

/**
 * GET /api/bearer
 * Returns a valid bearer token (either from cache, refreshed, or new anonymous)
 * Query params:
 *   - refresh: if present, forces a token refresh
 * @route GET /api/bearer
 */
router.get("/api/bearer", async (ctx) => {
  const token = ctx.session.token;
  const forceRefresh = ctx.query.refresh !== undefined;

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

/**
 * GET /api/logout
 * Logs out the user by revoking their tokens, clearing the session, and redirecting to the client
 * @route GET /api/logout
 */
router.get("/api/logout", async (ctx) => {
  const token = ctx.session.token;

  if (token) {
    // Try to revoke tokens, but don't fail if revocation fails
    try {
      // Revoke the access token and the refresh token in parallel
      const revokePromises = [];
      if (token.access_token) {
        revokePromises.push(
          revokeToken(token.access_token, "access_token").catch((error) => {
            console.error("Failed to revoke access token:", error.message);
          }),
        );
      }
      if (token.refresh_token) {
        revokePromises.push(
          revokeToken(token.refresh_token, "refresh_token").catch((error) => {
            console.error("Failed to revoke refresh token:", error.message);
          }),
        );
      }
      await Promise.all(revokePromises);
    } catch (error) {
      // Log the error but do not re-throw it
      console.error("Error occurred while revoking tokens: ", error.message);
      // Even if an error occurred, we still want to clear the session and cookie
    }

    // Clear the session and delete the token cookie
    ctx.session.token = null;
    ctx.cookies.set("token", null, { overwrite: true });

    // Redirect the user to the logout page
    return ctx.redirect(`${CLIENT_PATH}/?logout`);
  }
});

app.use(router.routes()).use(router.allowedMethods());

export default app;
