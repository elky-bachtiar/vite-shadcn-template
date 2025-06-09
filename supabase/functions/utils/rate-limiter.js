// Rate limiter utility for Edge Functions

/**
 * Creates a simple rate limiter
 * @param {number} maxRequests - Maximum number of requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} Rate limiter function
 */
export function createRateLimiter(maxRequests = 10, windowMs = 60000) {
  const clients = new Map();
  
  return function rateLimit(clientId) {
    const now = Date.now();
    
    // Clean up old entries
    clients.forEach((value, key) => {
      if (now - value.timestamp > windowMs) {
        clients.delete(key);
      }
    });
    
    // Get or create client entry
    const clientData = clients.get(clientId) || {
      count: 0,
      timestamp: now
    };
    
    // Update client data
    clientData.count++;
    clientData.timestamp = now;
    clients.set(clientId, clientData);
    
    // Check if rate limit exceeded
    return {
      limited: clientData.count > maxRequests,
      remaining: Math.max(0, maxRequests - clientData.count),
      reset: clientData.timestamp + windowMs
    };
  };
}
