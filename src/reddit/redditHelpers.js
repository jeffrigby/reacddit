import Reddit from './reddit';

class RedditHelpers {
  static mapSubreddits(children) {
    return Object.keys(children).map(objectKey => children[objectKey].data)
      .reduce((ac, s) => ({ ...ac, [s.display_name.toLowerCase()]: s }), {});
  }

  static async subredditMineAll(where, options) {
    let init = true;
    let qsAfter = null;
    let srs = null;
    let subreddits = {};

    const newOptions = options || {};

    /* eslint-disable no-await-in-loop */
    while (init || qsAfter) {
      init = false;
      newOptions.after = qsAfter;
      srs = await Reddit.subredditMine(where, newOptions);
      const mapped = RedditHelpers.mapSubreddits(srs.data.children);
      subreddits = Object.assign(mapped, subreddits);
      qsAfter = srs.data.after || null;
    }

    // Sort by alpha
    const subredditsOrdered = {};
    Object.keys(subreddits).sort().forEach((key) => {
      subredditsOrdered[key] = subreddits[key];
    });

    const subredditsReturn = {
      cached: 0,
      subreddits: subredditsOrdered,
    };

    return subredditsReturn;
  }
}

export default RedditHelpers;
