import axios from 'axios';
import cookies from 'js-cookie';
import queryString from 'query-string';

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
      async (config) => {
        const newConfig = config;
        const { token } = await this.getToken(false);

        if (token != null) {
          newConfig.headers.Authorization = `Bearer ${token}`;
        }

        return newConfig;
      },
      (error) => Promise.reject(error)
    );
  }

  static setParams(defaults, options) {
    const params = { ...defaults, ...options };
    Object.keys(params).forEach(
      (key) =>
        (params[key] === null || params[key] === '') && delete params[key]
    );
    return params;
  }

  /**
   * Get the token out of storage if it's not expired
   * @returns {*}
   */
  static getTokenStorage() {
    let token = null;

    const cookieToken = cookies.get('token');
    let cookieTokenParsed = {};

    if (cookieToken !== undefined) {
      cookieTokenParsed = JSON.parse(cookieToken);
      const { expires } = cookieTokenParsed;
      const dateTime = Date.now();
      const timestamp = Math.floor(dateTime / 1000);
      if (expires >= timestamp) {
        token = cookieTokenParsed.accessToken;
      } else {
        token = 'expired';
      }
    }
    return { token, cookieTokenParsed };
  }

  /**
   * Get the token from cookie if possible, if not get it from
   * the server.
   * @param reset - Always get it from the server.
   * @returns {Promise<*>}
   */
  async getToken(reset) {
    // @todo eslint says this should be static, but I need to access it from redux.
    let { token } = RedditAPI.getTokenStorage();
    const { cookieTokenParsed } = RedditAPI.getTokenStorage();

    if (token === 'expired' || reset === true || token === null) {
      // token expired or forced refresh. Get a new one.
      const getToken = await axios.get(`${process.env.API_PATH}/bearer`);
      token = getToken.data.accessToken;
    }

    if (token === null) {
      // Clean up stale values in  storage.
      localStorage.clear();
      sessionStorage.clear();
    }
    return { token, cookieTokenParsed };
  }

  /**
   * Helper function to grab the loginURL from the cookie to avoid
   * @returns string the full URL to login
   */
  // eslint-disable-next-line class-methods-use-this
  getLoginUrl() {
    const { loginURL } = JSON.parse(cookies.get('token'));
    return loginURL;
  }

  /**
   *
   * @param target
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

    const url = target ? `r/${target}/search` : 'search';

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

    const url =
      user === 'me'
        ? `me/m/${target}/search`
        : `/user/${user}/m/${target}/search`;

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

    const url = subreddit ? `/r/${subreddit}/${sort}` : sort;
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

    const url = `user/${user}/${type}?sort=${sort}`;
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

  async searchSubreddits(query, options) {
    const defaults = {
      exact: false,
      include_over_18: false,
      include_unadvertisable: true,
      query,
      raw_json: 1,
    };

    const data = {
      params: RedditAPI.setParams(defaults, options),
    };

    const url = `/api/search_subreddits`;
    const result = await this.redditAPI.post(
      url,
      queryString.stringify(data.params),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
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
   * Add a custom feed.
   * @param name - a string no longer than 50 characters
   * @param description - raw markdown text to describe the feed.
   * @param visibility - private, public or hidden
   * @returns {Promise<*>}
   */
  async multiAdd(name, description, visibility) {
    const url = '/api/multi';
    const data = {
      model: JSON.stringify({
        description_md: description,
        display_name: name,
        visibility,
      }),
    };
    return this.redditAPI.post(url, queryString.stringify(data), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  /**
   * Delete a custom feed
   * @param multipath - multireddit url path
   * @returns {Promise<*>}
   */
  async multiDelete(multipath) {
    const path = multipath.replace(/^\/+/, '');
    const url = `/api/multi/${path}`;
    return this.redditAPI.delete(url);
  }

  /**
   * Get a multis info.
   * @param multiPath
   * @returns {Promise<*>}
   */
  async multiInfo(multiPath) {
    const url = `/api/multi/${multiPath}`;
    return this.redditAPI.get(url);
  }

  /**
   * Add a subreddit to a multi
   * @param multiPath the full path of the multi
   * @param srName the subreddit name
   * @returns {Promise<void>}
   */
  async multiAddSubreddit(multiPath, srName) {
    const cleanPath = multiPath.replace(/(^\/|\/$)/g, '');
    const url = `/api/multi/${cleanPath}/r/${srName}`;
    const data = { model: JSON.stringify({ name: srName }) };
    return this.redditAPI.put(url, queryString.stringify(data), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }

  /**
   * Remove a subreddit to a multi
   * @param multiPath the full path of the multi
   * @param srName the subreddit name
   * @returns {Promise<void>}
   */
  async multiRemoveSubreddit(multiPath, srName) {
    const cleanPath = multiPath.replace(/(^\/|\/$)/g, '');
    const url = `/api/multi/${cleanPath}/r/${srName}`;
    return this.redditAPI.delete(url);
  }

  async favorite(makeFavorite, srName) {
    const fav = makeFavorite ? 'true' : 'false';
    const data = {
      make_favorite: fav,
      sr_name: srName,
    };
    return this.redditAPI.post('/api/favorite', queryString.stringify(data), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
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
   * Helper function to subcirbe to a subreddit by name.
   * @param {string} name - The name to subscribe to.
   * @param {string} [action='sub'] - The action to perform for the subscription.
   * @returns {Promise<any>} - A Promise that resolves when the subscription is successful.
   */
  async sunscribeByName(name, action = 'sub') {
    return this.subscribe(name, action, 'sr_name');
  }

  /**
   * Subscribe or unsbscribe from a sub.
   * @param {string} name - the sr name(s) comma separated
   * @param {('sub' | 'unsub')} action - Subscribe or unsubscribe
   * @param {('sr' | 'sr_name')} type - Is the name an ID or a full name?
   * @returns {Promise<*>}
   */
  async subscribe(name, action = 'sub', type = 'sr') {
    const validActions = ['sub', 'unsub'];
    const validTypes = ['sr', 'sr_name'];

    if (!validActions.includes(action)) {
      throw new Error('Invalid action passed to subscribe');
    }

    if (!validTypes.includes(type)) {
      throw new Error('Invalid type passed to subscribe');
    }

    const params = { action };
    params[type] = name;

    const subscribe = await this.redditAPI.post(
      '/api/subscribe',
      queryString.stringify(params)
    );
    return subscribe.data;
  }

  /**
   * Get the user's friend list. DEPRECATED
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
    return this.redditAPI.get(
      'api/v1/me/friends',
      queryString.stringify(params)
    );
  }

  /**
   * remove a friend DEPRECATED
   * @param name - the name of the friend to remove.
   * @returns {Promise<*>}
   */
  removeFriend(name) {
    return this.redditAPI.delete(`/api/v1/me/friends/${name}`);
  }

  /**
   * add a friend DEPRECATED
   * @param name - the name of the friend to remove.
   * @returns {Promise<*>}
   */
  async addFriend(name) {
    const data = { name, note: null };
    return this.redditAPI.put(`/api/v1/me/friends/${name}`, data, {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /**
   * Follow/unfollow a user on Reddit.
   * @param {string} name - The username of the user to follow.
   * @param {('sub' | 'unsub')} action - The action to perform. Defaults to 'sub'. Can be 'sub' or 'unsub'.
   * @returns {Promise<any>} - A promise that resolves to the API response data.
   */
  async followUser(name, action = 'sub') {
    return this.subscribe(name, action, 'sr_name');
  }

  /**
   * Return reddit user.
   * Reset the cache
   * @returns {Promise<*>}
   */
  async me() {
    // cache buster is to prevent Firefox from caching this request.
    const me = await this.redditAPI.get(`/api/v1/me?cb=${Date.now()}`);
    return me.data;
  }

  async getComments(target, postName, comment, options) {
    const defaults = {
      raw_json: 1,
      comment: comment || null,
    };
    const params = RedditAPI.setParams(defaults, options);
    const data = {
      params,
    };

    const comments = await this.redditAPI.get(
      `r/${target}/comments/${postName}/`,
      data
    );

    return comments.data;
  }

  async getMoreComments(linkID, children, options) {
    const defaults = {
      link_id: linkID,
      children: children.join(','),
      raw_json: 1,
      api_type: 'json',
      depth: null,
      id: null,
      limit_children: false,
    };
    const params = RedditAPI.setParams(defaults, options);
    const data = {
      params,
    };
    return this.redditAPI.get(`api/morechildren`, data);
  }
}

export default new RedditAPI();
