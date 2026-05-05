import type { ExtendedToken } from './reddit.js';

export interface SessionData {
  state?: string;
  token?: ExtendedToken;
}

declare module 'koa' {
  interface DefaultContext {
    session: SessionData;
  }
}
