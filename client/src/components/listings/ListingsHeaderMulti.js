import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import RedditAPI from '../../reddit/redditAPI';
import MultiDelete from './MultiDelete';

const ListingsHeaderMulti = ({ filter, multis, me }) => {
  const { target, user } = filter;
  const [currentMulti, setCurrentMulti] = useState(null);
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
          <div className="mr-auto title-contrainer">
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
        <div className="mr-auto title-contrainer">
          <h5 className="m-0 p-0 w-100">/m/{target}</h5>
        </div>
        {currentMulti.can_edit && (
          <div>
            <div className="listing-actions pl-2 d-flex flex-nowrap">
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
};

ListingsHeaderMulti.propTypes = {
  filter: PropTypes.object.isRequired,
  multis: PropTypes.object.isRequired,
  me: PropTypes.object.isRequired,
};

ListingsHeaderMulti.defaultProps = {};

const mapStateToProps = (state) => ({
  filter: state.listingsFilter,
  multis: state.redditMultiReddits,
  me: state.redditMe,
});

export default connect(mapStateToProps, {})(ListingsHeaderMulti);
