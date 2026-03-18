import { describe, it, expect, beforeAll, vi } from "vitest";

beforeAll(() => {
  vi.stubEnv("REDDIT_CLIENT_ID", "test-client-id");
  vi.stubEnv("REDDIT_CLIENT_SECRET", "test-client-secret");
  vi.stubEnv("REDDIT_USER_AGENT", "test-user-agent");
  vi.stubEnv("REDDIT_CALLBACK_URI", "http://localhost:3001/api/callback");
  vi.stubEnv("CLIENT_PATH", "http://localhost:3000");
  vi.stubEnv("SALT", "GITYZTBFHZEEV7G9YAF7HVMXIQ2VV9UM");
  vi.stubEnv("SESSION_LENGTH_SECS", "604800");
  vi.stubEnv("TOKEN_EXPIRY_PADDING_SECS", "300");
  vi.stubEnv("PORT", "3001");
});

describe("AES-256-GCM Encryption (C-3 fix)", () => {
  it("should encrypt and decrypt a token round-trip", async () => {
    const { encryptToken, decryptToken } = await import("../util.js");
    const original = {
      access_token: "test-token-abc123",
      refresh_token: "refresh-xyz789",
      expires: 1234567890,
      auth: true,
    };
    const encrypted = encryptToken(original);
    const decrypted = decryptToken(encrypted);
    expect(decrypted).toEqual(original);
  });

  it("should produce different ciphertexts for the same input (unique IVs)", async () => {
    const { encryptToken } = await import("../util.js");
    const token = { access_token: "same-token", expires: 9999 };
    const a = encryptToken(token);
    const b = encryptToken(token);
    expect(a.iv).not.toBe(b.iv);
    expect(a.token).not.toBe(b.token);
  });

  it("should include an authTag in the encrypted output", async () => {
    const { encryptToken } = await import("../util.js");
    const encrypted = encryptToken({ test: true });
    expect(encrypted.authTag).toBeDefined();
    expect(typeof encrypted.authTag).toBe("string");
    // GCM auth tag is 16 bytes = 32 hex chars
    expect(encrypted.authTag).toHaveLength(32);
  });

  it("should include a 12-byte IV (24 hex chars)", async () => {
    const { encryptToken } = await import("../util.js");
    const encrypted = encryptToken({ test: true });
    // GCM IV is 12 bytes = 24 hex chars
    expect(encrypted.iv).toHaveLength(24);
  });

  it("should reject tampered ciphertext", async () => {
    const { encryptToken, decryptToken } = await import("../util.js");
    const encrypted = encryptToken({ secret: "data" });
    // Flip a character in the ciphertext
    const tampered = {
      ...encrypted,
      token:
        encrypted.token.slice(0, -1) +
        (encrypted.token.slice(-1) === "0" ? "1" : "0"),
    };
    const result = decryptToken(tampered);
    expect(result).toBeNull();
  });

  it("should reject tampered authTag", async () => {
    const { encryptToken, decryptToken } = await import("../util.js");
    const encrypted = encryptToken({ secret: "data" });
    const tampered = {
      ...encrypted,
      authTag: "00".repeat(16), // zeroed-out auth tag
    };
    const result = decryptToken(tampered);
    expect(result).toBeNull();
  });

  it("should reject tampered IV", async () => {
    const { encryptToken, decryptToken } = await import("../util.js");
    const encrypted = encryptToken({ secret: "data" });
    const tampered = {
      ...encrypted,
      iv: "00".repeat(12), // zeroed-out IV
    };
    const result = decryptToken(tampered);
    expect(result).toBeNull();
  });

  it("should return null for missing fields", async () => {
    const { decryptToken } = await import("../util.js");
    expect(decryptToken(null as never)).toBeNull();
    expect(decryptToken(undefined as never)).toBeNull();
    expect(decryptToken({} as never)).toBeNull();
    expect(decryptToken({ iv: "aa", token: "bb" } as never)).toBeNull();
  });

  it("should return null for old CBC-format tokens (no authTag)", async () => {
    const { decryptToken } = await import("../util.js");
    // Simulate an old CBC-encrypted token structure
    const oldFormat = {
      iv: "abcdef1234567890abcdef1234567890", // 32 hex = 16 bytes (CBC IV)
      authTag: "", // empty or missing
      token: "deadbeef".repeat(8),
    };
    const result = decryptToken(oldFormat);
    expect(result).toBeNull();
  });

  it("should derive separate signing and encryption keys", async () => {
    const { deriveSigningKey } = await import("../util.js");
    const signingKey = deriveSigningKey();
    expect(typeof signingKey).toBe("string");
    // 32 bytes = 64 hex chars
    expect(signingKey).toHaveLength(64);

    // Verify signing key is deterministic
    const signingKey2 = deriveSigningKey();
    expect(signingKey).toBe(signingKey2);
  });

  it("should handle complex nested token objects", async () => {
    const { encryptToken, decryptToken } = await import("../util.js");
    const complex = {
      access_token: "tk_abc",
      token_type: "bearer",
      expires_in: 3600,
      scope: "read,write",
      refresh_token: "rf_xyz",
      expires: Date.now() / 1000 + 3600,
      auth: true,
      nested: { a: [1, 2, 3], b: { c: "deep" } },
    };
    const encrypted = encryptToken(complex);
    const decrypted = decryptToken(encrypted);
    expect(decrypted).toEqual(complex);
  });
});
