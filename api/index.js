import dotenv from "dotenv-defaults";
import { createServer } from "http";

// Load environment variables
const envPath = process.env.ENVFILE ? process.env.ENVFILE : "./.env";

dotenv.config({
  path: envPath,
  encoding: "utf8",
  defaults: "./.env.defaults", // This is new
});

import app from "./src/app.js";

createServer(app.callback()).listen(process.env.PORT);
