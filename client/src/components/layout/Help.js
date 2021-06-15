import React from 'react';

const Help = () => (
  <>
    <div
      className="modal fade"
      id="autoRefresh"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="autoRefreshed"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-sm">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              Auto Refresh
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            Check this option to enable auto refresh. When enabled, new entries
            will automatically be loaded when scrolled to the top of the page.
            This can get crazy if you&rsquo;re on the front page and sorted by
            &lsquo;new&rsquo;.
          </div>
        </div>
      </div>
    </div>

    <div
      className="modal fade"
      id="condenseHelp"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="condenseHelp"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-sm">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              Condense By Default
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            Condense sticky, pinned, and/or duplicate (within the same listing)
            posts by default.
          </div>
        </div>
      </div>
    </div>

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
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-md-6">
                <h5 className="mt-3 border-bottom">Navigation</h5>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>g</kbd> then <kbd>h</kbd>
                  </div>
                  <div className="col-md-8">Home</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>g</kbd> then <kbd>p</kbd>
                  </div>
                  <div className="col-md-8">Popular</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>g</kbd> then <kbd>r</kbd>
                  </div>
                  <div className="col-md-8">Random</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>g</kbd> then <kbd>f</kbd>
                  </div>
                  <div className="col-md-8">Friends</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>g</kbd> then <kbd>b</kbd>
                  </div>
                  <div className="col-md-8">Posts</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>g</kbd> then <kbd>u</kbd>
                  </div>
                  <div className="col-md-8">Upvoted</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>g</kbd> then <kbd>d</kbd>
                  </div>
                  <div className="col-md-8">Downvoted</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>g</kbd> then <kbd>s</kbd>
                  </div>
                  <div className="col-md-8">Saved</div>
                </div>
                <h5 className="mt-3 border-bottom">Filter Subreddits</h5>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>shift + f</kbd>
                  </div>
                  <div className="col-md-8">Open Filter</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>down</kbd>
                  </div>
                  <div className="col-md-8">Next Subreddit</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>up</kbd>
                  </div>
                  <div className="col-md-8">Prev Subreddit</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>enter</kbd>
                  </div>
                  <div className="col-md-8">Load Subreddit</div>
                </div>
                <h5 className="mt-3 border-bottom">Misc</h5>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>shift + l</kbd>
                  </div>
                  <div className="col-md-8">Login/Logout</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>shift + s</kbd>
                  </div>
                  <div className="col-md-8">Search</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>shift + ?</kbd>
                  </div>
                  <div className="col-md-8">This menu</div>
                </div>
              </div>
              <div className="col-md-6">
                <h5 className="mt-3 border-bottom">Posts</h5>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>j</kbd>
                  </div>
                  <div className="col-md-8">Next</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>k</kbd>
                  </div>
                  <div className="col-md-8">Previous</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>x</kbd>
                  </div>
                  <div className="col-md-8">Expand/Condense Post</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>l</kbd>
                  </div>
                  <div className="col-md-8">Open Link</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>o</kbd>
                  </div>
                  <div className="col-md-8">Open Post on Reddit</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>a</kbd>
                  </div>
                  <div className="col-md-8">Upvote</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>z</kbd>
                  </div>
                  <div className="col-md-8">Downvote</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>s</kbd>
                  </div>
                  <div className="col-md-8">Save</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>.</kbd>
                  </div>
                  <div className="col-md-8">Load New Entries</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>/</kbd>
                  </div>
                  <div className="col-md-8">Load Next Entries</div>
                </div>
                <h5 className="mt-3 border-bottom">Sort</h5>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>shift + c</kbd>
                  </div>
                  <div className="col-md-8">Controversial</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>shift + h</kbd>
                  </div>
                  <div className="col-md-8">Hot</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>shift + n</kbd>
                  </div>
                  <div className="col-md-8">New</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>shift + r</kbd>
                  </div>
                  <div className="col-md-8">Rising</div>
                </div>
                <div className="d-flex">
                  <div className="col-md-4 text-end pe-1">
                    <kbd>shift + t</kbd>
                  </div>
                  <div className="col-md-8">Top</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
);

export default Help;
