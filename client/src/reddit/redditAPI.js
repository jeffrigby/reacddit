import axios from 'axios';
import cookies from 'js-cookie';

const queryString = require('query-string');

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["getToken"] }] */

class RedditAPI {
  constructor() {
    this.redditAPI = axios.create({
      baseURL: 'https://oauth.reddit.com',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

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
    // @todo this can be modernized
    const params = Object.assign(defaults, options);
    Object.keys(params).forEach(
      key => (params[key] == null || params[key] === '') && delete params[key]
    );

    return params;
  }

  /**
   * Get the token out of storage if it's not expired
   * @returns {*}
   */
  static getTokenStorage() {
    let token = null;

    const cookieToken = cookies.getJSON('token');

    if (cookieToken !== undefined) {
      const { expires } = cookieToken;
      const dateTime = Date.now();
      const timestamp = Math.floor(dateTime / 1000);
      if (expires >= timestamp) {
        token = cookieToken.accessToken;
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
    // @todo eslint says this should be static, but I need to access it from redux.
    let token = RedditAPI.getTokenStorage();

    if (token === 'expired' || reset === true || token === null) {
      // token expired or forced refresh. Get a new one.
      const getToken = await axios.get('/api/bearer');
      token = getToken.data.accessToken;
    }

    if (token === null) {
      // Clean up stale values in  storage.
      localStorage.clear();
      sessionStorage.clear();
    }
    return token;
  }

  /**
   *
   * @param subreddit
   * @param sort
   * @param options
   * @returns {Promise<*>}
   */

  async getListingSearch(target, options) {
    const defaults = {
      after: null,
      before: null,
      category: null,
      count: 0,
      include_facets: false,
      limit: 25,
      q: '',
      restrict_sr: true,
      show: 'all',
      sr_detail: false,
      t: null,
      type: null,
      raw_json: 1,
      sort: 'relevance',
    };

    const params = RedditAPI.setParams(defaults, options);

    const data = {
      params,
    };

    let url = '';
    if (target) {
      url = `r/${target}/search`;
    } else {
      url = 'search';
    }

    const result = await this.redditAPI.get(url, data);
    const query = queryString.stringify(params);
    result.data.requestUrl = `${url}?${query}`;
    return result.data;
  }

  async getListingSearchMulti(user, target, options) {
    const defaults = {
      after: null,
      before: null,
      category: null,
      count: 0,
      include_facets: false,
      limit: 25,
      q: '',
      restrict_sr: true,
      show: 'all',
      sr_detail: false,
      t: null,
      type: null,
      raw_json: 1,
      sort: 'relevance',
      is_multi: 1,
    };

    const params = RedditAPI.setParams(defaults, options);

    const data = {
      params,
    };

    let url = '';
    if (user === 'me') {
      url = `me/m/${target}/search`;
    } else {
      url = `/user/${user}/m/${target}/search`;
    }

    const result = await this.redditAPI.get(url, data);
    const query = queryString.stringify(params);
    result.data.requestUrl = `${url}?${query}`;
    return result.data;
  }

  /**
   * Get a listing for a subreddit
   * @param subreddit
   * @param sort
   * @param options
   * @returns {Promise<*>}
   */
  async getListingSubreddit(subreddit, sort, options) {
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

  /**
   * Get a listing for a multi
   * @param user
   * @param name
   * @param sort
   * @param options
   * @returns {Promise<*>}
   */
  async getListingMulti(user, name, sort, options) {
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

    let url = `user/${user}/m/${name}/${sort}`;
    if (user === 'me') {
      url = `me/m/${name}/${sort}`;
    }
    const result = await this.redditAPI.get(url, data);
    const query = queryString.stringify(params);
    result.data.requestUrl = `${url}?${query}`;
    return result.data;
  }

  /**
   * Get a listing for a user
   * @param user
   * @param type
   * @param sort
   * @param options
   * @returns {Promise<*>}
   */
  async getListingUser(user, type, sort, options) {
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

  async getListingDuplicates(article, options) {
    const defaults = {
      after: null,
      before: null,
      count: 0,
      crossposts_only: false,
      sort: 'num_comments', // one of (num_comments, new)
      limit: 25,
      show: 'all',
      sr: null,
      sr_detail: false,
      raw_json: 1,
    };

    const params = RedditAPI.setParams(defaults, options);

    const data = {
      params,
    };

    const url = `duplicates/${article}`;
    const result = await this.redditAPI.get(url, data);
    const query = queryString.stringify(params);
    result.data.requestUrl = `${url}?${query}`;
    return result.data;
  }

  async searchRedditNames(query, options) {
    const defaults = {
      exact: false,
      include_over_18: true,
      include_unadvertisable: true,
      query,
      raw_json: 1,
    };

    const data = {
      params: RedditAPI.setParams(defaults, options),
    };

    const url = `/api/search_reddit_names`;
    const result = await this.redditAPI.get(url, data);
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
   *   subscriber|contributer|moderator|streams default to /subreddits/mine
   *   everything else (default, popular, gold, etc.) removes mine
   * @param options
   * @returns {Promise<*>}
   */
  async subreddits(where, options) {
    const defaults = {
      limit: 100,
      count: null,
      before: null,
      after: null,
      show: null,
      sr_detail: null,
      raw_json: 1,
    };

    const params = RedditAPI.setParams(defaults, options);

    const mine = where.match(/subscriber|contributer|moderator|streams/);
    const data = {
      params,
    };
    const url =
      mine === null ? `/subreddits/${where}` : `/subreddits/mine/${where}`;
    const subredditsGet = await this.redditAPI.get(url, data);
    return subredditsGet.data;
  }

  /**
   * Get the subreddit info
   * @param subreddit - the subreddit to lookup.
   * @param type - the type of info to get
   *   edit|rules|traffic default to ''
   * @param options
   * @returns {Promise<*>}
   */
  async subredditAbout(subreddit, type = '', options = {}) {
    const defaults = {
      raw_json: 1,
    };
    const params = RedditAPI.setParams(defaults, options);

    let url = `/r/${subreddit}/about`;
    if (type.match(/edit|rules|traffic/)) {
      url += `/${type}`;
    }

    const data = {
      params,
    };

    const subredditsAboutGet = await this.redditAPI.get(url, data);
    return subredditsAboutGet.data;
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
   * Subscribe or unsbscribe from a sub.
   * @param name - the sr name(s) comma separated
   * @param action - sub or unsub
   * @returns {Promise<*>}
   */
  async subscribe(name, action = 'sub') {
    const params = {
      sr: name,
      action,
      // skip_initial_defaults: false,
    };
    const subscribe = await this.redditAPI.post(
      '/api/subscribe',
      queryString.stringify(params)
    );
    return subscribe.data;
  }

  /**
   * Get the user's friend list.
   * @param options - params to send
   * @returns {Promise<*>}
   */
  async friends(options = {}) {
    const params = {
      // after: null,
      // before: null,
      // count: 0,
      // limit: 100,
      // show: 'all',
      // sr_detail: false,
      // include_categories: false,
    };
    const friends = await this.redditAPI.get(
      'api/v1/me/friends',
      queryString.stringify(params)
    );

    return friends;
  }

  /**
   * remove a friend
   * @param name - the name of the friend to remove.
   * @returns {Promise<*>}
   */
  removeFriend(name) {
    return this.redditAPI.delete(`/api/v1/me/friends/${name}`);
  }

  /**
   * add a friend
   * @param name - the name of the friend to remove.
   * @returns {Promise<*>}
   */
  addFriend(name) {
    const data = { name };
    return this.redditAPI.put(`/api/v1/me/friends/${name}`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Return reddit user.
   * Reset the cache
   * @returns {Promise<*>}
   */
  async me() {
    const me = await this.redditAPI.get('/api/v1/me');
    return me.data;
  }
}

export default new RedditAPI();
