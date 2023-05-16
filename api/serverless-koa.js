const { app } = require("./src/app.js");
const serverless = require("serverless-http");

module.exports.handler = serverless(app);
