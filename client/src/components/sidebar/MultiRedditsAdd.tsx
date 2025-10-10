import { useRef, useState, useCallback } from 'react';
import type { ReactElement, ChangeEvent } from 'react';
import RedditAPI from '../../reddit/redditAPI';

interface MultiRedditsAddProps {
  setShowAdd: (show: boolean) => void;
  reloadMultis: () => void;
}

function MultiRedditsAdd({
  setShowAdd,
  reloadMultis,
}: MultiRedditsAddProps): ReactElement {
  const nameInput = useRef<HTMLInputElement>(null);
  const descriptionTextarea = useRef<HTMLTextAreaElement>(null);

  const [visibility, setVisibility] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(true);
  const visibilityIconClass = visibility ? 'fas fa-eye' : 'fas fa-eye-slash';

  const checkInput = useCallback(
    (_event: ChangeEvent<HTMLInputElement>): void => {
      if (!nameInput.current) {
        return;
      }
      const { value } = nameInput.current;
      setDisabled(value === '');
    },
    []
  );

  const addMulti = useCallback(async (): Promise<void> => {
    if (!nameInput.current || !descriptionTextarea.current) {
      return;
    }
    const name = nameInput.current.value;
    const desc = descriptionTextarea.current.value;
    const visibleStatus = visibility ? 'private' : 'public';
    await RedditAPI.multiAdd(name, desc, visibleStatus);
    setShowAdd(false);
    reloadMultis();
  }, [visibility, setShowAdd, reloadMultis]);

  return (
    <div className="multireddits-add my-2">
      <div className="text-muted">Add a new custom feed</div>
      <div className="input-group mt-2">
        <input
          aria-label="Custom Feed Name"
          className="form-control form-control-sm"
          placeholder="Feed Name"
          ref={nameInput}
          type="text"
          onChange={checkInput}
        />
        <div className="input-group-append">
          <button
            aria-expanded="false"
            aria-haspopup="true"
            aria-label={visibility ? 'Private' : 'Public'}
            className="btn btn-sm btn-outline-secondary dropdown-toggle"
            data-bs-toggle="dropdown"
            type="button"
          >
            <i className={visibilityIconClass} />
          </button>
          <div className="dropdown-menu">
            <button
              className="btn btn-link btn-sm dropdown-item"
              type="button"
              onClick={() => setVisibility(true)}
            >
              <i className="fas fa-eye-slash" /> Private
            </button>
            <button
              className="btn btn-link btn-sm dropdown-item"
              type="button"
              onClick={() => setVisibility(false)}
            >
              <i className="fas fa-eye" /> Public
            </button>
          </div>
        </div>
      </div>
      <div className="form-group mt-2">
        <textarea
          className="form-control form-control-sm"
          id="multiform-descr"
          placeholder="Description (optional)"
          ref={descriptionTextarea}
          rows={3}
        />
      </div>
      <div className="form-group mt-2">
        <button
          className="btn btn-primary btn-sm me-2"
          disabled={disabled}
          type="button"
          onClick={addMulti}
        >
          Add
        </button>
        <button
          className="btn btn-secondary btn-sm"
          type="button"
          onClick={() => setShowAdd(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default MultiRedditsAdd;
