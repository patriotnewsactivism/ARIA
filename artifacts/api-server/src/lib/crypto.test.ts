import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { encrypt, decrypt } from "./crypto.ts";

describe("crypto helpers", () => {
  const originalKey = process.env.OAUTH_ENCRYPTION_KEY;

  it("round-trips text when OAUTH_ENCRYPTION_KEY is set", () => {
    process.env.OAUTH_ENCRYPTION_KEY = "super-secret-key-32-characters!!";
    const plaintext = "hello-world-token";
    const encrypted = encrypt(plaintext);
    assert.notStrictEqual(encrypted, plaintext);
    assert.strictEqual(decrypt(encrypted), plaintext);
    process.env.OAUTH_ENCRYPTION_KEY = originalKey;
  });

  it("returns plaintext when OAUTH_ENCRYPTION_KEY is missing", () => {
    delete process.env.OAUTH_ENCRYPTION_KEY;
    const plaintext = "plain-token";
    assert.strictEqual(encrypt(plaintext), plaintext);
    assert.strictEqual(decrypt(plaintext), plaintext);
    process.env.OAUTH_ENCRYPTION_KEY = originalKey;
  });
});
