import { memo } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router';
import type { LabeledMultiData } from '@/types/redditApi';
import { useDeleteMultiRedditMutation } from '@/redux/api';

interface MultiDeleteProps {
  multi: LabeledMultiData;
}

function MultiDelete({ multi }: MultiDeleteProps) {
  const navigate = useNavigate();
  const [deleteMultiReddit] = useDeleteMultiRedditMutation();

  const deleteMulti = async () => {
    try {
      await deleteMultiReddit(multi.path).unwrap();
      // RTK Query will automatically refetch via tag invalidation
      navigate('/');
    } catch (error) {
      console.error('Failed to delete multireddit:', error);
    }
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
