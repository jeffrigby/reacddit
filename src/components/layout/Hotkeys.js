import React from 'react';

const HotKeys = () => {
  return (
    <div
      className="modal fade"
      id="hotkeys"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="keyCommands"
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Hotkeys</h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6">
                <h5>Navigation</h5>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>g</kbd> <kbd>h</kbd>
                  </div>
                  <div className="col-md-6">Home</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>g</kbd> <kbd>p</kbd>
                  </div>
                  <div className="col-md-6">Popular</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>g</kbd> <kbd>r</kbd>
                  </div>
                  <div className="col-md-6">Random</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>g</kbd> <kbd>f</kbd>
                  </div>
                  <div className="col-md-6">Friends</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>g</kbd> <kbd>b</kbd>
                  </div>
                  <div className="col-md-6">Submitted</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>g</kbd> <kbd>u</kbd>
                  </div>
                  <div className="col-md-6">Upvoted</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>g</kbd> <kbd>d</kbd>
                  </div>
                  <div className="col-md-6">Downvoted</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>g</kbd> <kbd>s</kbd>
                  </div>
                  <div className="col-md-6">Saved</div>
                </div>
                <h5>Filter Subreddits</h5>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>shift-f</kbd>
                  </div>
                  <div className="col-md-6">Open Filter</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>down</kbd>
                  </div>
                  <div className="col-md-6">Next Subreddit</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>up</kbd>
                  </div>
                  <div className="col-md-6">Prev Subreddit</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>enter</kbd>
                  </div>
                  <div className="col-md-6">Load Subreddit</div>
                </div>
              </div>
              <div className="col-md-6">
                <h5>Posts</h5>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>j</kbd>
                  </div>
                  <div className="col-md-6">Next</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>k</kbd>
                  </div>
                  <div className="col-md-6">Previous</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>x</kbd>
                  </div>
                  <div className="col-md-6">Expand/Condense Post</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>l</kbd>
                  </div>
                  <div className="col-md-6">Open Link</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>o</kbd>
                  </div>
                  <div className="col-md-6">Open Post on Reddit</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>a</kbd>
                  </div>
                  <div className="col-md-6">Upvote</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>z</kbd>
                  </div>
                  <div className="col-md-6">Downvote</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>s</kbd>
                  </div>
                  <div className="col-md-6">Save</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>space</kbd>
                  </div>
                  <div className="col-md-6">Page Down</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>.</kbd>
                  </div>
                  <div className="col-md-6">Load More Entries</div>
                </div>
                <h5>Sort</h5>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>shift+c</kbd>
                  </div>
                  <div className="col-md-6">Controversial</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>shift+h</kbd>
                  </div>
                  <div className="col-md-6">Hot</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>shift+n</kbd>
                  </div>
                  <div className="col-md-6">New</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>shift+r</kbd>
                  </div>
                  <div className="col-md-6">Rising</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>shift+t</kbd>
                  </div>
                  <div className="col-md-6">Top</div>
                </div>
                <h5>Misc</h5>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>shift+l</kbd>
                  </div>
                  <div className="col-md-6">Login</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>shift+s</kbd>
                  </div>
                  <div className="col-md-6">Search</div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <kbd>shift+?</kbd>
                  </div>
                  <div className="col-md-6">This menu</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotKeys;
