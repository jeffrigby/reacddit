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
                  <div className="col-md-6 text-right">
                    <kbd>g</kbd> then <kbd>h</kbd>
                  </div>
                  <div className="col-md-6">Home</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>g</kbd> then <kbd>p</kbd>
                  </div>
                  <div className="col-md-6">Popular</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>g</kbd> then <kbd>r</kbd>
                  </div>
                  <div className="col-md-6">Random</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>g</kbd> then <kbd>f</kbd>
                  </div>
                  <div className="col-md-6">Friends</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>g</kbd> then <kbd>b</kbd>
                  </div>
                  <div className="col-md-6">Submitted</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>g</kbd> then <kbd>u</kbd>
                  </div>
                  <div className="col-md-6">Upvoted</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>g</kbd> then <kbd>d</kbd>
                  </div>
                  <div className="col-md-6">Downvoted</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>g</kbd> then <kbd>s</kbd>
                  </div>
                  <div className="col-md-6">Saved</div>
                </div>
                <h5>Filter Subreddits</h5>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>shift</kbd> + <kbd>f</kbd>
                  </div>
                  <div className="col-md-6">Open Filter</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>down</kbd>
                  </div>
                  <div className="col-md-6">Next Subreddit</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>up</kbd>
                  </div>
                  <div className="col-md-6">Prev Subreddit</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>enter</kbd>
                  </div>
                  <div className="col-md-6">Load Subreddit</div>
                </div>
                <h5>Misc</h5>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>shift</kbd> + <kbd>l</kbd>
                  </div>
                  <div className="col-md-6">Login/Logout</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>shift</kbd> + <kbd>s</kbd>
                  </div>
                  <div className="col-md-6">Search</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>shift</kbd> + <kbd>?</kbd>
                  </div>
                  <div className="col-md-6">This menu</div>
                </div>
              </div>
              <div className="col-md-6">
                <h5>Posts</h5>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>j</kbd>
                  </div>
                  <div className="col-md-6">Next</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>k</kbd>
                  </div>
                  <div className="col-md-6">Previous</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>x</kbd>
                  </div>
                  <div className="col-md-6">Expand/Condense Post</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>l</kbd>
                  </div>
                  <div className="col-md-6">Open Link</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>o</kbd>
                  </div>
                  <div className="col-md-6">Open Post on Reddit</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>a</kbd>
                  </div>
                  <div className="col-md-6">Upvote</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>z</kbd>
                  </div>
                  <div className="col-md-6">Downvote</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>s</kbd>
                  </div>
                  <div className="col-md-6">Save</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>.</kbd>
                  </div>
                  <div className="col-md-6">Load More Entries</div>
                </div>
                <h5>Sort</h5>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>shift</kbd> + <kbd>c</kbd>
                  </div>
                  <div className="col-md-6">Controversial</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>shift</kbd> + <kbd>h</kbd>
                  </div>
                  <div className="col-md-6">Hot</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>shift</kbd> + <kbd>n</kbd>
                  </div>
                  <div className="col-md-6">New</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>shift</kbd> + <kbd>r</kbd>
                  </div>
                  <div className="col-md-6">Rising</div>
                </div>
                <div className="row">
                  <div className="col-md-6 text-right">
                    <kbd>shift</kbd> + <kbd>t</kbd>
                  </div>
                  <div className="col-md-6">Top</div>
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
