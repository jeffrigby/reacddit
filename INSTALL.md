# reacddit

Demo: https://reacdd.it/

This application consists of two parts:

### Server
The server is a simple oauth2 client run via koa2 used only to retrieve or refresh the oauth token from reddit. It does nothing else. You can run this server with node or PM2.
#### .env vars

### Client
The client is a React app that handles all communication with Reddit from the browser. This app requires the oauth server to retrieve the token.
### NGINX Production proxy setup.
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
