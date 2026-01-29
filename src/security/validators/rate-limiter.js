// BMAD Security Validator - Rate Limiter
// Protects against brute force and DoS attacks

class RateLimiterValidator {
  constructor() {
    this.requestCounts = new Map();
    this.blockedIPs = new Set();
    
    // Default rate limit configurations
    this.limits = {
      auth: { requests: 5, window: 900000 }, // 5 requests per 15 min
      api: { requests: 100, window: 60000 },  // 100 requests per minute
      upload: { requests: 10, window: 300000 }, // 10 uploads per 5 min
      search: { requests: 50, window: 60000 } // 50 searches per minute
    };
  }

  validate(ip, endpoint, userId = null) {
    if (this.blockedIPs.has(ip)) {
      return {
        isValid: false,
        error: "IP address is blocked",
        severity: "HIGH",
        remainingTime: this.getBlockTimeRemaining(ip)
      };
    }

    const limit = this.getLimitForEndpoint(endpoint);
    const key = userId ? `${ip}:${userId}` : ip;
    const now = Date.now();

    if (!this.requestCounts.has(key)) {
      this.requestCounts.set(key, []);
    }

    const requests = this.requestCounts.get(key);
    
    // Clean old requests outside window
    const validRequests = requests.filter(
      time => now - time < limit.window
    );
    
    this.requestCounts.set(key, validRequests);

    // Check if limit exceeded
    if (validRequests.length >= limit.requests) {
      // Block IP if too many auth failures
      if (endpoint.includes("auth") && validRequests.length > 10) {
        this.blockedIPs.add(ip);
        setTimeout(() => this.blockedIPs.delete(ip), 3600000); // 1 hour block
      }

      return {
        isValid: false,
        error: `Rate limit exceeded for ${endpoint}`,
        severity: "MEDIUM",
        retryAfter: Math.ceil((limit.window - (now - validRequests[0])) / 1000)
      };
    }

    // Add current request
    validRequests.push(now);
    this.requestCounts.set(key, validRequests);

    return {
      isValid: true,
      remaining: limit.requests - validRequests.length,
      resetTime: new Date(now + limit.window)
    };
  }

  getLimitForEndpoint(endpoint) {
    if (endpoint.includes("auth") || endpoint.includes("login")) {
      return this.limits.auth;
    }
    if (endpoint.includes("upload")) {
      return this.limits.upload;
    }
    if (endpoint.includes("search")) {
      return this.limits.search;
    }
    return this.limits.api;
  }

  getBlockTimeRemaining(ip) {
    // Implementation would check block timestamp
    return 3600; // Default 1 hour
  }

  clearCache() {
    this.requestCounts.clear();
  }

  unblockIP(ip) {
    this.blockedIPs.delete(ip);
  }
}

module.exports = new RateLimiterValidator();
