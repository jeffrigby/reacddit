import axios from 'axios';
import {
  createCipheriv,
  createDecipheriv,
  hkdfSync,
  randomBytes,
} from 'crypto';
import { config } from './config.js';
import { logger } from './logger.js';
import type {
  RedditAccessTokenResponse,
  ExtendedToken,
  EncryptedToken,
} from './types/reddit.js';

/**
 * Extract a message string from an unknown error value
 */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** AES-256-GCM constants */
const GCM_ALGORITHM = 'aes-256-gcm';
const GCM_IV_LENGTH = 12;
const GCM_AUTH_TAG_LENGTH = 16;

/** Cached encryption key derived once at startup via HKDF */
const encryptionKey = Buffer.from(
  hkdfSync('sha256', config.SALT, '', 'encryption', 32)
);

/**
 * Derive a signing key from the SALT using HKDF for cookie signing
 * @returns Hex-encoded 32-byte key string for use as Koa app.keys
 */
export function deriveSigningKey(): string {
  return Buffer.from(
    hkdfSync('sha256', config.SALT, '', 'signing', 32)
  ).toString('hex');
}

export const axiosInstance = axios.create({
  baseURL: 'https://www.reddit.com',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
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
  token: ExtendedToken | null | undefined
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
  auth = false
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
 * Encrypt the token for storage in the cookie using AES-256-GCM.
 * The IV is unique for every token. The auth tag provides authenticated
 * encryption, preventing padding oracle attacks.
 * @param token - The token object
 * @returns Object containing IV, auth tag, and encrypted token
 */
export function encryptToken(token: unknown): EncryptedToken {
  const iv = randomBytes(GCM_IV_LENGTH);
  const tokenString = JSON.stringify(token);
  const cipher = createCipheriv(GCM_ALGORITHM, encryptionKey, iv, {
    authTagLength: GCM_AUTH_TAG_LENGTH,
  });
  let encrypted = cipher.update(tokenString);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    token: encrypted.toString('hex'),
  };
}

/**
 * Decrypt the session token cookie using AES-256-GCM.
 * If decryption fails (e.g., old CBC-encrypted tokens), returns null
 * so the session is treated as new (forces re-authentication).
 * @param encryptedToken - The encrypted token object with iv, authTag, and token properties
 * @returns The decrypted token object, or null if decryption fails
 */
export function decryptToken(encryptedToken: EncryptedToken): unknown {
  if (
    !encryptedToken ||
    encryptedToken.iv === undefined ||
    encryptedToken.authTag === undefined ||
    encryptedToken.token === undefined
  ) {
    return null;
  }

  try {
    const iv = Buffer.from(encryptedToken.iv, 'hex');
    const authTag = Buffer.from(encryptedToken.authTag, 'hex');
    const encryptedText = Buffer.from(encryptedToken.token, 'hex');
    const decipher = createDecipheriv(GCM_ALGORITHM, encryptionKey, iv, {
      authTagLength: GCM_AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return JSON.parse(decrypted.toString());
  } catch (error) {
    logger.error('Failed to decrypt token', { error: getErrorMessage(error) });
    // Return null for any decryption failure (including old CBC-encrypted sessions).
    // This forces a new session instead of falling back to insecure decryption.
    return null;
  }
}
