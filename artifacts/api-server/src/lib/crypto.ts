import crypto from "node:crypto";

function getEncryptionKey(): string | undefined {
  return process.env["OAUTH_ENCRYPTION_KEY"];
}

export function encrypt(text: string): string {
  const ENCRYPTION_KEY = getEncryptionKey();
  if (!ENCRYPTION_KEY) return text;
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf-8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(encryptedText: string): string {
  const ENCRYPTION_KEY = getEncryptionKey();
  if (!ENCRYPTION_KEY) return encryptedText;
  const [ivHex, authTagHex, encryptedHex] = encryptedText.split(":");
  if (!ivHex || !authTagHex || !encryptedHex) throw new Error("Invalid encrypted text format");
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedHex, "hex")), decipher.final()]).toString("utf-8");
}
