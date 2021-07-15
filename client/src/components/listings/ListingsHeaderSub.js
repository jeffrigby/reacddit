import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SubUnSub from './SubUnSub';
import MultiToggle from './MultiToggle';
import {
  getCurrentSubreddit,
  getCachedSub,
} from '../../redux/selectors/subredditSelectors';

const queryString = require('query-string/index');

const ListingsHeaderSub = () => {
  const about = useSelector((state) => getCurrentSubreddit(state));
  const filter = useSelector((state) => state.listingsFilter);
  const cachedSub = useSelector((state) => getCachedSub(state));

  const { listType, target, multi, user } = filter;

  let title = '';
  let subInfo;
  let searchEverywhere;
  let showSubInfo = false;
  switch (listType) {
    case 'u':
      document.title = `u/${user}: ${
        target.charAt(0).toUpperCase() + target.slice(1)
      }`;
      title = `/u/${user} ${target}`;
      break;
    case 'r': {
      // Title
      if (target === 'mine') {
        document.title = 'reacddit';
      } else {
        document.title = target;
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
        const subscribers = about.subscribers
          ? `${about.subscribers.toLocaleString()} Subcribers`
          : '';
        const online = about.active_user_count
          ? `${about.active_user_count.toLocaleString()} Online`
          : '';
        showSubInfo = true;
        if (subscribers && online) {
          subInfo = `${subscribers} - ${online}`;
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
      searchEverywhere = target !== 'mine' && (
        <NavLink to={`/search?q=${qs.q}`}>Search Everywhere</NavLink>
      );
      title = `Search results for '${qs.q}'`;
      if (multi) {
        title += ` in /m/${target}`;
      } else if (target !== 'mine') {
        title += ` in /r/${target}`;
      }
      document.title = title;
      break;
    }
    default:
      document.title = 'reacddit';
      title = '';
      break;
  }

  const renderedSubInfo = subInfo ? (
    <span>{subInfo}</span>
  ) : (
    <span className="loading-placeholder">
      Loading Members - Loading Online
    </span>
  );

  const description = cachedSub.public_description || about.public_description;
  const subhead = cachedSub.title || about.title;

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
};

export default ListingsHeaderSub;
