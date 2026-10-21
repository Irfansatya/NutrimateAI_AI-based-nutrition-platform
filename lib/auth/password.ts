import crypto from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(crypto.scrypt);

/**
 * Secure password hashing using Node.js crypto.scrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Secure constant-time password verification
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    const [salt, keyHex] = storedHash.split(":");
    if (!salt || !keyHex || keyHex.length !== 128) return false;

    const keyBuffer = Buffer.from(keyHex, "hex");
    if (keyBuffer.length !== 64) return false;

    const derivedKey = (await scryptAsync(password, salt, keyBuffer.length)) as Buffer;

    return (
      keyBuffer.length === derivedKey.length &&
      crypto.timingSafeEqual(keyBuffer, derivedKey)
    );
  } catch {
    return false;
  }
}
