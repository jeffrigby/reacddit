# reacddit

Demo: https://reacdd.it/

This application consists of two parts:

### Server

The server is a simple oauth2 client run via koa2 used only to retrieve or refresh the oauth token from reddit. It does nothing else.

### Client

The client is a React app that handles all communication with Reddit from the browser. This app requires the oauth server to retrieve the token.

### NGINX proxy setup.
The easiest way to run both the server and client is to use NGINX to proxy /api calls to the server. This is a simple setup to accomplish that:

```
server {
  listen       80;
  server_name  example.com;
  root         /var/www/dist;

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
      # DO NOT CACHE!
      proxy_no_cache 1;
      expires epoch;
  }

  location / {
    expires 1h;
    add_header X-Location index;
    try_files $uri /index.html =404;
  }
}
```
