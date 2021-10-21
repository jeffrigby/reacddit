const { app } = require("./app");
const http = require("http");

require("dotenv-defaults").config();

http.createServer(app.callback()).listen(process.env.PORT);
