import Koa from "koa";
import Router from "koa-router";
import session from "koa-session";
import rp from "request-promise";
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import logger from "koa-logger";
import chalk from "chalk";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv-defaults";

import { ClientCredentials, AuthorizationCode } from "simple-oauth2";
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
} = process.env;

const debugEnabled = DEBUG === "1" || DEBUG === "true" || false;

const red = chalk.red;

function checkEnvErrors() {
  const env_errors = [];
  if (SALT.length !== 32) {
    env_errors.push("The SALT must be exactly 32 characters.");
  }

  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_CALLBACK_URI) {
    env_errors.push(
      "You must enter the REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, and REDDIT_CALLBACK_URI from https://www.reddit.com/prefs/apps"
    );
  }

  if (!Number.isInteger(Number(PORT)) || !(parseInt(PORT) > 0)) {
    env_errors.push("PORT must be a valid positive integer.");
  }

  if (
    !Number.isInteger(Number(SESSION_LENGTH_SECS)) ||
    !(parseInt(SESSION_LENGTH_SECS) > 0)
  ) {
    env_errors.push("SESSION_LENGTH_SECS must be a valid positive integer.");
  }

  if (!CLIENT_PATH) {
    env_errors.push(
      "You must set your client path. This is the path to the client app in ../client This is to handle redirects."
    );
  }

  if (env_errors.length > 0) {
    env_errors.forEach((value) => {
      console.log(red(`.env ERROR: ${value}`));
    });
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

const oauth2Config = {
  client: {
    id: REDDIT_CLIENT_ID,
    secret: REDDIT_CLIENT_SECRET,
  },
  auth: {
    authorizeHost: "https://ssl.reddit.com",
    authorizePath: "/api/v1/authorize",
    tokenHost: "https://ssl.reddit.com",
    tokenPath: "/api/v1/access_token",
    revokePath: "/api/v1/revoke_token",
  },
};

const scope =
  REDDIT_SCOPE || "identity,mysubreddits,vote,subscribe,read,history,save";

const oauth2 = new AuthorizationCode(oauth2Config);
const client = new ClientCredentials(oauth2Config);

/**
 * Encrypt the token for storage in the cookie. The IV is
 * unique for every token.
 * @param token The token object
 * @returns {{iv: string, token: string}}
 */
const encryptToken = (token) => {
  const iv = randomBytes(16);
  const tokenString = JSON.stringify(token);
  const cipher = createCipheriv("aes-256-cbc", Buffer.from(SALT), iv);
  let encrypted = cipher.update(tokenString);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), token: encrypted.toString("hex") };
};

/**
 * Decrypt the session token cookie
 * @param encryptedToken
 * @returns {token_object}
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
  const decipher = createDecipheriv("aes-256-cbc", Buffer.from(SALT), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString());
};

/**
 * Set the session and cookie objects with
 * the token info. The bearer is left unencrypted.
 * @param token
 * @param ctx
 */
const setSessAndCookie = (token, ctx) => {
  ctx.session.token = encryptToken(token);

  const cookieStorage = {
    accessToken: token.access_token,
    expires: token.expires,
    loginURL: getLoginUrl(ctx),
  };

  const tokenJson = JSON.stringify(cookieStorage);
  const expireDate = new Date();
  ctx.cookies.set("token", tokenJson, {
    maxAge: SESSION_LENGTH_SECS * 1000,
    expires: expireDate.setTime(
      expireDate.getTime() + SESSION_LENGTH_SECS * 1000
    ),
    httpOnly: false,
    overwrite: true,
  });
};

/**
 * Is the token expired? Pad it by 5 minutes.
 * @param token
 * @returns {boolean}
 */
const isExpired = (token) => {
  if (!token.expires) {
    return true;
  }
  const now = Date.now() / 1000;
  // Pad it by 5 minutes.
  return token.expires - 300 <= now;
};

const isAuth = (accessCode) => accessCode.substring(0, 1) !== "-";

const addExtraInfo = (AccessToken) => {
  const { token } = AccessToken;
  const now = Date.now() / 1000;
  const expires = now + token.expires_in - 120;
  const auth = isAuth(token.access_token);
  return {
    ...token,
    expires,
    auth,
  };
};

