// AES-256-GCM Encryption System
// SECURITY FIX (BLOCK-002): Replaced deprecated createCipher/createDecipher with createCipheriv/createDecipheriv
// Using proper IV generation with crypto.randomBytes(16) for AES-256-GCM
import crypto from "crypto";
import { CRYPTO_CONFIG, CryptoError, generateSecureRandom } from "./crypto-utils";

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
  salt?: string;
}

export class AESEncryption {
  private static validateKey(key: Buffer): void {
    if (key.length !== CRYPTO_CONFIG.keyLength) {
      throw new CryptoError(`Invalid key length: expected ${CRYPTO_CONFIG.keyLength}, got ${key.length}`, "INVALID_KEY_LENGTH");
    }
  }

  private static validateIV(iv: Buffer): void {
    if (iv.length !== CRYPTO_CONFIG.ivLength) {
      throw new CryptoError(`Invalid IV length: expected ${CRYPTO_CONFIG.ivLength}, got ${iv.length}`, "INVALID_IV_LENGTH");
    }
  }

  static encrypt(plaintext: string, key: Buffer): EncryptedData {
    this.validateKey(key);
    
    // Generate a cryptographically secure random IV (16 bytes for AES)
    const iv = generateSecureRandom(CRYPTO_CONFIG.ivLength);
    
    // SECURITY FIX: Use createCipheriv instead of deprecated createCipher
    // createCipher derives IV from password which is insecure and deprecated
    const cipher = crypto.createCipheriv(CRYPTO_CONFIG.algorithm, key, iv);
    
    let encrypted = cipher.update(plaintext, "utf8", "base64");
    encrypted += cipher.final("base64");
    
    // Get the authentication tag (required for GCM mode)
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString("base64"),
      tag: tag.toString("base64")
    };
  }

  static decrypt(data: EncryptedData, key: Buffer): string {
    this.validateKey(key);
    
    const iv = Buffer.from(data.iv, "base64");
    this.validateIV(iv);
    
    const tag = Buffer.from(data.tag, "base64");
    const encrypted = data.encrypted;
    
    // SECURITY FIX: Use createDecipheriv instead of deprecated createDecipher
    const decipher = crypto.createDecipheriv(CRYPTO_CONFIG.algorithm, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  }

  static encryptWithPassword(plaintext: string, password: string): EncryptedData & { salt: string } {
    const salt = generateSecureRandom(CRYPTO_CONFIG.saltLength);
    const key = crypto.pbkdf2Sync(password, salt, CRYPTO_CONFIG.iterations, CRYPTO_CONFIG.keyLength, CRYPTO_CONFIG.hashAlgorithm);
    
    const result = this.encrypt(plaintext, key);
    return {
      ...result,
      salt: salt.toString("base64")
    };
  }

  static decryptWithPassword(data: EncryptedData & { salt: string }, password: string): string {
    const salt = Buffer.from(data.salt, "base64");
    const key = crypto.pbkdf2Sync(password, salt, CRYPTO_CONFIG.iterations, CRYPTO_CONFIG.keyLength, CRYPTO_CONFIG.hashAlgorithm);
    
    return this.decrypt(data, key);
  }
}