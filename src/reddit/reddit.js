import axios from 'axios';

class Reddit {
  constructor() {
    this.redditAPI = axios.create({
      baseURL: 'https://oauth.reddit.com',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    this.redditAPI.interceptors.request.use(async (config) => {
      const newConfig = config;
      let token = null;
      const localStorageToken = localStorage.getItem('token');
      if (localStorageToken !== null) {
        const localStorageTokenJson = JSON.parse(localStorageToken);
        const { expires } = localStorageTokenJson;
        const dateTime = Date.now();
        const timestamp = Math.floor(dateTime / 1000);
        if (expires >= timestamp) {
          token = localStorageTokenJson.accessToken;
        }
      }

      if (token === null) {
        const getToken = await axios.get('/json/accessToken');
        token = getToken.data.accessToken.accessToken;
        localStorage.setItem('token', JSON.stringify(getToken.data.accessToken));
      }

      if (token != null) {
        newConfig.headers.Authorization = `Bearer ${token}`;
      }

      return newConfig;
    }, error =>
      // Do something with request error
      Promise.reject(error),
    );
  }

  async subredditMine(where, options) {
    const defaults = {
      limit: 100,
      count: null,
      before: null,
      after: null,
      show: null,
      sr_detail: null,
    };

    const params = Object.assign(defaults, options);
    Object.keys(params).forEach(key => (params[key] == null) && delete params[key]);

    const data = {
      params,
    };
    const url = `/subreddits/mine/${where}`;
    const subredditsGet = await this.redditAPI.get(url, data);
    return subredditsGet.data;
  }

  async me() {
    const me = await this.redditAPI.get('/api/v1/me');
    return me.data;
  }
}

export default new Reddit();
