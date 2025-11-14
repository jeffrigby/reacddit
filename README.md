# reacddit

A modern Reddit client built with React that provides enhanced media viewing with support for many more embedded content types than the official Reddit app. Experience cleaner, larger media previews and more efficient navigation.

## Demo & Install

Check out https://reacdd.it/ to try it out.

reacddit is a monorepo containing an OAuth2 API (for Reddit authentication) and a React browser client. Both need to be running for local development.

## Tech Stack

- **Frontend**: React 19, Redux Toolkit, React Router 7, TypeScript
- **Build System**: Vite 6 with SWC for fast builds and hot module replacement
- **Backend**: Koa.js OAuth2 server (TypeScript) - [API docs](api/README.md)
- **Deployment**: AWS Lambda with SAM/CloudFormation - [Deployment guide](DEPLOYMENT.md)
- **PWA**: Full Progressive Web App support with Vite PWA plugin

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
# 1. Install dependencies for each package
npm install              # Root (installs concurrently)
cd client && npm install # Client dependencies
cd ../api && npm install # API dependencies
cd ../proxy && npm install # Proxy dependencies
cd ..

# 2. Configure environment
cp .env.dist .env        # Copy template and adjust if needed
# See API Setup section below for Reddit OAuth configuration

# 3. Start everything (proxy + client + API)
npm start              # For default port 5173 (unprivileged)
# OR
sudo npm start         # For port 443 (requires root on macOS/Linux)

# Access the app at:
# - https://localhost:5173 (default unprivileged port)
# - https://localhost:443 or https://dev.reacdd.it (if using port 443)

# Note: Your browser will warn about self-signed certificates on first visit
# Click "Advanced" → "Proceed to localhost" to continue
```

The proxy automatically generates self-signed SSL certificates for local development. For custom domains or production certificates, see the [Deployment Guide](DEPLOYMENT.md).

**Individual Commands:**
```bash
npm run start-proxy    # HTTPS reverse proxy only
npm run start-client   # Client dev server only (port 3000)
npm run start-api      # API server only (port 3001)
```

### Privilege Management

The proxy server binds to the port specified in `.env` (default: 5173 in `.env.dist`).

**Port Requirements:**
- **Port < 1024 (e.g., 443)**: Requires `sudo` on macOS/Linux
  - All three services (proxy, client, API) initially run as root
  - Proxy drops its own privileges after binding to the port
  - Client and API remain running with elevated privileges
  - Use only when you need standard HTTPS port (443) for testing

- **Port >= 1024 (e.g., 5173)**: No `sudo` needed ⭐ **RECOMMENDED**
  - All services run as your normal user (no root)
  - Most secure option for development
  - Works for 99% of development workflows
  - Just run `npm start` without sudo

**Examples:**
```bash
# Using unprivileged port (recommended for local dev)
# Edit .env: PROXY_PORT=5173
npm start              # No sudo needed
# Access at https://localhost:5173

# Using standard HTTPS port
# Edit .env: PROXY_PORT=443
sudo npm start         # Requires sudo
# Access at https://localhost or https://dev.reacdd.it
```

**Security Note:** When running with `sudo` for port 443, all three services start as root. The proxy drops its own privileges after binding (~50ms), but the client and API remain running with elevated privileges throughout their lifecycle. For maximum security, use port 5173 which requires no root access.

### Client Commands
```bash
cd client
npm start              # Vite dev server with hot module replacement
npm run build          # Production build
npm run preview        # Preview production build locally
npm run lint           # Prettier formatting + ESLint (always run after changes!)
```

### API Setup
The API requires Reddit OAuth2 credentials:
1. Create a Reddit app at https://www.reddit.com/prefs/apps
2. Copy `api/.env.dist` to `api/.env`
3. Configure `CLIENT_PATH`, `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_CALLBACK_URI`
4. Test at `http://localhost:3001/api/bearer`

For detailed API configuration and environment variables, see [api/README.md](api/README.md).

### HTTPS Proxy

reacddit requires HTTPS to properly load embedded content and iframes. The included reverse proxy handles this automatically:

- **Local development**: Auto-generates self-signed certificates for `localhost`
- **Custom domains**: Configure `.env` with your domain and certificate paths
- **Production**: Uses CloudFront/ALB for SSL termination (see [DEPLOYMENT.md](DEPLOYMENT.md))

The proxy routes:
- `/api/*` → Koa OAuth API (port 3001)
- Everything else → Vite dev server (port 3000)
- WebSocket support for hot module replacement

**No nginx or external reverse proxy required!**

### Troubleshooting

**"Port 443 requires root privileges"**
```bash
# Solution: Run with sudo
sudo npm start

# Alternative: Use unprivileged port (edit .env)
PROXY_PORT=5173
npm start
```

**"Port already in use"**
```bash
# Find what's using the port
sudo lsof -i :443
# or
sudo lsof -i :5173

# Then either:
# 1. Stop the other process
# 2. Change PROXY_PORT in .env to a different port
```

**Browser shows "Connection refused"**
- Make sure all three services are running (check console output)
- Verify the proxy port in `.env` matches the URL you're accessing
- Client should show "Local: http://localhost:3000"
- API should show "running on http://localhost:3001"
- Proxy should show "running on https://[domain]:[port]"

**Self-signed certificate warnings**
- This is expected for local development
- Click "Advanced" → "Proceed to [domain]" in your browser
- For a cleaner experience, add the certificate to your system's trusted certificates (see [proxy/README.md](proxy/README.md))

## Current Limitations

- **Content creation**: This client supports voting, saving posts, and other interactions, but does not support creating posts or comments
- **Browser support**: Only tested on the latest versions of Chrome, Firefox, and Safari. No plans to support older browsers
- **Mobile testing**: Limited Android testing. Please report any bugs you find!

## Roadmap

The project has undergone active modernization:
1. **Completed**: Full TypeScript migration for both client and API
2. **Completed**: Migrated from Webpack to Vite for improved build performance
3. **Completed**: Migrated to RTK Query for efficient API data fetching and caching
4. **Future**: Add content creation capabilities (posting, commenting)

## Inspiration

Took a lot of inspiration from [Feedly](https://feedly.com) & [Apollo](https://apolloapp.io) - many thanks to those talented developers.

## License

MIT