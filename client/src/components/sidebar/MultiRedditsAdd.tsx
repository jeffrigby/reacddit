import { useRef, useState, useCallback } from 'react';
import type { ReactElement, ChangeEvent } from 'react';
import { Form, Dropdown, Button } from 'react-bootstrap';
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
        <Form.Control
          aria-label="Custom Feed Name"
          placeholder="Feed Name"
          ref={nameInput}
          size="sm"
          type="text"
          onChange={checkInput}
        />
        <Dropdown className="input-group-append">
          <Dropdown.Toggle
            aria-label={visibility ? 'Private' : 'Public'}
            id="dropdown-visibility"
            size="sm"
            variant="outline-secondary"
          >
            <i className={visibilityIconClass} />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setVisibility(true)}>
              <i className="fas fa-eye-slash" /> Private
            </Dropdown.Item>
            <Dropdown.Item onClick={() => setVisibility(false)}>
              <i className="fas fa-eye" /> Public
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <Form.Group className="mt-2">
        <Form.Control
          as="textarea"
          id="multiform-descr"
          placeholder="Description (optional)"
          ref={descriptionTextarea}
          rows={3}
          size="sm"
        />
      </Form.Group>
      <div className="form-group mt-2">
        <Button
          className="me-2"
          disabled={disabled}
          size="sm"
          variant="primary"
          onClick={addMulti}
        >
          Add
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setShowAdd(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default MultiRedditsAdd;
