/**
 * BMAD Token Generation Utility
 *
 * Generates encrypted tokens for BMAD authentication.
 * Run this to create a new authentication token.
 *
 * Usage:
 *   npx ts-node generate-token.ts
 *   # or
 *   node generate-token.js
 */
/// <reference types="node" />
/// <reference types="node" />
export interface TokenClaims {
    sub: string;
    name: string;
    email?: string;
    roles: string[];
    modules: string[];
    iat: string;
    exp: string;
    jti: string;
}
export interface GeneratedToken {
    token: string;
    claims: TokenClaims;
    expiresAt: Date;
}
export declare class TokenGenerator {
    private key;
    constructor(key: Buffer);
    /**
     * Generate encryption key from password or create new random key
     */
    static generateKey(password?: string): Buffer;
    /**
     * Encrypt and encode token
     */
    encrypt(claims: TokenClaims): string;
    /**
     * Decrypt and validate token
     */
    decrypt(token: string): TokenClaims | null;
    /**
     * Generate a new token with the given claims
     */
    generateToken(name: string, email: string | undefined, roles: string[], modules: string[], expiresInHours?: number): GeneratedToken;
}
export { TokenGenerator as default };
//# sourceMappingURL=generate-token.d.ts.map