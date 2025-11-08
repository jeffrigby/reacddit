import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import queryString from 'query-string';
import { useAppSelector } from '@/redux/hooks';
import {
  useGetSubredditsQuery,
  subredditSelectors,
  useGetSubredditAboutQuery,
} from '@/redux/api';
import SubUnSub from './SubUnSub';
import MultiToggle from './MultiToggle';

function ListingsHeaderSub() {
  const redditBearer = useAppSelector((state) => state.redditBearer);
  const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';

  const filter = useAppSelector((state) => state.listings.currentFilter);
  const { target, listType, multi } = filter;

  // Use RTK Query hook to get cached subreddit data from subreddit list
  const { cachedSub } = useGetSubredditsQuery(
    { where },
    {
      selectFromResult: ({ data }) => ({
        cachedSub:
          data && target
            ? subredditSelectors.selectById(data, target.toLowerCase())
            : null,
      }),
    }
  );

  // Fetch subreddit about data (this will use cached data if available from Listings.tsx)
  const { data: about = {} } = useGetSubredditAboutQuery(
    {
      subreddit: target ?? '',
      listType,
      multi: multi ?? false,
    },
    {
      skip: !target || listType !== 'r',
    }
  );

  const { user } = filter;

  let title: string | React.ReactNode = '';
  let subInfo: string | undefined;
  let searchEverywhere: React.ReactNode | undefined;
  let showSubInfo = false;
  let pageTitle = '';

  switch (listType) {
    case 'u':
      pageTitle = `u/${user}: ${
        target.charAt(0).toUpperCase() + target.slice(1)
      }`;
      title = `/u/${user} ${target}`;
      break;
    case 'r': {
      // Title
      if (target === 'mine') {
        pageTitle = 'reacddit';
      } else {
        pageTitle = target;
      }

      if (target === 'friends') {
        title = 'My Friends';
      } else if (target === 'popular') {
        title = 'Popular Posts';
      } else if (target === 'mine') {
        title = (
          <>
            <span className="react">reac</span>
            <span className="reddit">ddit</span>: Home
          </>
        );
      } else {
        // Try to get data from about, fallback to cachedSub if available
        const subscriberCount =
          about?.subscribers ?? cachedSub?.subscribers ?? null;

        // Reddit uses different field names for active users - try both
        const onlineCount =
          about?.active_user_count ??
          about?.accounts_active ??
          cachedSub?.active_user_count ??
          cachedSub?.accounts_active ??
          null;

        const subscribers =
          subscriberCount !== null
            ? `${subscriberCount.toLocaleString()} Subscribers`
            : '';
        const online =
          onlineCount !== null ? `${onlineCount.toLocaleString()} Online` : '';

        showSubInfo = true;

        // Build subInfo with whatever data is available
        if (subscribers && online) {
          subInfo = `${subscribers} - ${online}`;
        } else if (subscribers) {
          subInfo = subscribers;
        } else if (online) {
          subInfo = online;
        }

        title = `/r/${target}`;
      }
      break;
    }
    case 'm':
      title = `/m/${target}`;
      break;
    case 's': {
      const qs = queryString.parse(window.location.search);
      searchEverywhere =
        target !== 'mine' ? (
          <NavLink to={`/search?q=${qs.q}`}>Search Everywhere</NavLink>
        ) : undefined;
      title = `Search results for '${qs.q}'`;
      if (multi) {
        title += ` in /m/${target}`;
      } else if (target !== 'mine') {
        title += ` in /r/${target}`;
      }
      pageTitle = typeof title === 'string' ? title : '';
      break;
    }
    default:
      pageTitle = 'reacddit';
      title = '';
      break;
  }

  // Set document title in useEffect
  useEffect(() => {
    if (pageTitle) {
      document.title = pageTitle;
    }
  }, [pageTitle]);

  // Only show loading placeholder if we're expecting subscriber data
  const renderedSubInfo = subInfo ? (
    <span>{subInfo}</span>
  ) : showSubInfo ? (
    <span className="loading-placeholder">Loading Members</span>
  ) : null;

  const description =
    cachedSub?.public_description ?? about?.public_description;
  const subhead = cachedSub?.title ?? about?.title;

  return (
    <>
      <div className="d-flex">
        <div className="me-auto title-contrainer">
          <h5 className="m-0 p-0 w-100">
            {title} {searchEverywhere && <>- {searchEverywhere}</>}
          </h5>
        </div>
        <div>
          <div className="listing-actions ps-2 d-flex flex-nowrap">
            {listType === 'r' && target !== 'mine' && (
              <>
                <SubUnSub />
                <MultiToggle srName={target} />
              </>
            )}
          </div>
        </div>
      </div>
      {showSubInfo && (
        <div>
          <small>{renderedSubInfo}</small>
        </div>
      )}
      {subhead && (
        <div>
          <small>
            <strong>{subhead}</strong>
          </small>
        </div>
      )}
      {description && (
        <div>
          <small>{description}</small>
        </div>
      )}
    </>
  );
}

export default ListingsHeaderSub;
