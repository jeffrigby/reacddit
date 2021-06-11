import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import { useLocation, useParams } from 'react-router';
import throttle from 'lodash/throttle';
import ListingsLogic from './ListingsLogic';
import {
  listingsFetchEntriesReddit,
  listingsFetchRedditNew,
  listingsFetchRedditNext,
  listingsFilter,
} from '../../redux/actions/listings';
import {
  listingData,
  listingStatus,
} from '../../redux/selectors/listingsSelector';
import { hotkeyStatus } from '../../common';
import ListingsHeader from './ListingsHeader';
import PostsDebug from './PostsDebug';
import '../../styles/listings.scss';
import Posts from '../posts/postsContainer/Posts';
import { ListingsContextLastExpanded } from '../../contexts';

const queryString = require('query-string');

const Listings = ({ data, status, filter, settings }) => {
  const location = useLocation();
  const match = useParams();
  const dispatch = useDispatch();
  const [lastExpanded, setLastExpanded] = useState('');

  const { listType, target, sort, user, userType, multi, postName, comment } =
    match;

  // Set title for detail pages
  if (data.originalPost) {
    const origTitle = data.originalPost.data.title;
    const origSub = data.originalPost.data.subreddit;
    document.title = `${origTitle} : ${origSub}`;
  }

  // Set the new filter.
  useEffect(() => {
    const qs = queryString.parse(location.search);

    let listingType = listType || 'r';
    if (listType === 'user') listingType = 'u';
    if (listType === 'multi') listingType = 'm';
    if (listType === 'search') listingType = 's';

    // Set to best if it's the front page.
    const getSort = sort || qs.sort || (target ? 'hot' : 'best');

    const newFilter = {
      sort: getSort,
      target: target || 'mine',
      multi: multi === 'm' || false,
      userType: userType || '',
      user: user || '',
      listType: listingType,
      qs: location.search,
      postName: postName || '',
      comment: comment || '',
    };

    dispatch(listingsFilter(newFilter));
  }, [
    listType,
    target,
    sort,
    user,
    userType,
    multi,
    location,
    dispatch,
    postName,
    comment,
  ]);

  // Get new posts if the filter changes.
  useEffect(() => {
    if (!filter.target) return;
    setLastExpanded('');
    dispatch(listingsFetchEntriesReddit(filter));
  }, [filter, dispatch]);

  // Check if I should stream entries
  useEffect(() => {
    const streamNewPosts = async () => {
      // Don't stream when you scroll down.
      if (window.scrollY > 10) return;
      dispatch(listingsFetchRedditNew(true));
    };

    let streamNewPostsInterval;
    if (settings.stream) {
      streamNewPostsInterval = setInterval(streamNewPosts, 5000);
    } else if (streamNewPostsInterval) {
      clearInterval(streamNewPostsInterval);
    }
    return () => {
      clearInterval(streamNewPostsInterval);
    };
  }, [settings.stream, dispatch]);

  const moreLoading = useRef(false);

  // Check if I should load new entries
  useEffect(() => {
    const loadMore = async () => {
      if (
        window.scrollY + window.innerHeight >
          document.documentElement.scrollHeight - 2500 &&
        status === 'loaded' &&
        !moreLoading.current
      ) {
        moreLoading.current = true;
        await dispatch(listingsFetchRedditNext());
        // Give it a few seconds to reneder before turning it off to avoid re-renders.
        setTimeout(() => {
          moreLoading.current = false;
        }, 2000);
      }
    };

    const loadMoreThrottled = throttle(loadMore, 500);

    if (status === 'loaded') {
      window.addEventListener('resize', loadMoreThrottled, false);
      document.addEventListener('scroll', loadMoreThrottled, false);
    } else {
      window.removeEventListener('resize', loadMoreThrottled, false);
      document.removeEventListener('scroll', loadMoreThrottled, false);
    }
    return () => {
      window.removeEventListener('resize', loadMoreThrottled, false);
      document.removeEventListener('scroll', loadMoreThrottled, false);
    };
  }, [status, dispatch]);

  // Set some hotkeys
  const hotkeys = (event) => {
    if (hotkeyStatus() && (status === 'loaded' || status === 'loadedAll')) {
      const pressedKey = event.key;
      try {
        switch (pressedKey) {
          case '.':
            window.scrollTo(0, 0);
            dispatch(listingsFetchRedditNew());
            break;
          case '/':
            window.scrollTo(0, document.body.scrollHeight);
            break;
          default:
            break;
        }
      } catch (e) {
        // console.log(e);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', hotkeys);
    return () => {
      document.removeEventListener('keydown', hotkeys);
    };
  });

  const locationKey = location.key || 'front';
  return (
    <ListingsContextLastExpanded.Provider
      value={[lastExpanded, setLastExpanded]}
    >
      <div className="list-group" id="entries">
        <ListingsHeader />
        <Posts key={locationKey} />
        <ListingsLogic saved={data.saved} />
      </div>
      <PostsDebug />
    </ListingsContextLastExpanded.Provider>
  );
};

Listings.propTypes = {
  data: PropTypes.object.isRequired,
  status: PropTypes.string.isRequired,
  filter: PropTypes.object.isRequired,
  settings: PropTypes.object,
};

Listings.defaultProps = {
  settings: { debug: false, view: 'expanded' },
};

const mapStateToProps = (state) => ({
  data: listingData(state),
  status: listingStatus(state),
  settings: state.siteSettings,
  filter: state.listingsFilter,
});

export default connect(mapStateToProps, null)(Listings);
