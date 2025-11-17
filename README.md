# reacddit

A Reddit client built with React that supports enhanced media viewing and additional embedded content types beyond the official Reddit app.

## Demo

Live demo: https://reacdd.it/

reacddit is a monorepo containing an OAuth2 API (for Reddit authentication) and a React browser client. Both need to be running for local development.

## Tech Stack

- **Frontend**: React 19, Redux Toolkit, React Router 7, TypeScript
- **Build System**: Vite 6 with SWC for fast builds and hot module replacement
- **Backend**: Koa.js OAuth2 server (TypeScript) - [API docs](api/README.md)
- **Deployment**: AWS Lambda with SAM/CloudFormation - [Deployment guide](DEPLOYMENT.md)
- **PWA**: Full Progressive Web App support with Vite PWA plugin

## Features

### Core Features
- **Authenticated support**: View multis and subscribed subreddits
- **Enhanced embeds**: Additional embeddable content types beyond reddit.com and the official app
- **Live streaming**: Stream new results from any listing page
- **Comment viewing**: Full comment threading and viewing
- **Quick access**: View upvotes, downvotes, submissions, saved posts, and friends
- **Subreddit activity tracking**: See which subreddits were recently updated in the navigation (continually updates as you browse)
  - New badge = < 30m
  - **Bold** = < 1D
  - Normal Text = < 3MO
  - Faded = >3MO
- **Keyboard navigation**: Hotkeys available (press shift-? to view)
- **Cross-platform**: Available on mobile (in-browser or PWA) and desktop
- **Duplicate detection**: View duplicate posts or all posts from a domain
- **Flexible viewing**: Individual post collapse/expand

### Embed System
- Inline rendering for YouTube, Twitter, Instagram, Vimeo, and other content types
- Embed rendering for inline links in text posts
- Plugin-based architecture supporting custom embed handlers
- iFrame, video, and image embed support

### Privacy
- Client-side processing: All data is handled in the browser except for OAuth2 authentication
- No server-side logging or storage of Reddit account data or browser information

## Development

### Quick Start

**Option 1: Interactive Setup Wizard (Recommended)**
```bash
# 1. Install dependencies
npm install              # Root (also installs client, API, proxy dependencies)

# 2. Run the setup wizard
npm run setup            # Interactive wizard guides you through configuration

# 3. Start everything (proxy + client + API)
npm start

# Access the app at the URL shown (e.g., https://localhost:5173)
# Your browser will warn about self-signed certificates - this is expected
# Click "Advanced" → "Proceed to localhost" to continue
```

The setup wizard will guide you through:
- Domain and port configuration (localhost or custom domain)
- Reddit OAuth app creation (opens browser with step-by-step instructions)
- SSL certificate setup (auto-generates self-signed certs for local development)
- Environment file generation (creates .env, api/.env, client/.env)

**Auto-run:** If you skip the wizard and run `npm start` without configuration, it will automatically prompt you to run the setup wizard.

**Option 2: Manual Setup**
```bash
# 1. Install dependencies
npm install              # Root
cd client && npm install # Client
cd ../api && npm install # API
cd ../proxy && npm install # Proxy
cd ..

# 2. Configure environment manually
cp .env.dist .env        # Copy template and adjust if needed
# See API Setup section below for Reddit OAuth configuration

# 3. Start everything
npm start              # For default port 5173 (unprivileged)
# OR
sudo npm start         # For port 443 (requires root on macOS/Linux)
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

**Why Port Numbers Matter:**

Ports below 1024 are called "privileged ports" or "well-known ports" and are reserved for system services. On Unix-like systems (macOS, Linux), only the root user can bind to these ports. This is a security feature to prevent regular users from running malicious services that impersonate legitimate system services (like HTTPS on port 443 or HTTP on port 80).

**Port Requirements:**
- **Port < 1024 (e.g., 443)**: Requires `sudo` on macOS/Linux due to OS security restrictions
  - The start script uses `sudo` to bind to the privileged port
  - **Proxy**: Runs as root initially, then drops to your user account after binding (~50ms)
  - **Client and API**: Always run as your user account (via `sudo -u $SUDO_USER`), never as root
  - This approach minimizes security risk while allowing privileged port binding
  - Use only when you need standard HTTPS port (443) for testing with external devices or specific OAuth callbacks

- **Port >= 1024 (e.g., 5173)**: No `sudo` needed ⭐ **RECOMMENDED**
  - All services run as your normal user (no root privileges)
  - Most secure option for development
  - Works for 99% of development workflows
  - Just run `npm start` without sudo

**Examples:**
```bash
# Using unprivileged port (recommended for local dev)
# Edit .env: PROXY_PORT=5173
npm start              # No sudo needed
# Access at https://localhost:5173

# Using standard HTTPS port (requires root)
# Edit .env: PROXY_PORT=443
sudo npm start         # Requires sudo
# Access at https://localhost or custom domain
```

**Security Note:** When running with `sudo` for port 443, only the proxy temporarily runs as root to bind to the privileged port, then immediately drops to your user account. The client and API always run as your user account (never as root). For maximum security and to avoid `sudo` entirely, use port 5173.

### Client Commands
```bash
cd client
npm start              # Vite dev server with hot module replacement
npm run build          # Production build
npm run preview        # Preview production build locally
npm run lint           # Prettier formatting + ESLint (always run after changes!)
```

### API Setup

**Recommended:** Use the setup wizard (`npm run setup`) which handles Reddit OAuth configuration automatically, including:
- Guides you through creating a Reddit app with the correct settings
- Shows you the exact redirect URI to use (based on your chosen domain/port)
- Auto-generates secure encryption keys
- Creates all configuration files with proper interdependencies

**Manual API Setup** (if not using wizard):

The API requires Reddit OAuth2 credentials to authenticate with Reddit:

1. **Create a Reddit app** at https://www.reddit.com/prefs/apps
   - Click "create app" or "create another app"
   - Choose **"web app"** as the app type (IMPORTANT: not "installed app")
   - Set the redirect URI to `https://localhost:5173/api/callback` (or your custom domain/port)
   - Note the **client ID** (under the app name) and **client secret** (click "edit" to reveal)

2. Copy `api/.env.example` to `api/.env`

3. Configure the following in `api/.env`:
   - `REDDIT_CLIENT_ID` - The client ID from step 1
   - `REDDIT_CLIENT_SECRET` - The client secret from step 1
   - `REDDIT_CALLBACK_URI` - Must match the redirect URI from step 1
   - `SALT` - Generate with: `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"`
   - `CLIENT_PATH` - Your frontend URL (e.g., `https://localhost:5173`)

4. Test at `http://localhost:3001/api/bearer` to verify configuration

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

No nginx or external reverse proxy required.

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
- To avoid warnings, add the certificate to your system's trusted certificates (see [proxy/README.md](proxy/README.md))

## Current Limitations

- **Content creation**: This client supports voting, saving posts, and other interactions, but does not support creating posts or comments
- **Browser support**: Only tested on the latest versions of Chrome, Firefox, and Safari. No plans to support older browsers
- **Mobile testing**: Limited Android testing

## Roadmap

The project has undergone active modernization:
1. **Completed**: Full TypeScript migration for both client and API
2. **Completed**: Migrated from Webpack to Vite for improved build performance
3. **Completed**: Migrated to RTK Query for efficient API data fetching and caching
4. **Future**: Add content creation capabilities (posting, commenting)

## Inspiration

Inspired by [Feedly](https://feedly.com) and [Apollo](https://apolloapp.io).

## License

MIT