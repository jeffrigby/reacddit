import { memo, useState } from 'react';
import type { ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import type { LabeledMultiData, Thing } from '@/types/redditApi';
import { setMenuStatus, getMenuStatus } from '@/common';
import { buildSubredditHref } from './navHelpers';
import MultiRedditsSubs from './MultiRedditsSubs';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import { useSubredditSortPath } from './useSubredditSortPath';

interface MultiRedditsItemProps {
  item: Thing<LabeledMultiData>;
}

function MultiRedditsItem({ item }: MultiRedditsItemProps): ReactElement {
  const { path } = item.data;
  const [showSubs, setShowSubs] = useState<boolean>(() => getMenuStatus(path));

  const sortPath = useSubredditSortPath();

  function hideShowSubs(): void {
    setMenuStatus(path, !showSubs);
    setShowSubs(!showSubs);
  }

  const navTo = buildSubredditHref(`me/m/${item.data.name}`, sortPath);

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
            to={navTo}
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
