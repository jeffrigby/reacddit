import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import type { LabeledMultiData } from '@/types/redditApi';
import { multiInfo } from '@/reddit/redditApiTs';
import MultiDelete from './MultiDelete';

function ListingsHeaderMulti() {
  const [currentMulti, setCurrentMulti] = useState<LabeledMultiData | null>(
    null
  );
  const filter = useAppSelector((state) => state.listings.currentFilter);
  const me = useAppSelector((state) => state.redditMe);

  const { target, user } = filter;
  const meName = me.me?.name;

  // Calculate the name based on whether it's 'me' or a specific user
  const name = user === 'me' ? meName : user;

  useEffect(() => {
    // If user is 'me' and we don't have the name yet (not loaded), wait
    if (user === 'me' && !meName) {
      return;
    }

    // If we still don't have a name, wait
    if (!name) {
      return;
    }

    let isSubscribed = true;
    const getCurrentMulti = async () => {
      try {
        const multiLookup = await multiInfo(`user/${name}/m/${target}`);
        if (isSubscribed) {
          setCurrentMulti(multiLookup.data);
        }
      } catch (error) {
        console.error('Failed to load multi info:', error);
        // Keep currentMulti as null to show loading placeholder
      }
    };

    getCurrentMulti();
    return () => {
      isSubscribed = false;
    };
  }, [name, target, user, meName]);

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
      document.title = `${currentMulti.name} subreddites curated by /u/${currentMulti.owner}`;
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
