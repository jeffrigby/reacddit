# reacddit
This application consists two parts:
### Server
The server is a simple oauth2 client run via koa2 used only to retrieve or refresh the oauth token from reddit. It does nothing else.
### Client
The client is a reactjs app that handles all communication with Reddit from the browser. This app requires the oauth server to retrieve the token.
### NGINX proxy setup. 