import type { ExtendedToken } from "./reddit.js";

/**
 * Koa Session Data Structure
 */
export interface SessionData {
  state?: string | null;
  token?: ExtendedToken | null;
}

declare module "koa" {
  interface DefaultContext {
    session: SessionData;
  }
}
