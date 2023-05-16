import app from "./src/app.js";
import serverless from "serverless-http";

// Load environment variables
// @todo convert to ssm parameter store
const envPath = process.env.ENVFILE ? process.env.ENVFILE : "./.env";

dotenv.config({
  path: envPath,
  encoding: "utf8",
  defaults: "./.env.defaults", // This is new
});

export const handler = serverless(app);
