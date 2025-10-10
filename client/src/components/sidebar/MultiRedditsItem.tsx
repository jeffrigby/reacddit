import { memo, useState } from 'react';
import type { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import queryString from 'query-string';
import _trimEnd from 'lodash/trimEnd';
import type { RootState } from '@/types/redux';
import type { LabeledMultiData } from '@/types/redditApi';
import { setMenuStatus, getMenuStatus } from '../../common';
import { buildSortPath } from './navHelpers';
import MultiRedditsSubs from './MultiRedditsSubs';
import NavigationGenericNavItem from './NavigationGenericNavItem';

interface MultiRedditsItemProps {
  item: LabeledMultiData;
}

interface QueryParams {
  t?: string;
  [key: string]: string | string[] | undefined;
}

function MultiRedditsItem({ item }: MultiRedditsItemProps): ReactElement {
  const { path } = item.data;
  const [showSubs, setShowSubs] = useState<boolean>(getMenuStatus(path));

  const sort = useSelector((state: RootState) => state.listingsFilter.sort);
  const location = useLocation();

  function hideShowSubs(): void {
    setMenuStatus(path, !showSubs);
    setShowSubs(!showSubs);
  }

  const search = queryString.parse(location.search) as QueryParams;

  // Generate Link
  const sortPath = buildSortPath(sort, search.t);
  const navTo = `/me/m/${item.data.name}/${sortPath}`;

  const arrowClass = showSubs ? 'down' : 'left';
  const arrowTitle = showSubs ? 'Hide Subreddits' : 'Show Subreddits';

  return (
    <li className="nav-item has-child m-0 p-0">
      <div className="d-flex align-middle">
        <span className="me-auto">
          <NavigationGenericNavItem
            noLi
            text={item.data.name}
            title={item.data.description_md ?? undefined}
            to={_trimEnd(navTo, '/')}
          />
        </span>
        <span>
          <button
            aria-label={arrowTitle}
            className="btn btn-link btn-sm m-0 p-0 ps-2 border-0"
            type="button"
            onClick={hideShowSubs}
          >
            <i className={`fas fa-caret-${arrowClass} menu-caret`} />
          </button>
        </span>
      </div>
      {showSubs && <MultiRedditsSubs multiRedditSubs={item.data.subreddits} />}
    </li>
  );
}

export default memo(MultiRedditsItem);
