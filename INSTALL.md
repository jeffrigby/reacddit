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
cp api/.env.dist api/.env
# Edit api/.env with your Reddit OAuth credentials

# Start development servers
npm start                # Runs both client (port 3000) and API (port 3001)
```

## Environment Setup

### API Environment Variables
Copy `api/.env.dist` to `api/.env` and configure:

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

## NGINX Production Proxy Setup
The easiest way to run both the server and client is to use NGINX to proxy /api calls to the server. Here's a simple example config to accomplish that (this assumes SSL is handled by a proxy like Cloudflare):

```
server {
  listen       80;
  server_name  reacdd.it;
  root         /var/www/reacdd.it/dist;

  error_log /var/log/nginx/reacddit-error.log notice;
  access_log /var/log/nginx/reacddit.log;
  client_max_body_size 100m;

  # serve static files directly:
  location ~* ^.+.(jpg|jpeg|gif|css|png|js|ico|html|xml|txt)$ {
      access_log        off;
      expires           max;
  }

  location ~ ^/(api) {
      proxy_pass http://localhost:3001;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
      proxy_no_cache 1;
      expires epoch;
  }

  location / {
    expires 1h;
    add_header Cache-Control "public, s-maxage=86400, must-revalidate";
    try_files $uri /index.html =404;
  }
}
```
