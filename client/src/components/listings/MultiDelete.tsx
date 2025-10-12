import { memo } from 'react';
import { Button } from 'react-bootstrap';
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
    <Button
      aria-label="Delete Custom Feed"
      size="sm"
      title="Delete Custom Feed"
      variant="danger"
      onClick={removeMulti}
    >
      <i className="fas fa-trash-alt" />
    </Button>
  );
}

export default memo(MultiDelete);
