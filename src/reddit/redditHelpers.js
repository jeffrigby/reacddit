import RedditAPI from './redditAPI';

class RedditHelpers {
  static mapSubreddits(children) {
    return Object.entries(children)
      .map(([key, value]) => value.data)
      .reduce((ac, s) => ({ ...ac, [s.display_name.toLowerCase()]: s }), {});
  }

  static async subredditsAll(where, options, reset) {
    let init = true;
    let qsAfter = null;
    let srs = null;
    let subreddits = {};

    const show = options.show ? 't' : 'f';
    const srd = options.sr_detail ? 't' : 'f';

    // Look for session cached version
    const cacheKey = `subreddits_${where}_${show}${srd}`;
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
      srs = await RedditAPI.subreddits(where, newOptions);
      const mapped = RedditHelpers.mapSubreddits(srs.data.children);
      subreddits = Object.assign(mapped, subreddits);
      qsAfter = srs.data.after || null;
    }

    // Sort by alpha
    const subredditsOrdered = {};
    Object.keys(subreddits)
      .sort()
      .forEach(key => {
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
