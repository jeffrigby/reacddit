const http = require('http');
// const https = require('https');
const Koa = require('koa');
const Router = require('koa-router');
const session = require('koa-session');
const uuidv4 = require('uuid/v4');
const rp = require('request-promise');
const crypto = require('crypto');
const logger = require('koa-logger');

require('dotenv').config();

const {
  REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET,
  REDDIT_CALLBACK_URI,
  REDDIT_SCOPE,
  APP_KEY,
  SALT,
  SESSION_LENGTH_SECS,
  PORT,
  DEBUG,
} = process.env;

const CONFIG = {
  key: 'redditmedia:sess' /** (string) cookie key (default is koa:sess) */,
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: SESSION_LENGTH_SECS * 1000,
  autoCommit: true /** (boolean) automatically commit headers (default true) */,
  overwrite: true /** (boolean) can overwrite or not (default true) */,
  httpOnly: true /** (boolean) httpOnly or not (default true) */,
  signed: true /** (boolean) signed or not (default true) */,
  rolling: true /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */,
  renew: true /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false) */,
};

const oauth2 = require('simple-oauth2').create({
  client: {
    id: REDDIT_CLIENT_ID,
    secret: REDDIT_CLIENT_SECRET,
  },
  auth: {
    authorizeHost: 'https://www.reddit.com',
    authorizePath: '/api/v1/authorize',
    tokenHost: 'https://www.reddit.com',
    tokenPath: '/api/v1/access_token',
    revokePath: '/api/v1/revoke_token',
  },
});

/**
 * Encrypt the token for storage in the cookie. The IV is
 * unique for every token.
 * @param token The token object
 * @returns {{iv: string, token: string}}
 */
const encryptToken = token => {
  const iv = crypto.randomBytes(16);
  const tokenString = JSON.stringify(token);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SALT), iv);
  let encrypted = cipher.update(tokenString);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), token: encrypted.toString('hex') };
};

/**
 * Decrypt the session token cookie
 * @param encryptedToken
 * @returns {token_object}
 */
const decryptToken = encryptedToken => {
  if (
    !encryptedToken ||
    encryptedToken.iv === undefined ||
    encryptedToken.token === undefined
  ) {
    return null;
  }
  const iv = Buffer.from(encryptedToken.iv, 'hex');
  const encryptedText = Buffer.from(encryptedToken.token, 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(SALT),
    iv
  );
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
  };

  const tokenJson = JSON.stringify(cookieStorage);
  const expireDate = new Date();
  ctx.cookies.set('token', tokenJson, {
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
const isExpired = token => {
  const now = Date.now() / 1000;
  // Pad it by 5 minutes.
  return token.expires - 300 <= now;
};

const isAuth = accessCode => accessCode.substring(0, 1) !== '-';

const addExtraInfo = token => {
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
    const anonToken = await oauth2.clientCredentials.getToken();
    const anonTokenParsed = addExtraInfo(anonToken);
    return anonTokenParsed;
  } catch (error) {
    console.log('Access Token error', error.message);
    return false;
  }
};

/**
 * Refresh an exisiting token with the refresh token
 * @param refreshToken
 * @returns {Promise<*>}
 */
const getRefreshToken = async refreshToken => {
  const options = {
    method: 'POST',
    uri: 'https://www.reddit.com/api/v1/access_token',
    form: {
      grant_type: 'refresh_token',
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
    const tokenParsed = addExtraInfo(tokenJson);
    return tokenParsed;
  } catch (error) {
    console.log('Access Token error', error.message);
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
const getLoginUrl = ctx => {
  const state = ctx.session.state || uuidv4();
  ctx.session.state = state;
  const authorizationUri = oauth2.authorizationCode.authorizeURL({
    redirect_uri: REDDIT_CALLBACK_URI,
    scope: REDDIT_SCOPE.split(','),
    state,
    duration: 'permanent',
    responseType: 'code',
  });
  return authorizationUri;
};

const app = new Koa();

app.keys = [APP_KEY];
app.use(session(CONFIG, app));
app.use(logger());

const router = new Router();

/**
 * Forwared to the reddit login page
 */
router.get('/api/login', (ctx, next) => {
  const authorizationUri = getLoginUrl(ctx);
  ctx.redirect(authorizationUri);
});

/**
 * Handle the reddit login once authenticated at reddit.com
 * set the cookie and forward to the front page.
 */
router.get('/api/callback', async (ctx, next) => {
  const { code, state, error } = ctx.query;
  const savedState = ctx.session.state;
  ctx.session.state = null;

  if (!code || !state) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: `Code and/or state query strings missing.`,
    };
    return;
  }

  if (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: `Error retrieving the token. ${error}`,
    };
    return;
  }

  if (!savedState) {
    ctx.status = 500;
    ctx.body = { status: 'error', message: 'Saved state not found.' };
    return;
  }

  if (state !== savedState) {
    ctx.status = 500;
    ctx.body = { status: 'error', message: "The state doesn't match." };
    return;
  }

  // Everything looks great. Let's try to get the code.
  const options = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDDIT_CALLBACK_URI,
  };

  try {
    const token = await oauth2.authorizationCode.getToken(options);
    if (token.access_token) {
      // we are good.
      const accessToken = addExtraInfo(token);
      setSessAndCookie(accessToken, ctx);
      ctx.redirect('/');
      return;
    }
  } catch (exception) {
    const message = `Access Token Error ${exception.message}`;
    console.log(message);
    ctx.status = 500;
    ctx.body = { status: 'error', message };
    return;
  }

  ctx.body = 'callback';
});

