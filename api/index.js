import { createServer } from "http";
import dotenv from "dotenv-defaults";

dotenv.config({
  path: "./.env",
  encoding: "utf8",
  defaults: "./.env.defaults",
});

// Dynamically import the app after setting the environment variables
const { default: app } = await import("./src/app.js");

createServer(app.callback()).listen(process.env.PORT);
