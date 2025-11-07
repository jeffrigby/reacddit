import { useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useGetMultiRedditInfoQuery } from '@/redux/api';
import MultiDelete from './MultiDelete';

function ListingsHeaderMulti() {
  const filter = useAppSelector((state) => state.listings.currentFilter);
  const me = useAppSelector((state) => state.redditMe);

  const { target, user } = filter;
  const meName = me.me?.name;

  // Calculate the name based on whether it's 'me' or a specific user
  const name = user === 'me' ? meName : user;

  // Fetch multireddit info with RTK Query, skipping if name not yet available
  // Skip prevents unnecessary API calls before user data is loaded
  const { data: multiData } = useGetMultiRedditInfoQuery(
    `user/${name}/m/${target}`,
    {
      skip: !name || (user === 'me' && !meName),
    }
  );

  const currentMulti = multiData?.data ?? null;

  const info = currentMulti ? (
    <>
      <div>Curated by /u/{currentMulti.owner}</div>
      <span>{currentMulti.description_md}</span>
    </>
  ) : (
    <span className="loading-placeholder">Loading Description</span>
  );

  // Set the title
  useEffect(() => {
    if (currentMulti) {
      document.title = `${currentMulti.name} subreddits curated by /u/${currentMulti.owner}`;
    }
  }, [currentMulti]);

  if (!currentMulti) {
    return (
      <>
        <div className="d-flex">
          <div className="me-auto title-contrainer">
            <h5 className="m-0 p-0 w-100">/m/{target}</h5>
          </div>
        </div>
        <div>
          <small>{info}</small>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="d-flex">
        <div className="me-auto title-contrainer">
          <h5 className="m-0 p-0 w-100">/m/{target}</h5>
        </div>
        {currentMulti.can_edit && (
          <div>
            <div className="listing-actions ps-2 d-flex flex-nowrap">
              <MultiDelete multi={currentMulti} />
            </div>
          </div>
        )}
      </div>
      <div>
        <small>{info}</small>
      </div>
    </>
  );
}

export default ListingsHeaderMulti;
