import { Modal } from 'react-bootstrap';
import { useModals } from '@/contexts/ModalContext';

function Help() {
  const {
    showHotkeys,
    setShowHotkeys,
    showAutoRefresh,
    setShowAutoRefresh,
    showCondenseHelp,
    setShowCondenseHelp,
  } = useModals();

  return (
    <>
      {/* Auto Refresh Modal */}
      <Modal
        show={showAutoRefresh}
        size="sm"
        onHide={() => setShowAutoRefresh(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Auto Refresh</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Check this option to enable auto refresh. When enabled, new entries
          will automatically be loaded when scrolled to the top of the page.
          This can get crazy if you&rsquo;re on the front page and sorted by
          &lsquo;new&rsquo;.
        </Modal.Body>
      </Modal>

      {/* Condense Help Modal */}
      <Modal
        show={showCondenseHelp}
        size="sm"
        onHide={() => setShowCondenseHelp(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Condense By Default</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Condense sticky, pinned, and/or duplicate (within the same listing)
          posts by default.
        </Modal.Body>
      </Modal>

      {/* Hotkeys Modal */}
      <Modal show={showHotkeys} size="lg" onHide={() => setShowHotkeys(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Hotkeys</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-6">
              <h5 className="mt-3 border-bottom text-center">Navigation</h5>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>g</kbd> then <kbd>h</kbd>
                </div>
                <div className="col-md-6">Home</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>g</kbd> then <kbd>p</kbd>
                </div>
                <div className="col-md-6">Popular</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>g</kbd> then <kbd>r</kbd>
                </div>
                <div className="col-md-6">Random</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>g</kbd> then <kbd>f</kbd>
                </div>
                <div className="col-md-6">Friends</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>g</kbd> then <kbd>b</kbd>
                </div>
                <div className="col-md-6">Posts</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>g</kbd> then <kbd>u</kbd>
                </div>
                <div className="col-md-6">Upvoted</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>g</kbd> then <kbd>d</kbd>
                </div>
                <div className="col-md-6">Downvoted</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>g</kbd> then <kbd>s</kbd>
                </div>
                <div className="col-md-6">Saved</div>
              </div>
              <h5 className="mt-3 border-bottom text-center">Filter Subreddits</h5>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>shift</kbd> + <kbd>f</kbd>
                </div>
                <div className="col-md-6">Open Filter</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>down</kbd>
                </div>
                <div className="col-md-6">Next Subreddit</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>up</kbd>
                </div>
                <div className="col-md-6">Prev Subreddit</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>enter</kbd>
                </div>
                <div className="col-md-6">Load Subreddit</div>
              </div>
              <h5 className="mt-3 border-bottom text-center">Misc</h5>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>shift</kbd> + <kbd>l</kbd>
                </div>
                <div className="col-md-6">Login/Logout</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>shift</kbd> + <kbd>s</kbd>
                </div>
                <div className="col-md-6">Search</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>shift</kbd> + <kbd>.</kbd>
                </div>
                <div className="col-md-6">Toggle Auto Refresh</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>opt</kbd> + <kbd>shift</kbd> + <kbd>d</kbd>
                </div>
                <div className="col-md-6">Toggle Debug Mode</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>shift</kbd> + <kbd>?</kbd>
                </div>
                <div className="col-md-6">This menu</div>
              </div>
            </div>
            <div className="col-md-6">
              <h5 className="mt-3 border-bottom text-center">Posts</h5>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>j</kbd>
                </div>
                <div className="col-md-6">Next</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>k</kbd>
                </div>
                <div className="col-md-6">Previous</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>x</kbd>
                </div>
                <div className="col-md-6">Expand/Condense Post</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>l</kbd>
                </div>
                <div className="col-md-6">Open Link</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>o</kbd>
                </div>
                <div className="col-md-6">Open Post on Reddit</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>a</kbd>
                </div>
                <div className="col-md-6">Upvote</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>z</kbd>
                </div>
                <div className="col-md-6">Downvote</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>s</kbd>
                </div>
                <div className="col-md-6">Save</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>.</kbd>
                </div>
                <div className="col-md-6">Load New Entries</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>/</kbd>
                </div>
                <div className="col-md-6">Load Next Entries</div>
              </div>
              <h5 className="mt-3 border-bottom text-center">Sort</h5>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>shift</kbd> + <kbd>c</kbd>
                </div>
                <div className="col-md-6">Controversial</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>shift</kbd> + <kbd>h</kbd>
                </div>
                <div className="col-md-6">Hot</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>shift</kbd> + <kbd>n</kbd>
                </div>
                <div className="col-md-6">New</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>shift</kbd> + <kbd>r</kbd>
                </div>
                <div className="col-md-6">Rising</div>
              </div>
              <div className="d-flex mb-1">
                <div className="col-md-6 text-end pe-2">
                  <kbd>shift</kbd> + <kbd>t</kbd>
                </div>
                <div className="col-md-6">Top</div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Help;
