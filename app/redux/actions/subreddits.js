require('es6-promise').polyfill();
require('isomorphic-fetch');
import Promise from 'es6-promise';

export function subredditsHasErrored(bool) {
    return {
        type: 'SUBREDDITS_HAS_ERRORED',
        hasErrored: bool
    };
}
export function subredditsIsLoading(bool) {
    return {
        type: 'SUBREDDITS_IS_LOADING',
        isLoading: bool
    };
}

export function subredditsFetchDataSuccess(subreddits) {
    return {
        type: 'SUBREDDITS_FETCH_DATA_SUCCESS',
        subreddits
    };
}

export function subredditsFilter(filter) {
    return {
        type: 'SUBREDDITS_FILTER',
        filter
    };
}

export function subredditsCurrent(subreddit) {
    return {
        type: 'SUBREDDITS_CURRENT_SUBREDDIT',
        subreddit
    };
}

export function subredditsLastUpdated(lastUpdated) {
    return {
        type: 'SUBREDDITS_LAST_UPDATED',
        lastUpdated
    };
}

export function subredditsFetchLastUpdated(subreddits, lastUpdated = {}) {
    return (dispatch) => {
        const runUpdate = (urls) => {
            Promise.all(urls)
                .then((results) => {
                    // we only get here if ALL promises fulfill
                    results.forEach((item) => {
                        // process item
                        if (typeof item.data.children[0] === 'object') {
                            const created = item.data.children[0].data.created_utc;
                            const subredditId = item.data.children[0].data.subreddit_id;
                            lastUpdated[subredditId] = created;
                        }
                    });
                    return lastUpdated;
                })
                .then(lastUpdatedRes => dispatch(subredditsLastUpdated(lastUpdatedRes)))
                .catch(() => {
                    // console.log('Failed:', err);
                    // Add some error shit here.
                });
        };

        const urls = [];
        let i = 0;
        for (const prop in subreddits) {
            if (subreddits.hasOwnProperty(prop)) {
                const value = subreddits[prop];
                if (value.url !== '/r/mine' && value.quarantine === false) {
                    const url = 'https://www.reddit.com' + value.url + 'new.json?limit=1&sort=new';
                    urls.push(
                        new Promise((resolve, reject) => {
                            fetch(url).then(response => resolve(response.json())).catch((e) => reject(e));
                        }));
                    i++;
                    if (i >= 50) {
                        runUpdate(urls);
                        i = 0;
                        urls.length = 0;
                    }
                }
            }
        }

        if (urls.length > 0) {
            runUpdate(urls);
        }
    };
}

export function subredditsFetchDefaultData() {
    const url = 'https://www.reddit.com/subreddits/default.json?limit=100';
    return (dispatch) => {
        dispatch(subredditsIsLoading(true));
        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                dispatch(subredditsIsLoading(false));
                return response;
            })
            .then(response => response.json())
            .then((json) => {
                const subreditObj =  json.data.children;
                const subreddits = [];
                for (const prop in subreditObj) {
                    if (subreditObj.hasOwnProperty(prop)) {
                        subreddits.push(subreditObj[prop].data);
                    }
                }
                subreddits.sort((a, b) => {
                    if(a.display_name.toLowerCase() < b.display_name.toLowerCase()) return -1;
                    if(a.display_name.toLowerCase() > b.display_name.toLowerCase()) return 1;
                    return 0;
                });

                // convert it back to an object
                const subredditsKey = {};
                subreddits.forEach((item) => {
                    subredditsKey[item.display_name] = item;
                });

                dispatch(subredditsFetchDataSuccess(subredditsKey));
                return subreddits;
            })
            .then(subreddits => dispatch(subredditsFetchLastUpdated(subreddits)))
            .catch(() => {dispatch(subredditsHasErrored(true));});
    };
}

export function subredditsFetchData(reset) {
    return (dispatch) => {
        let url = '/json/subreddits/lean';
        if (reset === true) {
            url += '/true';
        }
        dispatch(subredditsIsLoading(true));

        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                dispatch(subredditsIsLoading(false));
                return response;
            })
            .then(response => response.json())
            .then((json) => {
                const subreddits = json.subreddits;
                const subredditsKey = {};
                subreddits.forEach((item) => {
                    subredditsKey[item.subreddit_id] = item;
                });

                dispatch(subredditsFetchDataSuccess(subredditsKey));
                return subredditsKey;
            })
            .then(subreddits => dispatch(subredditsFetchLastUpdated(subreddits)))
            .catch(() => {dispatch(subredditsHasErrored(true));});
    };
}

