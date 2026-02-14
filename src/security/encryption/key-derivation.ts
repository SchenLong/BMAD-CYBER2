// PBKDF2 Key Derivation Functions
import * as crypto from "crypto";
import { CRYPTO_CONFIG, CryptoError, generateSecureRandom } from "./crypto-utils";

export interface DerivedKey {
  key: Buffer;
  salt: Buffer;
  iterations: number;
}

export interface KeyDerivationOptions {
  iterations?: number;
  keyLength?: number;
  hashAlgorithm?: string;
}

export class KeyDerivation {
  static deriveKey(
    password: string,
    salt?: Buffer,
    options: KeyDerivationOptions = {}
  ): DerivedKey {
    const finalSalt = salt || generateSecureRandom(CRYPTO_CONFIG.saltLength);
    const iterations = options.iterations || CRYPTO_CONFIG.iterations;
    const keyLength = options.keyLength || CRYPTO_CONFIG.keyLength;
    const hashAlgorithm = options.hashAlgorithm || CRYPTO_CONFIG.hashAlgorithm;

    if (password.length < 8) {
      throw new CryptoError("Password too short: minimum 8 characters required", "WEAK_PASSWORD");
    }

    const key = crypto.pbkdf2Sync(password, finalSalt, iterations, keyLength, hashAlgorithm);

    return {
      key,
      salt: finalSalt,
      iterations
    };
  }

  static async deriveKeyAsync(
    password: string,
    salt?: Buffer,
    options: KeyDerivationOptions = {}
  ): Promise<DerivedKey> {
    return new Promise((resolve, reject) => {
      const finalSalt = salt || generateSecureRandom(CRYPTO_CONFIG.saltLength);
      const iterations = options.iterations || CRYPTO_CONFIG.iterations;
      const keyLength = options.keyLength || CRYPTO_CONFIG.keyLength;
      const hashAlgorithm = options.hashAlgorithm || CRYPTO_CONFIG.hashAlgorithm;

      if (password.length < 8) {
        reject(new CryptoError("Password too short: minimum 8 characters required", "WEAK_PASSWORD"));
        return;
      }

      crypto.pbkdf2(password, finalSalt, iterations, keyLength, hashAlgorithm, (err, key) => {
        if (err) {
          reject(new CryptoError(`Key derivation failed: ${err.message}`, "DERIVATION_FAILED"));
        } else {
          resolve({
            key,
            salt: finalSalt,
            iterations
          });
        }
      });
    });
  }

  static validatePassword(password: string): boolean {
    return password.length >= 8 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
  }

  static generateMasterKey(): Buffer {
    return generateSecureRandom(CRYPTO_CONFIG.keyLength);
  }

  static deriveKeyHierarchy(masterKey: Buffer, context: string, index: number): Buffer {
    const contextBuffer = Buffer.from(context, "utf8");
    const indexBuffer = Buffer.allocUnsafe(4);
    indexBuffer.writeUInt32BE(index, 0);
    
    const input = Buffer.concat([masterKey, contextBuffer, indexBuffer]);
    return crypto.createHash(CRYPTO_CONFIG.hashAlgorithm).update(input).digest().slice(0, CRYPTO_CONFIG.keyLength);
  }
}
