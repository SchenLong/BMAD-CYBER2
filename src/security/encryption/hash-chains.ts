// SHA-256 Hash Chain Implementation
import crypto from "crypto";
import { CRYPTO_CONFIG, CryptoError } from "./crypto-utils";

export interface HashChainLink {
  index: number;
  hash: string;
  previousHash: string;
  data: string;
  timestamp: number;
  nonce?: number;
}

export interface HashChainOptions {
  difficulty?: number;
  includeProofOfWork?: boolean;
}

export class HashChain {
  private chain: HashChainLink[] = [];
  private difficulty: number;

  constructor(options: HashChainOptions = {}) {
    this.difficulty = options.difficulty || 0;
    
    // Create genesis block
    const genesis: HashChainLink = {
      index: 0,
      hash: "",
      previousHash: "0".repeat(64),
      data: "Genesis Block",
      timestamp: Date.now()
    };
    
    genesis.hash = this.calculateHash(genesis);
    this.chain.push(genesis);
  }

  private calculateHash(link: HashChainLink): string {
    const data = `${link.index}${link.previousHash}${link.data}${link.timestamp}${link.nonce || 0}`;
    return crypto.createHash(CRYPTO_CONFIG.hashAlgorithm).update(data).digest("hex");
  }

  private mineBlock(link: HashChainLink): void {
    const target = "0".repeat(this.difficulty);
    link.nonce = 0;

    while (link.hash.substring(0, this.difficulty) !== target) {
      link.nonce++;
      link.hash = this.calculateHash(link);
    }
  }

  addLink(data: string): HashChainLink {
    const previousLink = this.getLatestLink();
    const newLink: HashChainLink = {
      index: previousLink.index + 1,
      hash: "",
      previousHash: previousLink.hash,
      data,
      timestamp: Date.now()
    };

    if (this.difficulty > 0) {
      this.mineBlock(newLink);
    } else {
      newLink.hash = this.calculateHash(newLink);
    }

    this.chain.push(newLink);
    return newLink;
  }

  getLatestLink(): HashChainLink {
    return this.chain[this.chain.length - 1];
  }

  validateChain(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentLink = this.chain[i];
      const previousLink = this.chain[i - 1];

      // Validate current link hash
      if (currentLink.hash !== this.calculateHash(currentLink)) {
        return false;
      }

      // Validate link chain
      if (currentLink.previousHash !== previousLink.hash) {
        return false;
      }

      // Validate proof of work if difficulty is set
      if (this.difficulty > 0 && !currentLink.hash.startsWith("0".repeat(this.difficulty))) {
        return false;
      }
    }

    return true;
  }

  getChain(): HashChainLink[] {
    return [...this.chain];
  }

  findLinkByHash(hash: string): HashChainLink | undefined {
    return this.chain.find(link => link.hash === hash);
  }

  static hashData(data: string): string {
    return crypto.createHash(CRYPTO_CONFIG.hashAlgorithm).update(data).digest("hex");
  }

  static verifyHash(data: string, expectedHash: string): boolean {
    const actualHash = this.hashData(data);
    return actualHash === expectedHash;
  }

  static createMerkleTree(data: string[]): string {
    if (data.length === 0) return "";
    if (data.length === 1) return this.hashData(data[0]);

    const hashes = data.map(item => this.hashData(item));
    
    while (hashes.length > 1) {
      const newLevel: string[] = [];
      
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = hashes[i + 1] || left; // Duplicate if odd number
        newLevel.push(this.hashData(left + right));
      }
      
      hashes.splice(0, hashes.length, ...newLevel);
    }

    return hashes[0];
  }
}
