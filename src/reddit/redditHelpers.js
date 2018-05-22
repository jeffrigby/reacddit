import RedditAPI from './redditAPI';

const hash = require('object-hash');

class RedditHelpers {
  static mapSubreddits(children) {
    return Object.keys(children).map(objectKey => children[objectKey].data)
      .reduce((ac, s) => ({ ...ac, [s.display_name.toLowerCase()]: s }), {});
  }

  static async multiMine(options, reset) {
    const cacheKey = 'multis_'.concat(hash({ options }));
    const cachedValue = sessionStorage.getItem(cacheKey);
    if (cachedValue !== null && reset !== true) {
      const cachedObject = JSON.parse(cachedValue);
      const multiReturn = {
        cached: 1,
        data: cachedObject,
      };
      return multiReturn;
    }

    const multis = await RedditAPI.multiMine(options);
    sessionStorage.setItem(cacheKey, JSON.stringify(multis));

    const multiReturn = {
      cached: 0,
      data: multis,
    };

    return multiReturn;
  }

  static async subredditMineAll(where, options, reset) {
    let init = true;
    let qsAfter = null;
    let srs = null;
    let subreddits = {};

    const hashKey = {
      where,
      options,
    };

    // Look for session cached version
    const cacheKey = 'subreddits_'.concat(hash(hashKey));
    const cachedValue = sessionStorage.getItem(cacheKey);
    // console.log(reset, cacheKey);
    if (cachedValue !== null && reset !== true) {
      const cachedObject = JSON.parse(cachedValue);
      const subredditsReturn = {
        cached: 1,
        subreddits: cachedObject,
      };
      // console.log('cached');
      return subredditsReturn;
    }

    // console.log('uncached');

    const newOptions = options || {};

    /* eslint-disable no-await-in-loop */
    while (init || qsAfter) {
      init = false;
      newOptions.after = qsAfter;
      srs = await RedditAPI.subredditMine(where, newOptions);
      const mapped = RedditHelpers.mapSubreddits(srs.data.children);
      subreddits = Object.assign(mapped, subreddits);
      qsAfter = srs.data.after || null;
    }

    // Sort by alpha
    const subredditsOrdered = {};
    Object.keys(subreddits).sort().forEach((key) => {
      subredditsOrdered[key] = subreddits[key];
    });

    sessionStorage.setItem(cacheKey, JSON.stringify(subredditsOrdered));

    const subredditsReturn = {
      cached: 0,
      subreddits: subredditsOrdered,
    };

    return subredditsReturn;
  }
}

export default RedditHelpers;
