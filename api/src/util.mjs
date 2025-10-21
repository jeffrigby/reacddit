import axios from "axios";
import chalk from "chalk";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

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

export const axiosInstance = axios.create({
  baseURL: "https://www.reddit.com",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  auth: {
    username: REDDIT_CLIENT_ID,
    password: REDDIT_CLIENT_SECRET,
  },
});

const red = chalk.red;

/**
 * Checks if the token is expired. Pads the expiry time by TOKEN_EXPIRY_PADDING_SECS.
 * @param {Object} token - The token object
 * @returns {boolean} - Returns true if the token is expired, false otherwise
 */
export function isTokenExpired(token) {
  const { TOKEN_EXPIRY_PADDING_SECS } = process.env;

  if (!token || !token.expires) {
    return true;
  }
  const now = Date.now() / 1000; // Convert to Unix timestamp (seconds since Unix epoch)
  return token.expires - parseInt(TOKEN_EXPIRY_PADDING_SECS) <= now;
}

/**
 * Adds additional info to the token object (expires timestamp and auth flag)
 * @param {Object} token - The token object from Reddit API
 * @param {boolean} auth - If the token is authorized (true) or anonymous (false)
 * @returns {Object} - The token object with additional info (expires, auth)
 */
export function addExtraInfoToToken(token, auth = false) {
  const now = Date.now() / 1000; // Convert to Unix timestamp (seconds since Unix epoch)
  const expires = now + token.expires_in - 120;

  return {
    ...token,
    expires,
    auth,
  };
}

/**
 * Validates environment variables and exits with error messages if any are invalid
 * @throws {void} Calls process.exit(1) if validation fails
 */
export function checkEnvErrors() {
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
 * Encrypt the token for storage in the cookie. The IV is
 * unique for every token.
 * @param {object} token The token object
 * @returns {{iv: string, token: string}}
 */
export const encryptToken = (token) => {
  const iv = randomBytes(parseInt(IV_LENGTH));
  const tokenString = JSON.stringify(token);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(SALT), iv);
  let encrypted = cipher.update(tokenString);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), token: encrypted.toString("hex") };
};

/**
 * Decrypt the session token cookie
 * @param {object} encryptedToken - The encrypted token object with iv and token properties
 * @returns {any} The decrypted token object
 * @throws {Error} If the token is invalid or decryption fails
 */
export const decryptToken = (encryptedToken) => {
  if (
    !encryptedToken ||
    encryptedToken.iv === undefined ||
    encryptedToken.token === undefined
  ) {
    throw new Error("Invalid encrypted token: missing iv or token");
  }

  try {
    const iv = Buffer.from(encryptedToken.iv, "hex");
    const encryptedText = Buffer.from(encryptedToken.token, "hex");
    const decipher = createDecipheriv(
      ENCRYPTION_ALGORITHM,
      Buffer.from(SALT),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return JSON.parse(decrypted.toString());
  } catch (error) {
    console.error("Failed to decrypt token:", error.message);
    throw new Error(`Token decryption failed: ${error.message}`);
  }
};
