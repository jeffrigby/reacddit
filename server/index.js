const http = require('http');
// const https = require('https');
const Koa = require('koa');
const Router = require('koa-router');
const session = require('koa-session');
const uuidv4 = require('uuid/v4');
const rp = require('request-promise');

require('dotenv').config();

const {
  REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET,
  REDDIT_CALLBACK_URI,
  REDDIT_SCOPE,
  APP_KEY,
  SESSION_LENGTH_SECS,
  PORT,
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
  rolling: false /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */,
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

const isExpired = token => {
  const now = Date.now() / 1000;
  if (token.expires > now) {
    return false;
  }
  return true;
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

const getBearer = (accessToken, params = {}) => ({
  accessToken: accessToken.access_token,
  expires: accessToken.expires,
  auth: accessToken.auth,
  ...params,
});

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

const router = new Router();

router.get('/api/login', (ctx, next) => {
  const authorizationUri = getLoginUrl(ctx);
  ctx.redirect(authorizationUri);
});

router.get('/api/callback', async (ctx, next) => {
  const { code, state, error } = ctx.query;
  const savedState = ctx.session.state;
  ctx.session.state = null;
  if (error) {
    return (ctx.body = `Error retrieving the token. ${error}`);
  }

  if (!ctx.session.savedState) {
    ctx.body = `Saved state not found.`;
  }

  if (state !== savedState) {
    return (ctx.body = `The state does not match.`);
  }

  const options = {
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDDIT_CALLBACK_URI,
  };

  try {
    const token = await oauth2.authorizationCode.getToken(options);
    if (token.access_token) {
      const accessToken = addExtraInfo(token);
      ctx.session.token = accessToken;
      const url = `/?token=${accessToken.access_token}&expires=${
        accessToken.expires
      }`;
      return ctx.redirect(url);
    }
  } catch (error) {
    console.error('Access Token Error', error.message);
    return res.status(500).json('Authentication failed');
  }

  ctx.body = 'callback';
});

router.get('/api/bearer', async (ctx, next) => {
  const { token } = ctx.session;
  const loginUrl = getLoginUrl(ctx);

  if (!token) {
    const anonToken = await getAnonToken();
    console.log('ANON GRANTED');
    ctx.session.token = anonToken;
    ctx.body = getBearer(anonToken, { type: 'new', loginUrl });
    return;
  }

  // Check if it's expired.
  const tokenExpired = isExpired(token);

  // Token is not expired. Return as is.
  if (!tokenExpired) {
    // return the token as is.
    if (token.auth) {
      ctx.body = getBearer(token, { type: 'cached' });
    } else {
      ctx.body = getBearer(token, { type: 'cached', loginUrl });
    }
  }

  // Get a new anonymous token.
  if (tokenExpired && !token.refresh_token) {
    const anonToken = await getAnonToken();
    console.log('REFRESH ANON TOKEN GRANTED');
    ctx.session.token = anonToken;
    ctx.body = getBearer(anonToken, { type: 'newanon', loginUrl });
  }

  // Refresh Authenticated Token.
  if (tokenExpired && token.refresh_token) {
    const refreshToken = token.refresh_token;
    const newToken = await getRefreshToken(refreshToken);
    console.log('REFRESH TOKEN GRANTED');
    ctx.session.token = newToken;
    ctx.body = getBearer(newToken, { type: 'refresh' });
  }
});

router.get('/api/logout', async (ctx, next) => {
  const { token } = ctx.session;
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
  ctx.cookies.set('token', '');
  return ctx.redirect('/?logout');
});

app.use(router.routes()).use(router.allowedMethods());

http.createServer(app.callback()).listen(PORT);
// https.createServer(app.callback()).listen(PORTSSL);