/**
 * Get an anon token from reddit
 * @returns {Promise<*>}
 */
const getAnonToken = async () => {
  // Get the access token object for the client
  try {
    const tokenParams = {
      scope,
    };
    const anonToken = await client.getToken(tokenParams);
    const anonTokenParsed = addExtraInfo(anonToken);
    return anonTokenParsed;
  } catch (error) {
    console.error("Error: Access Token error", error.message, error.get);
    return false;
  }
};

const revokeToken = async (token, tokenType) => {
  const options = {
    method: "POST",
    uri: "https://www.reddit.com/api/v1/revoke_token",
    form: {
      token,
      token_type_hint: tokenType,
    },
    auth: {
      user: REDDIT_CLIENT_ID,
      pass: REDDIT_CLIENT_SECRET,
    },
  };
  try {
    await rp(options);
    return true;
  } catch (error) {
    console.log("Revoke Token error", error.message);
    return false;
  }
};

/**
 * Refresh an existing token with the refresh token
 * @param refreshToken
 * @returns {Promise<*>}
 */
const getRefreshToken = async (refreshToken) => {
  const options = {
    method: "POST",
    uri: "https://www.reddit.com/api/v1/access_token",
    form: {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    },
    auth: {
      user: REDDIT_CLIENT_ID,
      pass: REDDIT_CLIENT_SECRET,
    },
    headers: {
      /* 'content-type': 'application/x-www-form-urlencoded' */
      // Is set automatically
    },
  };
  try {
    const newToken = await rp(options);
    const tokenJson = JSON.parse(newToken);
    const AccessToken = {
      token: tokenJson,
    };
    console.log(tokenJson, "tokenJson");
    const tokenParsed = addExtraInfo(AccessToken);
    return tokenParsed;
  } catch (error) {
    console.log("Access Token error", error.message);
    return false;
  }
};

/**
 * Generate an object to return.
 * @param accessToken
 * @param params
 * @returns {{expires: (number|*), auth: *, accessToken: *}}
 */
const getBearer = (accessToken, params = {}) => ({
  accessToken: accessToken.access_token,
  expires: accessToken.expires,
  auth: accessToken.auth,
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
  const authorizationUri = oauth2.authorizeURL({
    redirect_uri: REDDIT_CALLBACK_URI,
    scope: scope.split(","),
    state,
    duration: "permanent",
  });
  return authorizationUri;
};

const app = new Koa();

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
  // @todo seems like a dumb way to do this but ¯\ _(ツ)_/¯.
  // Also only implementing this because the login form constantly breaks for mobile
  const newAuthUrl =
    ctx.request.url === "/api/login?mobile"
      ? authorizationUri.replace("/authorize", "/authorize.compact")
      : authorizationUri;
  ctx.redirect(newAuthUrl);
});

/**
 * Handle the Reddit login once authenticated at Reddit.com
 * set the cookie and forward to the front page.
 */
router.get("/api/callback", async (ctx, next) => {
  const { code, state, error } = ctx.query;
  const savedState = ctx.session.state;
  ctx.session.state = null;

  let message;
  if (!code || !state) {
    message = `Code and/or state query strings missing.`;
    console.log(message);
    ctx.status = 500;
    ctx.body = { status: "error", message };
    return;
  }

  if (error) {
    message = `ERROR RETRIEVING THE TOKEN. ${error}`;
    console.log(message);
    ctx.status = 500;
    ctx.body = { status: "error", message };
    return;
  }

  if (!savedState) {
    message = "ERROR: SAVED STATE NOT FOUND.";
    console.log(message);
    ctx.status = 500;
    ctx.body = { status: "error", message };
    return;
  }

  if (state !== savedState) {
    message = "ERROR: THE STATE DOESN'T MATCH.";
    console.log(message);
    ctx.status = 500;
    ctx.body = { status: "error", message };
    return;
  }

  // Everything looks great. Let's try to get the code.
  const options = {
    grant_type: "authorization_code",
    code,
    redirect_uri: REDDIT_CALLBACK_URI,
  };

  try {
    const AccessToken = await oauth2.getToken(options);
    const { token } = AccessToken;
    if (token.access_token) {
      // we are good.
      console.log("TOKEN RETRIEVED SUCCESSFULLY. REDIRECTING TO FRONT.");
      const accessToken = addExtraInfo(AccessToken);
      setSessAndCookie(accessToken, ctx);
      ctx.redirect(`${CLIENT_PATH}/?login`);
      return;
    }
  } catch (exception) {
    message = `ACCESS TOKEN ERROR ${exception.message}`;
    console.error(message);
    ctx.status = 500;
    ctx.body = { status: "error", message };
    return;
  }

  ctx.body = "callback";
});

