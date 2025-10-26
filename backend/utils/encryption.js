import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const ITERATIONS = 100000;

// Derive key from secret
function deriveKey(secret, salt) {
  return crypto.pbkdf2Sync(secret, salt, ITERATIONS, 32, 'sha512');
}

/**
 * Encrypt sensitive data (like API keys)
 * @param {string} text - The plaintext to encrypt
 * @param {string} secret - The encryption secret from env
 * @returns {string} Encrypted data as base64
 */
export function encrypt(text, secret) {
  if (!text) return null;
  if (!secret) throw new Error('Encryption secret is required');

  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(secret, salt);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  // Combine salt + iv + tag + encrypted data
  const combined = Buffer.concat([salt, iv, tag, encrypted]);

  return combined.toString('base64');
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - The base64 encrypted data
 * @param {string} secret - The encryption secret from env
 * @returns {string} Decrypted plaintext
 */
export function decrypt(encryptedData, secret) {
  if (!encryptedData) return null;
  if (!secret) throw new Error('Encryption secret is required');

  const combined = Buffer.from(encryptedData, 'base64');

  const salt = combined.subarray(0, SALT_LENGTH);
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

  const key = deriveKey(secret, salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}
