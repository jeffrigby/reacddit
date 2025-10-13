import { memo } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router';
import { useAppDispatch } from '@/redux/hooks';
import type { LabeledMultiData } from '@/types/redditApi';
import { fetchMultiReddits } from '@/redux/slices/multiRedditsSlice';
import RedditAPI from '../../reddit/redditAPI';

interface MultiDeleteProps {
  multi: LabeledMultiData;
}

function MultiDelete({ multi }: MultiDeleteProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const deleteMulti = async () => {
    await RedditAPI.multiDelete(multi.path);
    dispatch(fetchMultiReddits(true));
    navigate('/');
  };

  const removeMulti = () => {
    window.confirm(`Permanately delete ${multi.name}?`) && deleteMulti();
  };

  return (
    <Button
      aria-label="Delete Custom Feed"
      size="sm"
      title="Delete Custom Feed"
      variant="danger"
      onClick={removeMulti}
    >
      <FontAwesomeIcon icon={faTrashAlt} />
    </Button>
  );
}

export default memo(MultiDelete);
