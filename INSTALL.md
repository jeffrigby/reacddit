# reacddit Installation Guide

Demo: https://reacdd.it/

This application is a monorepo consisting of two parts:

## Server (API)
A TypeScript OAuth2 server built with Koa.js used exclusively for Reddit authentication. The API:
- Retrieves and refreshes Reddit OAuth tokens
- Runs with Node.js using tsx for TypeScript execution
- Can be run with nodemon (development) or PM2 (production)
- Requires environment variables (see `.env` configuration below)

## Client
A TypeScript React 19 application that handles all Reddit communication from the browser. Features:
- Redux Toolkit for state management
- React Router 7 for routing
- Webpack 5 with ESBuild loader
- Full Progressive Web App support
- Requires the OAuth API to authenticate users
## Quick Start

```bash
# Install dependencies
npm install              # Root (both client and API)
cd client && npm install # Client dependencies
cd ../api && npm install # API dependencies
cd ..

# Configure API environment
cp api/.env.example api/.env
# Edit api/.env with your Reddit OAuth credentials
# Get credentials by creating an app at https://www.reddit.com/prefs/apps

# Start development servers
npm start                # Runs both client (port 3000) and API (port 3001)
```

## Environment Setup

### Reddit OAuth Setup

Before configuring the API, you need Reddit OAuth2 credentials:

1. **Create a Reddit app** at https://www.reddit.com/prefs/apps
   - Click "create app" or "create another app"
   - Choose "web app" as the app type
   - Set the redirect URI to `https://localhost:5173/api/callback` (or your custom domain)
   - Note the **client ID** (under the app name) and **client secret**

### API Environment Variables
Copy `api/.env.example` to `api/.env` and configure with the credentials from above:

```env
# Reddit OAuth2 Configuration
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
REDDIT_CALLBACK_URI=https://yourdomain.com/api/callback

# Security
SALT=your_32_character_encryption_salt

# Client Configuration
CLIENT_PATH=https://yourdomain.com

# Session Configuration
SESSION_LENGTH_SECS=2592000
IV_LENGTH=16
ENCRYPTION_ALGORITHM=aes-256-cbc
```

See the main README.md for detailed setup instructions.

## HTTPS Reverse Proxy Setup

reacddit includes a built-in HTTPS reverse proxy for local development. This eliminates the need to install and configure nginx or other external reverse proxies.

### Local Development (Included Proxy)

The included Node.js proxy automatically:
- Generates self-signed SSL certificates for localhost
- Routes `/api/*` to the Koa API server (port 3001)
- Routes all other requests to the Vite dev server (port 3000)
- Supports WebSocket for hot module replacement
- Adds production-grade security headers

Start the development servers:
```bash
npm start  # Starts proxy + client + API
# Access at https://localhost:5173
```

For custom domains with Let's Encrypt certificates, configure `.env`:
```bash
PROXY_DOMAIN=dev.yourdomain.com
PROXY_CERT_PATH=/path/to/fullchain.pem
PROXY_KEY_PATH=/path/to/privkey.pem
```

See [proxy/README.md](proxy/README.md) for detailed proxy configuration.

### Production Deployment

For production, use the included AWS SAM template which provisions CloudFront for SSL termination and routing. See [DEPLOYMENT.md](DEPLOYMENT.md) for instructions.

Alternatively, if you prefer nginx for production, see `nginx.conf.example` in the repository root for a reference configuration.
