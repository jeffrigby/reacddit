import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import type { LabeledMultiData } from '@/types/redditApi';
import RedditAPI from '../../reddit/redditAPI';
import MultiDelete from './MultiDelete';

function ListingsHeaderMulti() {
  const [currentMulti, setCurrentMulti] = useState<LabeledMultiData | null>(
    null
  );
  const filter = useAppSelector((state) => state.listingsFilter);
  const me = useAppSelector((state) => state.redditMe);

  const { target, user } = filter;
  const name = user === 'me' ? me?.me?.name : user;

  useEffect(() => {
    let isSubscribed = true;
    const getCurrentMulti = async () => {
      const multiLookup = await RedditAPI.multiInfo(`user/${name}/m/${target}`);
      if (multiLookup.status === 200) {
        if (isSubscribed) {
          setCurrentMulti(multiLookup.data.data);
        }
      }
    };

    getCurrentMulti();
    return () => {
      isSubscribed = false;
    };
  }, [name, target]);

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