/**
 * Three things can happen
 *  1. No token exists. Get a new anon token
 *  2. The existing token in the session is expired or force refresh is set (?refresh)
 *  3. Refresh the token if auth or get a new anon token.
 */
router.get("/api/bearer", async (ctx, next) => {
  const token = decryptToken(ctx.session.token);
  debugEnabled && console.log("SESSION", token);

  const loginUrl = getLoginUrl(ctx);

  // No existing token. Get an anon token.
  if (!token) {
    const anonToken = await getAnonToken();
    console.log("ANON TOKEN GRANTED");
    setSessAndCookie(anonToken, ctx);
    ctx.body = getBearer(anonToken, { type: "new", loginUrl });
    return;
  }

  let message;

  // Check if it's expired.
  const tokenExpired = isExpired(token);
  if (tokenExpired) {
    message = `TOKEN EXPIRED ${debugEnabled ? token.access_token : ""} `;
    console.log(message);
  }

  // Force refresh?
  const forceRefresh = ctx.query.refresh !== undefined;
  if (forceRefresh) {
    message = `FORCED REFRESH IS TRUE ${
      debugEnabled ? token.refresh_token : ""
    }`;
    console.log(message);
  }

  // Token is not expired and no forced refresh.
  if (!tokenExpired && !forceRefresh) {
    const returnBearer = token.auth
      ? getBearer(token, { type: "cached" })
      : getBearer(token, { type: "cached", loginUrl });

    console.log(
      `TOKEN NOT EXPIRED. RETURN AS IS ${
        debugEnabled ? token.access_token : ""
      }`
    );
    ctx.body = returnBearer;
  } else if (token.refresh_token) {
    // The token is expired or forced refresh.
    // Auth user. Get an new token with the refresh token.
    const refreshToken = token.refresh_token;
    const refreshedTokenResult = await getRefreshToken(refreshToken);
    const newToken = {
      ...refreshedTokenResult,
      refresh_token: refreshToken,
    };

    setSessAndCookie(newToken, ctx);

    const returnBody = getBearer(newToken, { type: "refresh" });
    ctx.body = returnBody;

    newToken.refresh_token = token.refresh_token;

    if (tokenExpired) {
      message = "TOKEN EXPIRED. NEW TOKEN GRANTED";
    } else if (forceRefresh) {
      message = "FORCED REFRESH. NEW TOKEN GRANTED";
    } else {
      message = "????";
    }

    if (debugEnabled) {
      console.log(message, newToken.access_token);
    } else {
      console.log(message);
    }
  } else {
    const anonToken = await getAnonToken();
    console.log("REFRESH ANON TOKEN GRANTED");
    setSessAndCookie(anonToken, ctx);
    ctx.body = getBearer(anonToken, { type: "newanon", loginUrl });
    message = "ANON EXPIRED or FORCED & REFRESH TOKEN GRANTED";
    if (debugEnabled) {
      console.log(message, anonToken.access_token);
    } else {
      console.log(message);
    }
  }
});

router.get("/api/logout", async (ctx, next) => {
  const token = decryptToken(ctx.session.token);
  if (token) {
    try {
      const accessTokenRevoke = await revokeToken(
        token.access_token,
        "access_token"
      );
      const refreshTokenRevoke = await revokeToken(
        token.refresh_token,
        "refresh_token"
      );
    } catch (error) {
      console.log("ERROR REVOKING TOKEN: ", error.message, error);
    }
    ctx.session.token = null;
    ctx.cookies.set("token");
    return ctx.redirect(`${CLIENT_PATH}/?logout`);
  }
});

app.use(router.routes()).use(router.allowedMethods());

export default app;
