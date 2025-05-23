import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import RedditAPI from '../../reddit/redditAPI';
import MultiDelete from './MultiDelete';

function ListingsHeaderMulti() {
  const [currentMulti, setCurrentMulti] = useState(null);
  const filter = useSelector((state) => state.listingsFilter);
  // const multis = useSelector((state) => state.redditMultiReddits);
  const me = useSelector((state) => state.redditMe);

  const { target, user } = filter;
  const name = user === 'me' ? me.me.name : user;

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

  // Set the title
  document.title = `${currentMulti.name} subreddites curated by /u/${currentMulti.owner}`;

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
