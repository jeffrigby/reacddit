The API server is a simple OAuth2 client served with koa2. This is used only to retrieve or refresh the OAuth token from reddit. You can run this server with node or PM2 and it can run a separate port than the front end, though in production I would run both behind a proxy such as nginx.

Steps to get this running:

1. Go to https://www.reddit.com/prefs/apps and create a `web` app. The most important field is callback. Set this to the full URL of the callback page. This API serves this at `/api/callback` so you would set it to `https://yourdomain.com/api/callback` This setting:
	* Does NOT need to be publicly accessible (http://localhost:3001 will work)
	* HTTP or HTTPS
	* Any port
2. Save and make note of the client, secret, and callback. You must enter these identically in .env
3. Copy .env.dist to .env
4. You can leave the defaults except:
	* CLIENT_PATH: This is where your front end lives.
	* REDDIT_CLIENT_ID: Copied from step 2
	* REDDIT_CLIENT_SECRET: Copied from step 2
	* REDDIT_CALLBACK_URI: Copied from step 2.
	* APP_KEY: Any string. This is used for encyption
5. Start the server (see below)
6. Go to `http://localhost:3000/api/bearer` (replacing localhost with your domain and port) to test. You should see something like the following:

```json
{
  "accessToken":"-I7SkOdEWtI3-2InyMv9OhiWMCJA",
  "expires":1573165030.117,
  "auth":false,
  "type":"new",
  "loginUrl":"https://www.reddit.com/api/v1/authorize?response_type=code&client_id=CeCPAHQqyb4kBA&redirect_uri=https%3A%2F%2Fmydomain%2Fapi%2Fcallback&scope=identity%20mysubreddits%20vote%20subscribe%20read%20history%20save&state=4155fe14-85c7-43c9-b94f-c3c87199d527&duration=permanent"
}
```
 
### .env vars (REQUIRED)
```
# What URL is the reacddit client running on? This is used for redirects back to the client and setting CORS headers
CLIENT_PATH=http://localhost:3000

# Get the Reddit client, secret and callback set here: https://www.reddit.com/prefs/apps
# This must match Exactly.
REDDIT_CLIENT_ID=XXXXXXXXX
REDDIT_CLIENT_SECRET=XXXXXXXXXXXX
REDDIT_CALLBACK_URI=http://localhost:3001/api/callback

# Optional, set change the requested token scope.
# Default: identity,mysubreddits,vote,subscribe,read,history,save
REDDIT_SCOPE=identity,mysubreddits,vote,subscribe,read,history,save

# A random key. These can be any string.
APP_KEY=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789

# A 32 character salt. MUST BE EXACTLY 32 CHARS.
SALT=GITYZTBFHZEEV7G9YAF7HVMXIQ2VV9UM

# How long should the session last?
SESSION_LENGTH_SECS=604800

# What port should koa server run on?
PORT=3001

# Enable debug mode with additional logging.
DEBUG=0
```

### Starting the server
You can use PM2, node, or nodemon in development to start the server.

```bash
# node index.js
# nodemon start
# pm2 index.js --name "reaccddit"
```