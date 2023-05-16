import Koa from "koa";
import Router from "koa-router";
import session from "koa-session";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import logger from "koa-logger";
import chalk from "chalk";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv-defaults";
import axios from "axios";
import qs from "qs";

const envPath = process.env.ENVFILE ? process.env.ENVFILE : "./.env";

dotenv.config({
  path: envPath,
  encoding: "utf8",
  defaults: "./.env.defaults", // This is new
});

const {
  REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET,
  REDDIT_CALLBACK_URI,
  REDDIT_SCOPE,
  CLIENT_PATH,
  SALT,
  SESSION_LENGTH_SECS,
  PORT,
  DEBUG,
  ENCRYPTION_ALGORITHM,
  IV_LENGTH,
} = process.env;

const axiosInstance = axios.create({
  baseURL: "https://www.reddit.com",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  auth: {
    username: REDDIT_CLIENT_ID,
    password: REDDIT_CLIENT_SECRET,
  },
});

const debugEnabled = DEBUG === "1" || DEBUG === "true" || false;

const red = chalk.red;

function checkEnvErrors() {
  const checks = [
    {
      condition: SALT.length !== 32,
      message: "The SALT must be exactly 32 characters.",
    },
    {
      condition:
        !REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_CALLBACK_URI,
      message:
        "You must enter the REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, and REDDIT_CALLBACK_URI from https://www.reddit.com/prefs/apps",
    },
    {
      condition: !Number.isInteger(Number(PORT)) || !(parseInt(PORT) > 0),
      message: "PORT must be a valid positive integer.",
    },
    {
      condition:
        !Number.isInteger(Number(SESSION_LENGTH_SECS)) ||
        !(parseInt(SESSION_LENGTH_SECS) > 0),
      message: "SESSION_LENGTH_SECS must be a valid positive integer.",
    },
    {
      condition: !CLIENT_PATH,
      message:
        "You must set your client path. This is the path to the client app in ../client This is to handle redirects.",
    },
  ];

  const errors = checks
    .filter((check) => check.condition)
    .map((check) => check.message);

  if (errors.length > 0) {
    errors.forEach((error) => console.log(red(`.env ERROR: ${error}`)));
    process.exit(1);
  }
}

checkEnvErrors();

const CONFIG = {
  key: "reacddit:sess" /** (string) cookie key (default is koa:sess) */,
  /** (number || 'session') maxAge in ms (default is 1 days) */
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
};

const scope =
  REDDIT_SCOPE || "identity,mysubreddits,vote,subscribe,read,history,save";

/**
 * Encrypt the token for storage in the cookie. The IV is
 * unique for every token.
 * @param {object} token The token object
 * @returns {{iv: string, token: string}}
 */
const encryptToken = (token) => {
  const iv = randomBytes(parseInt(IV_LENGTH));
  const tokenString = JSON.stringify(token);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(SALT), iv);
  let encrypted = cipher.update(tokenString);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), token: encrypted.toString("hex") };
};

/**
 * Decrypt the session token cookie
 * @param {object} encryptedToken The encrypted token
 * @returns {any|null} The decrypted token or null if the token is invalid
 */
const decryptToken = (encryptedToken) => {
  if (
    !encryptedToken ||
    encryptedToken.iv === undefined ||
    encryptedToken.token === undefined
  ) {
    return null;
  }
  const iv = Buffer.from(encryptedToken.iv, "hex");
  const encryptedText = Buffer.from(encryptedToken.token, "hex");
  const decipher = createDecipheriv(
    ENCRYPTION_ALGORITHM,
    Buffer.from(SALT),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  try {
    return JSON.parse(decrypted.toString());
  } catch (error) {
    console.error("Failed to parse decrypted token:", error);
    return null;
  }
};

/**
 * Set the session information
 * @param {object} token
 * @param ctx
 */
const setSession = (token, ctx) => {
  ctx.session.token = encryptToken(token);
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
    secure: true, // or false, depending on your needs
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
  return token.expires - 300 <= now;
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
    console.error("Error: Anon Access Token error", error.message);
    console.error("Error response from Reddit:", error.response.data);
    throw new Error("Failed to retrieve anonymous access token from Reddit.");
  }
};

