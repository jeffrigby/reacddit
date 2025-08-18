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
} from "./util.mjs";

const {
  REDDIT_CLIENT_ID,
  REDDIT_CALLBACK_URI,
  REDDIT_SCOPE,
  CLIENT_PATH,
  SALT,
  SESSION_LENGTH_SECS,
  TOKEN_EXPIRY_PADDING_SECS,
  DEBUG,
} = process.env;

const debugEnabled = DEBUG === "1" || DEBUG === "true" || false;

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
 * @param {object} token
 * @param ctx
 */
const setSession = (token, ctx) => {
  ctx.session.token = token;
};

/**
 * Set the cookie
 * @param {object} token
 * @param ctx
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
 * Set the session and cookie objects with
 * the token info. The bearer is left unencrypted.
 * @param token
 * @param ctx
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
 * Checks if the token is expired. Pads the expiry time by 5 minutes.
 * @param {Object} token - The token object
 * @returns {boolean} - Returns true if the token is expired, false otherwise
 */
const isTokenExpired = (token) => {
  if (!token || !token.expires) {
    return true;
  }
  const now = Date.now() / 1000; // Convert to Unix timestamp (seconds since Unix epoch)
  // Pad it by 5 minutes.
  return token.expires - TOKEN_EXPIRY_PADDING_SECS <= now;
};

/**
 * Adds additional info to the token object
 * @param {Object} token - The token object
 * @param {boolean} auth - If the token is authorized
 * @returns {Object} - The token object with additional info
 */
const addExtraInfoToToken = (token, auth = false) => {
  const now = Date.now() / 1000; // Convert to Unix timestamp (seconds since Unix epoch)
  const expires = now + token.expires_in - 120;

  return {
    ...token,
    expires,
    auth,
  };
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
 * @param token
 * @param tokenType
 * @returns {Promise<boolean>}
 */
const revokeToken = async (token, tokenType) => {
  try {
    await axiosInstance.post("/api/v1/revoke_token", {
      token,
      token_type_hint: tokenType,
    });
    return true;
  } catch (error) {
    console.error("Revoke Token error", error.message);
    return false;
  }
};

/**
 * Refresh an existing token with the refresh token
 * @returns {Promise<*>}
 * @param prevToken
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
    return false;
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
 * Forward to the Reddit login page
 */
router.get("/api/login", (ctx, next) => {
  const authorizationUri = getLoginUrl(ctx);
  ctx.redirect(authorizationUri);
});

/**
 * Get the bearer token
 */
router.get("/api/callback", async (ctx, next) => {
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

// Helper function to set the session, cookie and response body
const setSessionAndRespond = (token, ctx, type) => {
  setSessAndCookie(token, ctx);
  ctx.body = getBearer(token, { type, loginUrl: getLoginUrl(ctx) });
};

/**
 * Helper function to handle the scenario when there's no token available.
 * @param {object} ctx - The Koa context
 */
const getAnonTokenAndSetSession = async (ctx) => {
  console.log("ANON TOKEN GRANTED");
  const anonToken = await getAnonToken();
  setSessionAndRespond(addExtraInfoToToken(anonToken.token, false), ctx, "new");
};

/**
 * Helper function to handle the scenario when the token isn't expired.
 * @param {object} ctx - The Koa context
 * @param {object} token - The token object
 */
const returnCachedTokenAndSetSession = async (ctx, token) => {
  console.log("CACHED TOKEN RETURNED");
  await setSessionAndRespond(token, ctx, "cached");
};

/**
 * Helper function to handle the scenario when the token is expired or refresh is forced.
 * @param {object} ctx - The Koa context
 * @param {object} token - The token object
 * @param {boolean} forceRefresh - The flag that indicates whether the refresh is forced
 */
const refreshOrGetAnonTokenAndSetSession = async (ctx, token, forceRefresh) => {
  if (token.refresh_token) {
    const refreshedTokenResult = await getRefreshToken(token);

    if (!refreshedTokenResult) {
      console.log("REFRESH TOKEN ERROR. GETTING ANON TOKEN.");
      const anonToken = await getAnonToken();
      await setSessionAndRespond(
        addExtraInfoToToken(anonToken.token),
        ctx,
        "new",
      );
      return;
    }

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
 * Get a bearer token
 */
router.get("/api/bearer", async (ctx, next) => {
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
 * Log a user out by revoking their access and refresh tokens, clearing the session, and deleting the token cookie.
 */
router.get("/api/logout", async (ctx, next) => {
  const token = ctx.session.token;

  if (token) {
    try {
      // Revoke the access token and the refresh token in parallel
      await Promise.all([
        revokeToken(token.access_token, "access_token"),
        revokeToken(token.refresh_token, "refresh_token"),
      ]);
    } catch (error) {
      // Log the error but do not re-throw it
      console.error("Error occurred while revoking tokens: ", error);
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
