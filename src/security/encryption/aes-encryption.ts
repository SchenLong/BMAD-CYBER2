// AES-256-GCM Encryption System
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

  static encrypt(plaintext: string, key: Buffer): EncryptedData {
    this.validateKey(key);
    
    const iv = generateSecureRandom(CRYPTO_CONFIG.ivLength);
    const cipher = crypto.createCipher(CRYPTO_CONFIG.algorithm, key, { iv });
    
    let encrypted = cipher.update(plaintext, "utf8", "base64");
    encrypted += cipher.final("base64");
    
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
    const tag = Buffer.from(data.tag, "base64");
    const encrypted = data.encrypted;
    
    const decipher = crypto.createDecipher(CRYPTO_CONFIG.algorithm, key, { iv });
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
