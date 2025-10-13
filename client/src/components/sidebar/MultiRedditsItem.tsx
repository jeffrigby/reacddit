import { memo, useState } from 'react';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { useLocation } from 'react-router';
import queryString from 'query-string';
import _trimEnd from 'lodash/trimEnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import type { LabeledMultiData, Thing } from '@/types/redditApi';
import { useAppSelector } from '@/redux/hooks';
import { setMenuStatus, getMenuStatus } from '../../common';
import { buildSortPath } from './navHelpers';
import MultiRedditsSubs from './MultiRedditsSubs';
import NavigationGenericNavItem from './NavigationGenericNavItem';

interface MultiRedditsItemProps {
  item: Thing<LabeledMultiData>;
}

interface QueryParams {
  t?: string;
  [key: string]: string | string[] | undefined;
}

function MultiRedditsItem({ item }: MultiRedditsItemProps): ReactElement {
  const { path } = item.data;
  const [showSubs, setShowSubs] = useState<boolean>(getMenuStatus(path));

  const sort = useAppSelector((state) => state.listings.currentFilter.sort);
  const location = useLocation();

  function hideShowSubs(): void {
    setMenuStatus(path, !showSubs);
    setShowSubs(!showSubs);
  }

  const search = queryString.parse(location.search) as QueryParams;

  // Generate Link
  const sortPath = buildSortPath(sort, search.t);
  const navTo = `/me/m/${item.data.name}/${sortPath}`;

  const arrowIcon = showSubs ? faCaretDown : faCaretLeft;
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
          <Button
            aria-label={arrowTitle}
            className="m-0 p-0 ps-2 border-0"
            size="sm"
            variant="link"
            onClick={hideShowSubs}
          >
            <FontAwesomeIcon className="menu-caret" icon={arrowIcon} />
          </Button>
        </span>
      </div>
      {showSubs && <MultiRedditsSubs multiRedditSubs={item.data.subreddits} />}
    </li>
  );
}

export default memo(MultiRedditsItem);
