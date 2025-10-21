The API server is a simple OAuth2 client served with koa2. This is used only to retrieve or refresh the OAuth token from reddit. You can run this server with node or PM2 and it can run a separate port than the front end, though in production I would run both behind a proxy such as nginx.

Steps to get this running:

1. Go to https://www.reddit.com/prefs/apps and create a `web` app. The most important field is callback. Set this to the full URL of the callback page. This API serves this at `/api/callback` so you would set it to `https://yourdomain.com/api/callback` This setting:
	* Does NOT need to be publicly accessible (http://localhost:3001 will work)
	* HTTP or HTTPS
	* Any port
2. Save and make note of the client, secret, and callback. You must enter these identically in .env
3. Copy .env.example to .env
4. You can leave the defaults except:
	* CLIENT_PATH: This is where your front end lives (optional, defaults set in .env.defaults)
	* REDDIT_CLIENT_ID: Copied from step 2 (REQUIRED)
	* REDDIT_CLIENT_SECRET: Copied from step 2 (REQUIRED)
	* REDDIT_CALLBACK_URI: Copied from step 2 (REQUIRED)
	* SALT: A random 32-character string for encryption (REQUIRED)
5. Start the server (see below)
6. Go to `http://localhost:3001/api/bearer` (replacing localhost with your domain and port) to test. You should see something like the following:

```json
{
  "accessToken":"-I7SkOdEWtI3-2InyMv9OhiWMCJA",
  "expires":1573165030.117,
  "auth":false,
  "type":"new",
  "loginUrl":"https://www.reddit.com/api/v1/authorize?response_type=code&client_id=CeCPAHQqyb4kBA&redirect_uri=https%3A%2F%2Fmydomain%2Fapi%2Fcallback&scope=identity%20mysubreddits%20vote%20subscribe%20read%20history%20save&state=4155fe14-85c7-43c9-b94f-c3c87199d527&duration=permanent"
}
```
 
### Environment Variables

The project uses three environment files:
- **`.env`** - Your local configuration (gitignored, you create this)
- **`.env.example`** - Template showing required variables (committed to repo)
- **`.env.defaults`** - Default values for optional settings (committed to repo)

#### Required Variables (must be set in `.env`)
```bash
# Get the Reddit client, secret and callback from: https://www.reddit.com/prefs/apps
# These must match exactly what you configured on Reddit
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
REDDIT_CALLBACK_URI=http://localhost:3001/api/callback

# A 32-character salt for encryption (MUST BE EXACTLY 32 CHARS)
# Generate a random string for this
SALT=GITYZTBFHZEEV7G9YAF7HVMXIQ2VV9UM
```

#### Optional Variables (defaults in `.env.defaults`)
```bash
# What URL is the reacddit client running on?
# Used for redirects and CORS headers
# Default: https://localhost
CLIENT_PATH=http://localhost:3000

# Reddit OAuth scope (comma-separated)
# Default: identity,mysubreddits,vote,subscribe,read,history,save
REDDIT_SCOPE=identity,mysubreddits,vote,subscribe,read,history,save

# Session length in seconds
# Default: 1209600 (14 days)
SESSION_LENGTH_SECS=604800

# Token expiry padding in seconds (refresh before actual expiry)
# Default: 300 (5 minutes)
TOKEN_EXPIRY_PADDING_SECS=300

# What port should the Koa server run on?
# Default: 3001
PORT=3001

# Enable debug mode with additional logging
# Default: 0
DEBUG=0

# Encryption settings (advanced)
# Default: aes-256-cbc
ENCRYPTION_ALGORITHM=aes-256-cbc
# Default: 16
IV_LENGTH=16
```

### Starting the server
You can use PM2, node, or nodemon in development to start the server.

```bash
# node index.mjs
# nodemon start
# pm2 index.mjs --name "reaccddit"
```