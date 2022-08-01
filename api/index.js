import app from "./app.js";
import { createServer } from "http";
import dotenv from "dotenv-defaults";

dotenv.config();

createServer(app.callback()).listen(process.env.PORT);
