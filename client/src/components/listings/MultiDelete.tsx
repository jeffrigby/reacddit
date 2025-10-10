import { memo } from 'react';
import { useNavigate } from 'react-router';
import { useAppDispatch } from '@/redux/hooks';
import type { LabeledMultiData } from '@/types/redditApi';
import RedditAPI from '../../reddit/redditAPI';
import { redditFetchMultis } from '../../redux/actions/reddit';

interface MultiDeleteProps {
  multi: LabeledMultiData;
}

function MultiDelete({ multi }: MultiDeleteProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const deleteMulti = async () => {
    await RedditAPI.multiDelete(multi.path);
    dispatch(redditFetchMultis(true));
    navigate('/');
  };

  const removeMulti = () => {
    window.confirm(`Permanately delete ${multi.name}?`) && deleteMulti();
  };

  return (
    <button
      aria-label="Delete Custom Feed"
      className="btn btn-sm btn-danger"
      title="Delete Custom Feed"
      type="button"
      onClick={removeMulti}
    >
      <i className="fas fa-trash-alt" />
    </button>
  );
}

export default memo(MultiDelete);
