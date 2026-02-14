// BMAD Crypto Utilities - Core encryption configuration and utilities
import * as crypto from "crypto";

export const CRYPTO_CONFIG = {
  algorithm: "aes-256-gcm",
  keyLength: 32,
  ivLength: 16,
  tagLength: 16,
  saltLength: 32,
  iterations: 100000,
  hashAlgorithm: "sha256"
};

export class CryptoError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "CryptoError";
  }
}

export function generateSecureRandom(length: number): Buffer {
  return crypto.randomBytes(length);
}

export function secureCompare(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