/**
 * Three things can happen
 *  1. No token exists. Get a new anon token
 *  2. The exisitng token in the session is expired or force refresh is set (?refresh)
 *  3. Refresh the toekn if auth or get a new anon token.
 */
router.get('/api/bearer', async (ctx, next) => {
  const token = decryptToken(ctx.session.token);
  DEBUG && console.log('SESSION', token);

  const loginUrl = getLoginUrl(ctx);

  // No existing token. Get an anon token.
  if (!token) {
    const anonToken = await getAnonToken();
    console.log('ANON GRANTED');
    setSessAndCookie(anonToken, ctx);

    ctx.body = getBearer(anonToken, { type: 'new', loginUrl });
    return;
  }

  // Check if it's expired.
  const tokenExpired = isExpired(token);
  tokenExpired && console.log(`${token.access_token} TOKEN EXPIRED`);

  // Froce refresh?
  const forceRefresh = ctx.query.refresh !== undefined;
  forceRefresh && console.log(`${token.access_token} Forcing a refresh.`);

  // Token is not expired and no forced refresh.
  if (!tokenExpired && !forceRefresh) {
    const returnBearer = token.auth
      ? getBearer(token, { type: 'cached' })
      : getBearer(token, { type: 'cached', loginUrl });

    DEBUG
      ? console.log('TOKEN NOT EXPIRED. RETURN AS IS', returnBearer)
      : console.log(`${token.access_token} TOKEN NOT EXPIRED. RETURN AS IS`);
    ctx.body = returnBearer;
  } else {
    // The token is expired or forced refresh.
    if (token.refresh_token) {
      // Auth user. Get an new token with the refresh token.
      const refreshToken = token.refresh_token;
      const refreshedTokenResult = await getRefreshToken(refreshToken);
      const newToken = {
        ...refreshedTokenResult,
        refresh_token: refreshToken,
      };

      setSessAndCookie(newToken, ctx);

      const returnBody = getBearer(newToken, { type: 'refresh' });
      ctx.body = returnBody;

      newToken.refresh_token = token.refresh_token;

      const msg = 'AUTH EXPIRED or FORCED & REFRESH TOKEN GRANTED';
      DEBUG
        ? console.log(msg, newToken)
        : console.log(msg, newToken.access_token);
    } else {
      const anonToken = await getAnonToken();
      console.log('REFRESH ANON TOKEN GRANTED');
      setSessAndCookie(anonToken, ctx);
      ctx.body = getBearer(anonToken, { type: 'newanon', loginUrl });
      const msg = 'ANON EXPIRED or FORCED & REFRESH TOKEN GRANTED';
      DEBUG ? console.log(msg) : console.log(msg, anonToken.access_token);
    }
  }
});

router.get('/api/logout', async (ctx, next) => {
  const token = decryptToken(ctx.session.token);
  if (token) {
    const accessToken = oauth2.accessToken.create(token);
    // Revoke both access and refresh tokens
    try {
      // Revokes both tokens, refresh token is only revoked if the access_token is properly revoked
      await accessToken.revokeAll();
    } catch (error) {
      console.log('Error revoking token: ', error.message);
    }
    console.log('token detroyed');
  } else {
    console.log('token not found');
  }
  ctx.session.token = null;
  ctx.cookies.set('token');
  return ctx.redirect('/?logout');
});

app.use(router.routes()).use(router.allowedMethods());

http.createServer(app.callback()).listen(PORT);
// https.createServer(app.callback()).listen(PORTSSL);
