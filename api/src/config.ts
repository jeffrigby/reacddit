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
}

const red = chalk.red;

/**
 * Check if a string represents a valid positive integer
 */
function isPositiveInt(value: string | undefined): boolean {
  if (!value) return false;
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
}

/**
 * Check if a string represents a valid non-negative integer
 */
function isNonNegativeInt(value: string | undefined): boolean {
  if (!value) return false;
  const num = Number(value);
  return Number.isInteger(num) && num >= 0;
}

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
  } = process.env;

  const checks = [
    {
      condition: !SALT || SALT.length !== 32,
      message: "The SALT must be exactly 32 characters.",
    },
    {
      condition: SALT && SALT.length === 32 && new Set(SALT).size === 1,
      message: "The SALT must not be all the same character.",
    },
    {
      condition:
        !REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_CALLBACK_URI,
      message:
        "You must enter the REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, and REDDIT_CALLBACK_URI from https://www.reddit.com/prefs/apps",
    },
    {
      condition: PORT && !isPositiveInt(PORT),
      message: "PORT must be a valid positive integer.",
    },
    {
      condition: !isPositiveInt(SESSION_LENGTH_SECS),
      message: "SESSION_LENGTH_SECS must be a valid positive integer.",
    },
    {
      condition: !isNonNegativeInt(TOKEN_EXPIRY_PADDING_SECS),
      message:
        "TOKEN_EXPIRY_PADDING_SECS must be a valid non-negative integer.",
    },
    {
      condition: !CLIENT_PATH,
      message:
        "You must set your CLIENT_PATH. This is the URL to the client app (used for redirects and CORS).",
    },
  ];

  const errors = checks
    .filter((check) => check.condition)
    .map((check) => check.message);

  if (errors.length > 0) {
    errors.forEach((error) => console.log(red(`.env ERROR: ${error}`)));
    process.exit(1);
  }

  if (SALT === TEST_DEFAULTS.SALT) {
    console.log(
      red(
        "WARNING: SALT matches the test default. Generate a unique SALT for production.",
      ),
    );
  }
}

/** Check if running in test mode */
function isTestMode(): boolean {
  return process.env["VITEST"] === "true" || process.env["NODE_ENV"] === "test";
}

/** Test mode defaults for environment variables */
const TEST_DEFAULTS = {
  REDDIT_CLIENT_ID: "test-client-id",
  REDDIT_CLIENT_SECRET: "test-secret",
  REDDIT_CALLBACK_URI: "http://localhost:3001/api/callback",
  CLIENT_PATH: "http://localhost:3000",
  SALT: "GITYZTBFHZEEV7G9YAF7HVMXIQ2VV9UM",
  SESSION_LENGTH_SECS: "604800",
  TOKEN_EXPIRY_PADDING_SECS: "300",
} as const;

/**
 * Get environment variable with optional test mode fallback
 */
function getEnvVar(key: keyof typeof TEST_DEFAULTS, fallback = ""): string {
  return process.env[key] || (isTestMode() ? TEST_DEFAULTS[key] : fallback);
}

/**
 * Loads and validates configuration from environment variables
 * @returns Validated and typed configuration object
 * @throws Calls process.exit(1) if validation fails
 */
function loadConfig(): AppConfig {
  validateEnv();

  return {
    REDDIT_CLIENT_ID: getEnvVar("REDDIT_CLIENT_ID"),
    REDDIT_CLIENT_SECRET: getEnvVar("REDDIT_CLIENT_SECRET"),
    REDDIT_CALLBACK_URI: getEnvVar("REDDIT_CALLBACK_URI"),
    REDDIT_SCOPE:
      process.env["REDDIT_SCOPE"] ||
      "identity,mysubreddits,vote,subscribe,read,history,save",
    CLIENT_PATH: getEnvVar("CLIENT_PATH"),
    SALT: getEnvVar("SALT"),
    SESSION_LENGTH_SECS: parseInt(getEnvVar("SESSION_LENGTH_SECS", "0")),
    TOKEN_EXPIRY_PADDING_SECS: parseInt(
      getEnvVar("TOKEN_EXPIRY_PADDING_SECS", "0"),
    ),
    PORT: parseInt(process.env["PORT"] || "3001"),
  };
}

/**
 * Validated application configuration
 * Use this instead of process.env for type safety
 */
export const config = loadConfig();
