reacddit is a Reddit browser built with ReactJS. The main benefit over other clients is that it renders embeds for many more links, cleaner & larger media previews, and more efficient navigation. 
### Features
- Authenticated support: Log in to see your multis and subreddits.
- Stream new results from any listing page (this can get nuts if you're on the front page)
- Easily access your upvotes, downvotes, submissions, saved posts, and friends
- Quickly see which subreddits were recently updated in the navigation (this continually updates)
  - New badge = < 30m
  - **Bold** = < 1D
  - Normal Text = < 3MO
  - Faded  = >3MO
- Expanded keyboard hotkeys for easier navigation (press shift-?)
- Works on mobile (in-browser or as an installed PWA) and desktop
- One click access to see duplicate posts or all posts from a particular domain
- Large previews on Desktop
- Collapse/Expand posts separately
### Embed Plug-Ins
- Renders many more links inline than reddit.com (youtube, twitter, Instagram, Vimeo,  and NSFW sites)
- Renders embeds for links that appear in text posts.
- Plug-in system to write your own embeds. If you can extract the info from the linked URL you can write an embed for it.
- Support for iFrame, video, & image
### Privacy
- Except for the Oauth2 endpoints to retrieve the reddit access code (unavoidable), everything is handled within the local browser
- Nothing about your Reddit account is logged or stored server side
### Technologies
- Reactjs
- Redux
- Bootstrap
- Fontawesome
### Caveats
- Comments are not supported yet. This wil be available in the next major release. 
- Only tested on the latest browsers - Chrome, Firefox, Safari. I don't plan on ever supporting old browsers.
- Limited Android testing. Let me know if you find any bugs!
