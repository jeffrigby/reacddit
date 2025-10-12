# reacddit

A modern Reddit client built with React that provides enhanced media viewing with support for many more embedded content types than the official Reddit app. Experience cleaner, larger media previews and more efficient navigation.

## Demo & Install

Check out https://reacdd.it/ to try it out.

reacddit is a monorepo containing an OAuth2 API (for Reddit authentication) and a React browser client. Both need to be running for local development.

## Tech Stack

- **Frontend**: React 19, Redux Toolkit, React Router 7, TypeScript (migration in progress)
- **Build System**: Webpack 5 with ESBuild loader
- **Backend**: Koa.js OAuth2 server
- **Deployment**: AWS Lambda with SAM/CloudFormation
- **PWA**: Full Progressive Web App support with service workers

## Features

### Core Features
- **Authenticated support**: Log in to see your multis and subreddits
- **Enhanced embeds**: Support for many more embeddable content types than reddit.com or the official app
- **Live streaming**: Stream new results from any listing page (can get intense on the front page!)
- **Comment viewing**: Full comment threading and viewing support
- **Quick access**: Easily view your upvotes, downvotes, submissions, saved posts, and friends
- **Subreddit activity tracking**: See which subreddits were recently updated in the navigation (continually updates as you browse)
  - New badge = < 30m
  - **Bold** = < 1D
  - Normal Text = < 3MO
  - Faded = >3MO
- **Keyboard navigation**: Expanded hotkeys for easier navigation (press shift-?)
- **Cross-platform**: Works on mobile (in-browser or as an installed PWA) and desktop
- **Duplicate detection**: One-click access to see duplicate posts or all posts from a particular domain
- **Flexible viewing**: Collapse/Expand posts separately

### Embed System
- Renders many more links inline than reddit.com (YouTube, Twitter, Instagram, Vimeo, and many more)
- Renders embeds for inline links that appear in text posts
- Plugin-based architecture - write your own embeds! If you can extract info from a URL, you can create an embed for it
- Support for iFrame, video, and image embeds

### Privacy
- Except for the OAuth2 endpoints to retrieve the Reddit access code (unavoidable), everything is handled within the local browser
- **NOTHING** about your Reddit account or browser is logged or stored server-side

## Development

### Quick Start
```bash
# Install dependencies for each package separately
npm install              # Root (installs concurrently for running both servers)
cd client && npm install # Client dependencies
cd ../api && npm install # API dependencies
cd ..

# Start both client and API
npm start

# Or start them separately:
npm run start-client    # Client dev server only (port 3000)
npm run start-api       # API server only (port 3001)
```

### Client Commands
```bash
cd client
npm start              # Webpack dev server with hot reload
npm run build          # Production build
npm run profile        # Build with webpack bundle analyzer
npm run lint           # Prettier formatting + ESLint (always run after changes!)
```

### API Setup
The API requires Reddit OAuth2 credentials:
1. Create a Reddit app at https://www.reddit.com/prefs/apps
2. Copy `api/.env.dist` to `api/.env`
3. Configure `CLIENT_PATH`, `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_CALLBACK_URI`
4. Test at `http://localhost:3001/api/bearer`

### SSL Requirement
**SSL is required to run reacddit.** Since the app loads HTTPS iframes and embedded content, the main site must also be served over HTTPS to avoid mixed content blocking.

**Recommended setup:**
1. Run the dev servers (client on port 3000, API on port 3001)
2. Use a reverse proxy (nginx, Apache, Caddy, etc.) to:
   - Proxy requests to the dev servers
   - Terminate SSL and apply your certificate
   - Serve the site over HTTPS
   - Enable WebSocket support for Webpack HMR (Hot Module Replacement)

**Important proxy configuration notes:**
- **API routes**: Proxy `/api` requests to the API server (port 3001)
- **Client routes**: Proxy all other requests to the client server (port 3000)
- **WebSocket support**: Configure WebSocket proxying for `/ws` and `/sockjs-node` endpoints (required for HMR during development)
- **HTTP/2**: Enable HTTP/2 for better performance

**SSL certificate options:**
- [Let's Encrypt](https://letsencrypt.org/) (recommended and free)
- Any valid SSL certificate from a certificate authority
- Self-signed certificate for local development (will show browser warnings)

See `nginx.conf.example` in the repo for a complete nginx configuration example.

## Current Limitations

- **Read-only interface**: This is a viewing and browsing client only. No posting, commenting, voting, or account modifications are supported
- **Browser support**: Only tested on the latest versions of Chrome, Firefox, and Safari. No plans to support older browsers
- **Mobile testing**: Limited Android testing. Please report any bugs you find!

## Roadmap

The project is undergoing active modernization:
1. **Current**: Converting JavaScript to TypeScript for better type safety
2. **Next**: Migrating from Webpack to Vite for improved build performance
3. **Future**: Convert API to TypeScript, add write capabilities (voting, posting, commenting)

## Inspiration

Took a lot of inspiration from [Feedly](https://feedly.com) & [Apollo](https://apolloapp.io) - many thanks to those talented developers.

## License

MIT