declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REDDIT_CLIENT_ID?: string;
      REDDIT_CLIENT_SECRET?: string;
      REDDIT_CALLBACK_URI?: string;
      REDDIT_SCOPE?: string;
      CLIENT_PATH?: string;
      SALT?: string;
      SESSION_LENGTH_SECS?: string;
      TOKEN_EXPIRY_PADDING_SECS?: string;
      PORT?: string;
      ENCRYPTION_ALGORITHM?: string;
      IV_LENGTH?: string;
      DEBUG?: string;
      ENV_SSM_PARAM?: string;
    }
  }
}

export {};
