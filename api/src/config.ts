import chalk from "chalk";

/**
 * Application Configuration
 * All environment variables are validated and parsed here
 */
interface AppConfig {
  REDDIT_CLIENT_ID: string;
  REDDIT_CLIENT_SECRET: string;
  REDDIT_CALLBACK_URI: string;
  REDDIT_SCOPE: string;
  CLIENT_PATH: string;
  SALT: string;
  SESSION_LENGTH_SECS: number;
  TOKEN_EXPIRY_PADDING_SECS: number;
  PORT: number;
  ENCRYPTION_ALGORITHM: string;
  IV_LENGTH: number;
}

const red = chalk.red;

/**
 * Validates environment variables and exits with error messages if any are invalid
 * @throws Calls process.exit(1) if validation fails (except in test mode)
 */
function validateEnv(): void {
  // Skip validation in test mode - tests will mock env vars
  if (process.env["VITEST"] === "true" || process.env["NODE_ENV"] === "test") {
    return;
  }

  const {
    REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET,
    REDDIT_CALLBACK_URI,
    CLIENT_PATH,
    SALT,
    SESSION_LENGTH_SECS,
    TOKEN_EXPIRY_PADDING_SECS,
    PORT,
    ENCRYPTION_ALGORITHM,
    IV_LENGTH,
  } = process.env;

  const checks = [
    {
      condition: !SALT || SALT.length !== 32,
      message: "The SALT must be exactly 32 characters.",
    },
    {
      condition:
        !REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_CALLBACK_URI,
      message:
        "You must enter the REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, and REDDIT_CALLBACK_URI from https://www.reddit.com/prefs/apps",
    },
    {
      condition:
        PORT && (!Number.isInteger(Number(PORT)) || !(parseInt(PORT) > 0)),
      message: "PORT must be a valid positive integer.",
    },
    {
      condition:
        !SESSION_LENGTH_SECS ||
        !Number.isInteger(Number(SESSION_LENGTH_SECS)) ||
        !(parseInt(SESSION_LENGTH_SECS) > 0),
      message: "SESSION_LENGTH_SECS must be a valid positive integer.",
    },
    {
      condition:
        !TOKEN_EXPIRY_PADDING_SECS ||
        !Number.isInteger(Number(TOKEN_EXPIRY_PADDING_SECS)) ||
        !(parseInt(TOKEN_EXPIRY_PADDING_SECS) >= 0),
      message:
        "TOKEN_EXPIRY_PADDING_SECS must be a valid non-negative integer.",
    },
    {
      condition: !CLIENT_PATH,
      message:
        "You must set your CLIENT_PATH. This is the URL to the client app (used for redirects and CORS).",
    },
    {
      condition: !ENCRYPTION_ALGORITHM,
      message: "ENCRYPTION_ALGORITHM must be set (default: aes-256-cbc).",
    },
    {
      condition:
        !IV_LENGTH ||
        !Number.isInteger(Number(IV_LENGTH)) ||
        !(parseInt(IV_LENGTH) > 0),
      message: "IV_LENGTH must be a valid positive integer (default: 16).",
    },
  ];

  const errors = checks
    .filter((check) => check.condition)
    .map((check) => check.message);

  if (errors.length > 0) {
    errors.forEach((error) => console.log(red(`.env ERROR: ${error}`)));
    process.exit(1);
  }
}

/**
 * Loads and validates configuration from environment variables
 * @returns Validated and typed configuration object
 * @throws Calls process.exit(1) if validation fails
 */
function loadConfig(): AppConfig {
  validateEnv();

  const {
    REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET,
    REDDIT_CALLBACK_URI,
    REDDIT_SCOPE,
    CLIENT_PATH,
    SALT,
    SESSION_LENGTH_SECS,
    TOKEN_EXPIRY_PADDING_SECS,
    PORT,
    ENCRYPTION_ALGORITHM,
    IV_LENGTH,
  } = process.env;

  // In test mode, provide safe defaults if env vars are missing
  const isTestMode = process.env["VITEST"] === "true" || process.env["NODE_ENV"] === "test";

  return {
    REDDIT_CLIENT_ID: REDDIT_CLIENT_ID || (isTestMode ? "test-client-id" : ""),
    REDDIT_CLIENT_SECRET: REDDIT_CLIENT_SECRET || (isTestMode ? "test-secret" : ""),
    REDDIT_CALLBACK_URI: REDDIT_CALLBACK_URI || (isTestMode ? "http://localhost:3001/api/callback" : ""),
    REDDIT_SCOPE:
      REDDIT_SCOPE || "identity,mysubreddits,vote,subscribe,read,history,save",
    CLIENT_PATH: CLIENT_PATH || (isTestMode ? "http://localhost:3000" : ""),
    SALT: SALT || (isTestMode ? "GITYZTBFHZEEV7G9YAF7HVMXIQ2VV9UM" : ""),
    SESSION_LENGTH_SECS: parseInt(SESSION_LENGTH_SECS || (isTestMode ? "604800" : "0")),
    TOKEN_EXPIRY_PADDING_SECS: parseInt(TOKEN_EXPIRY_PADDING_SECS || (isTestMode ? "300" : "0")),
    PORT: parseInt(PORT || "3001"),
    ENCRYPTION_ALGORITHM: ENCRYPTION_ALGORITHM || (isTestMode ? "aes-256-cbc" : ""),
    IV_LENGTH: parseInt(IV_LENGTH || (isTestMode ? "16" : "0")),
  };
}

/**
 * Validated application configuration
 * Use this instead of process.env for type safety
 */
export const config = loadConfig();
