/**
 * Data Encryption Utilities
 * Fixes: V-007 (Plaintext credential storage - CVSS 8.1)
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Encrypt sensitive data using AES-256-GCM
 */
export function encrypt(plaintext: string, password: string): string {
  try {
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);

    // Derive key from password using PBKDF2
    const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get authentication tag
    const tag = cipher.getAuthTag();

    // Combine salt + iv + tag + encrypted data
    const combined = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'hex')
    ]);

    return combined.toString('base64');
  } catch (error) {
    throw new Error('Encryption failed');
  }
}

/**
 * Decrypt data encrypted with encrypt()
 */
export function decrypt(ciphertext: string, password: string): string {
  try {
    // Decode from base64
    const combined = Buffer.from(ciphertext, 'base64');

    // Extract components
    const salt = combined.slice(0, SALT_LENGTH);
    const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = combined.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    // Derive key from password
    const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    // Decrypt
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed');
  }
}

/**
 * Hash password using bcrypt-compatible PBKDF2
 * Use bcrypt library in production for better security
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');

  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  try {
    const [saltHex, hashHex] = hashedPassword.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');

    return hash.toString('hex') === hashHex;
  } catch {
    return false;
  }
}

/**
 * Generate cryptographically secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Environment variable encryption manager
 * Fixes V-007 by encrypting API tokens
 */
export class SecureConfigManager {
  private masterKey: string;
  private cache: Map<string, string> = new Map();

  constructor(masterPassword?: string) {
    // In production, load master key from secure key management service (AWS KMS, Azure Key Vault)
    this.masterKey = masterPassword || process.env.MASTER_KEY || this.generateMasterKey();
  }

  /**
   * Generate or load master encryption key
   */
  private generateMasterKey(): string {
    // In production, use a proper key management system
    const key = crypto.randomBytes(32).toString('hex');
    console.warn('WARNING: Using generated master key. Set MASTER_KEY environment variable for production.');
    return key;
  }

  /**
   * Store encrypted credential
   */
  setSecret(key: string, value: string): void {
    const encrypted = encrypt(value, this.masterKey);
    this.cache.set(key, encrypted);

    // In production, store in secure key vault, not in memory
    process.env[`ENCRYPTED_${key}`] = encrypted;
  }

  /**
   * Retrieve and decrypt credential
   */
  getSecret(key: string): string | undefined {
    // Check cache first
    let encrypted = this.cache.get(key);

    // Fall back to environment variable
    if (!encrypted) {
      encrypted = process.env[`ENCRYPTED_${key}`];
    }

    if (!encrypted) {
      return undefined;
    }

    try {
      return decrypt(encrypted, this.masterKey);
    } catch {
      return undefined;
    }
  }

  /**
   * Delete credential
   */
  deleteSecret(key: string): void {
    this.cache.delete(key);
    delete process.env[`ENCRYPTED_${key}`];
  }

  /**
   * List all stored secret keys (not values)
   */
  listSecrets(): string[] {
    return Array.from(this.cache.keys());
  }
}

// Singleton instance
export const secureConfig = new SecureConfigManager();

/**
 * Example usage for storing API tokens securely
 */
export function storeAPIToken(service: string, token: string): void {
  secureConfig.setSecret(`API_TOKEN_${service.toUpperCase()}`, token);
}

export function getAPIToken(service: string): string | undefined {
  return secureConfig.getSecret(`API_TOKEN_${service.toUpperCase()}`);
}
