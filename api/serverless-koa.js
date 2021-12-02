const { app } = require("./app");
const serverless = require("serverless-http");

module.exports.handler = serverless(app);
