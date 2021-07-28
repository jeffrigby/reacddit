import { memo } from 'react';
import { useSelector } from 'react-redux';
import { listingStatus } from '../../../redux/selectors/listingsSelector';

const PostsFooter = () => {
  const status = useSelector((state) => listingStatus(state));

  let footerStatus = '';
  if (status === 'loadingNext') {
    footerStatus = (
      <div className="alert alert-info" id="content-more-loading" role="alert">
        <i className="fas fa-spinner fa-spin" /> Getting more entries.
      </div>
    );
  } else if (status === 'loadedAll') {
    footerStatus = (
      <div className="alert alert-warning" id="content-end" role="alert">
        <i className="fas fa-exclamation-triangle" /> That&apos;s it!
      </div>
    );
  }

  return <div className="footer-status p-2">{footerStatus}</div>;
};

export default memo(PostsFooter);
