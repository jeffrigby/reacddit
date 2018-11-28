import axios from 'axios';
import Cookie from 'js-cookie';

const queryString = require('query-string');

class RedditAPI {
  constructor() {
    this.redditAPI = axios.create({
      baseURL: 'https://oauth.reddit.com',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    this.token = {};

    this.redditAPI.interceptors.request.use(
      async config => {
        const newConfig = config;
        const token = await this.getToken(false);

        if (token != null) {
          newConfig.headers.Authorization = `Bearer ${token}`;
        }

        return newConfig;
      },
      error => Promise.reject(error)
    );
  }

  static setParams(defaults, options) {
    const params = Object.assign(defaults, options);
    Object.keys(params).forEach(
      key => (params[key] == null || params[key] === '') && delete params[key]
    );

    return params;
  }

  /**
   * Set the token if query strings are available.
   */
  setTokenWithQS() {
    const parsed = queryString.parse(window.location.search);
    if (parsed.token !== null && parsed.expires) {
      this.setTokenStorage(parsed.token, parsed.expires);
      window.history.replaceState({}, document.title, '/');
      return true;
    }
    return false;
  }

  /**
   * Save the bearer token to cookie
   * @param accessToken
   *   The token to save
   * @param expires
   *   When it expires
   * @returns {{accessToken: *, expires: *}}
   */
  setTokenStorage(accessToken, expires, type) {
    const token = {
      accessToken,
      expires,
      type,
    };

    const tokenJson = JSON.stringify(token);

    // Probably don't need both.
    localStorage.setItem('token', tokenJson);
    Cookie.set('token', tokenJson);

    this.token = token;
    return token;
  }

  /**
   * Get the token out of storage if it's not expired
   * @returns {*}
   */
  static getTokenStorage() {
    let token = null;

    const cookieToken = Cookie.get('token');
    const cookieTokenJson = cookieToken ? JSON.parse(cookieToken) : null;

    if (cookieTokenJson !== null) {
      const { expires } = cookieTokenJson;
      const dateTime = Date.now();
      const timestamp = Math.floor(dateTime / 1000);
      if (expires >= timestamp) {
        token = cookieTokenJson.accessToken;
      } else {
        token = 'expired';
      }
    }
    return token;
  }

  /**
   * Get the token from cookie if possible, if not get it from
   * the server.
   * @param reset - Always get it from the server.
   * @returns {Promise<*>}
   */
  async getToken(reset) {
    // Query strings should take precedence.
    this.setTokenWithQS();

    let token = RedditAPI.getTokenStorage();

    if (token === 'expired' || reset === true || token === null) {
      // token expired or forced refresh. Get a new one.
      const getToken = await axios.get('/json/bearer');
      token = getToken.data.accessToken;
      if (token) {
        this.setTokenStorage(token, getToken.data.expires, getToken.data.type);
      }
    }

    if (token === null) {
      // Clean up stale values in  storage.
      Cookie.remove('token');
      localStorage.clear();
      sessionStorage.clear();
    }

    this.token = token;
    return token;
  }

  async getSubredditListing(subreddit, sort, options) {
    const defaults = {
      after: null,
      before: null,
      count: 0,
      include_categories: false,
      limit: 25,
      show: 'all',
      sr_detail: false,
      raw_json: 1,
    };

    const params = RedditAPI.setParams(defaults, options);

    const data = {
      params,
    };

    let url = '';
    if (subreddit) {
      url = `/r/${subreddit}/${sort}`;
    } else {
      url = sort;
    }

    const result = await this.redditAPI.get(url, data);
    const query = queryString.stringify(params);
    result.data.requestUrl = `${url}?${query}`;
    return result.data;
  }

  async getMultiListing(user, name, sort, options) {
    const defaults = {
      after: null,
      before: null,
      count: 0,
      include_categories: false,
      limit: 25,
      show: 'all',
      sr_detail: false,
      raw_json: 1,
    };

    const params = RedditAPI.setParams(defaults, options);

    const data = {
      params,
    };

    const me = await this.me(false);

    let url = `user/${user}/m/${name}/${sort}`;
    if (me.name === user) {
      url = `me/m/${name}/${sort}`;
    }
    const result = await this.redditAPI.get(url, data);
    const query = queryString.stringify(params);
    result.data.requestUrl = `${url}?${query}`;
    return result.data;
  }

  async getUserListing(user, type, sort, options) {
    const defaults = {
      after: null,
      before: null,
      count: 0,
      include_categories: false,
      limit: 25,
      show: 'all',
      sr_detail: false,
      raw_json: 1,
    };

    const params = RedditAPI.setParams(defaults, options);

    const data = {
      params,
    };

    const url = `user/${user}/${type}/${sort}`;
    const result = await this.redditAPI.get(url, data);
    const query = queryString.stringify(params);
    result.data.requestUrl = `${url}?${query}`;
    return result.data;
  }

  /**
   * Get the logged in users mutlireddits
   * @param options
   * @returns {Promise<*>}
   */
  async multiMine(options) {
    const defaults = {
      expand_srs: false,
    };

    const params = RedditAPI.setParams(defaults, options);

    const data = {
      params,
    };
    const url = '/api/multi/mine';
    const multiGet = await this.redditAPI.get(url, data);
    return multiGet.data;
  }

  /**
   * Get the users subreddits
   * @param where - the type of subreddits
   * @param options
   * @returns {Promise<*>}
   */
  async subredditMine(where, options) {
    const defaults = {
      limit: 100,
      count: null,
      before: null,
      after: null,
      show: null,
      sr_detail: null,
    };

    const params = RedditAPI.setParams(defaults, options);

    const data = {
      params,
    };
    const url = `/subreddits/mine/${where}`;
    const subredditsGet = await this.redditAPI.get(url, data);
    return subredditsGet.data;
  }

  /**
   * Vote on content
   * @param id - The name of the content to vote on
   * @param dir
   *  1 = Vote Up
   *  -1 = Vote down
   *  0 = Remove vote
   * @returns {Promise<*>}
   */
  async vote(id, dir) {
    const params = {
      dir,
      id,
      rank: 1,
    };

    const vote = await this.redditAPI.post(
      '/api/vote',
      queryString.stringify(params)
    );
    return vote.data;
  }

  /**
   * Save an entry
   * @param id - the entry to save
   * @returns {Promise<*>}
   */
  async save(id) {
    const save = await this.redditAPI.post(
      '/api/save',
      queryString.stringify({ id })
    );
    return save.data;
  }

  /**
   * Unsave an entry
   * @param id - the entry to unsave
   * @returns {Promise<*>}
   */
  async unsave(id) {
    const save = await this.redditAPI.post(
      '/api/unsave',
      queryString.stringify({ id })
    );
    return save.data;
  }

  /**
   * Return reddit user.
   * @param reset
   * Reset the cache
   * @returns {Promise<*>}
   */
  async me(reset) {
    const token = await this.getToken();
    // @todo Remove this caching. Already cached in redux.
    const cacheKey = `me_${token}`;
    if (reset !== true) {
      const meCached = sessionStorage.getItem(cacheKey);
      if (meCached !== null) {
        return JSON.parse(meCached);
      }
    }
    const me = await this.redditAPI.get('/api/v1/me');
    sessionStorage.setItem(cacheKey, JSON.stringify(me.data));
    return me.data;
  }
}

export default new RedditAPI();
