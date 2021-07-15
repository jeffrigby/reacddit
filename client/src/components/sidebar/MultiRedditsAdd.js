import { createRef, useState } from 'react';
import PropTypes from 'prop-types';
import RedditAPI from '../../reddit/redditAPI';

const MultiRedditsAdd = ({ setShowAdd, reloadMultis }) => {
  const nameInput = createRef();
  const descriptionTextarea = createRef();

  const [visibility, setVisibility] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const visibilityIconClass = visibility ? 'fas fa-eye' : 'fas fa-eye-slash';

  const checkInput = () => {
    const { value } = nameInput.current;
    setDisabled(value === '');
  };

  const addMulti = async () => {
    const name = nameInput.current.value;
    const desc = descriptionTextarea.current.value;
    const visibleStatus = visibility ? 'private' : 'public';
    await RedditAPI.multiAdd(name, desc, visibleStatus);
    setShowAdd(false);
    reloadMultis();
  };

  return (
    <div className="multireddits-add my-2">
      <div className="text-muted">Add a new custom feed</div>
      <div className="input-group mt-2">
        <input
          type="text"
          className="form-control form-control-sm"
          aria-label="Custom Feed Name"
          placeholder="Feed Name"
          ref={nameInput}
          onChange={checkInput}
        />
        <div className="input-group-append">
          <button
            className="btn btn-sm btn-outline-secondary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <i className={visibilityIconClass} />
          </button>
          <div className="dropdown-menu">
            <button
              className="btn btn-link btn-sm dropdown-item"
              onClick={() => setVisibility(true)}
              type="button"
            >
              <i className="fas fa-eye-slash" /> Private
            </button>
            <button
              className="btn btn-link btn-sm dropdown-item"
              onClick={() => setVisibility(false)}
              type="button"
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
          rows="3"
          ref={descriptionTextarea}
        />
      </div>
      <div className="form-group mt-2">
        <button
          className="btn btn-primary btn-sm me-2"
          type="button"
          disabled={disabled}
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
};

MultiRedditsAdd.propTypes = {
  setShowAdd: PropTypes.func.isRequired,
  reloadMultis: PropTypes.func.isRequired,
};

export default MultiRedditsAdd;