const revokeToken = async (token, tokenType) => {
  try {
    await axiosInstance.post("/api/v1/revoke_token", {
      token,
      token_type_hint: tokenType,
    });
    return true;
  } catch (error) {
    console.log("Revoke Token error", error.message);
    return false;
  }
};

/**
 * Refresh an existing token with the refresh token
 * @returns {Promise<*>}
 * @param prevToken
 */
const getRefreshToken = async (prevToken) => {
  const { refresh_token, auth } = prevToken;

  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refresh_token);

  try {
    // User axios to get the token
    const newToken = await axiosInstance.post("/api/v1/access_token", params);
    // Only auth tokens have a refresh token
    return addExtraInfoToToken(newToken.data, true);
  } catch (error) {
    console.log("Refresh Access Token error", error.message);
    console.error(error);
    return false;
  }
};

/**
 * Generate an object to return.
 * @param {Object} accessToken - The access token object
 * @param {Object} [params={}] - Optional parameters to include
 * @returns {Object} - Combined object with access token properties and optional parameters
 */
const getBearer = ({ access_token, expires, auth }, params = {}) => ({
  accessToken: access_token,
  expires,
  auth,
  ...params,
});

/**
 * Generate the login URL to return with anon tokens
 * @param ctx
 * @returns {String}
 */
const getLoginUrl = (ctx) => {
  const state = ctx.session.state || uuidv4();
  ctx.session.state = state;

  // Construct the query parameters
  const queryParams = new URLSearchParams({
    client_id: REDDIT_CLIENT_ID,
    response_type: "code",
    state: state,
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
  ctx.set("Access-Control-Allow-Origin", CLIENT_PATH);
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
    console.log(message);
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
      qs.stringify(options)
    );

    const { data } = AccessToken;
    console.log("TOKEN RETRIEVED SUCCESSFULLY.", data);

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
const setSessionAndRespond = async (token, ctx, type) => {
  console.log({ token, ctx, type });
  setSessAndCookie(token, ctx);
  ctx.body = getBearer(token, { type, loginUrl: getLoginUrl(ctx) });
};

/**
 * Get a bearer token
 */
router.get("/api/bearer", async (ctx, next) => {
  const token = decryptToken(ctx.session.token);
  const forceRefresh = ctx.query.refresh !== undefined;

  // Case 1: No existing token. Get an anon token.
  if (!token) {
    console.log("ANON TOKEN GRANTED");
    const anonToken = await getAnonToken();
    await setSessionAndRespond(anonToken, ctx, "new");
    return;
  }

  // Case 2: Token is not expired and no forced refresh.
  if (!isTokenExpired(token) && !forceRefresh) {
    const type = token.auth ? "cached" : "cached";
    console.log("TOKEN NOT EXPIRED. RETURN AS IS");
    await setSessionAndRespond(token, ctx, type);
    return;
  }

  // Case 3: Token expired or forced refresh.
  // If it's an auth user, refresh the token. If not, get a new anon token.
  if (token.refresh_token) {
    const refreshedTokenResult = await getRefreshToken(token);
    if (!refreshedTokenResult) {
      console.error("REFRESH TOKEN FAILED. GETTING ANON TOKEN");
      const anonToken = await getAnonToken();
      await setSessionAndRespond(anonToken, ctx, "new");
      return;
    }

    const newToken = {
      ...refreshedTokenResult,
      refresh_token: token.refresh_token,
      auth: token.auth,
    };

    const message = forceRefresh
      ? "FORCED REFRESH. NEW TOKEN GRANTED"
      : "TOKEN EXPIRED. NEW TOKEN GRANTED";
    console.log(message);
    await setSessionAndRespond(newToken, ctx, "refresh");
  } else {
    console.log("REFRESH ANON TOKEN GRANTED");
    const anonToken = await getAnonToken();
    await setSessionAndRespond(anonToken.token, ctx, "newanon");
  }
});

/**
 * Log a user out by revoking their access and refresh tokens, clearing the session, and deleting the token cookie.
 */
router.get("/api/logout", async (ctx, next) => {
  const token = decryptToken(ctx.session.token);

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
