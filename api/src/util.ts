import axios from "axios";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { config } from "./config.js";
import type {
  RedditAccessTokenResponse,
  ExtendedToken,
  EncryptedToken,
} from "./types/reddit.js";

export const axiosInstance = axios.create({
  baseURL: "https://www.reddit.com",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  auth: {
    username: config.REDDIT_CLIENT_ID,
    password: config.REDDIT_CLIENT_SECRET,
  },
});

/**
 * Checks if the token is expired. Pads the expiry time by TOKEN_EXPIRY_PADDING_SECS.
 * @param token - The token object
 * @returns Returns true if the token is expired, false otherwise
 */
export function isTokenExpired(
  token: ExtendedToken | null | undefined,
): boolean {
  if (!token || !token.expires) {
    return true;
  }
  const now = Date.now() / 1000; // Convert to Unix timestamp (seconds since Unix epoch)
  return token.expires - config.TOKEN_EXPIRY_PADDING_SECS <= now;
}

/**
 * Adds additional info to the token object (expires timestamp and auth flag)
 * @param token - The token object from Reddit API
 * @param auth - If the token is authorized (true) or anonymous (false)
 * @returns The token object with additional info (expires, auth)
 */
export function addExtraInfoToToken(
  token: RedditAccessTokenResponse,
  auth = false,
): ExtendedToken {
  const now = Date.now() / 1000; // Convert to Unix timestamp (seconds since Unix epoch)
  const expires = now + token.expires_in - 120;

  return {
    ...token,
    expires,
    auth,
  };
}

/**
 * Encrypt the token for storage in the cookie. The IV is
 * unique for every token.
 * @param token - The token object
 * @returns Object containing IV and encrypted token
 */
export function encryptToken(token: unknown): EncryptedToken {
  const iv = randomBytes(config.IV_LENGTH);
  const tokenString = JSON.stringify(token);
  const cipher = createCipheriv(
    config.ENCRYPTION_ALGORITHM,
    Buffer.from(config.SALT),
    iv,
  );
  let encrypted = cipher.update(tokenString);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), token: encrypted.toString("hex") };
}

/**
 * Decrypt the session token cookie
 * @param encryptedToken - The encrypted token object with iv and token properties
 * @returns The decrypted token object
 * @throws If the token is invalid or decryption fails
 */
export function decryptToken(encryptedToken: EncryptedToken): unknown {
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
      config.ENCRYPTION_ALGORITHM,
      Buffer.from(config.SALT),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return JSON.parse(decrypted.toString());
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to decrypt token:", errorMessage);
    throw new Error(`Token decryption failed: ${errorMessage}`);
  }
}
