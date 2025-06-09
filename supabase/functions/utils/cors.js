// CORS utilities for Edge Functions

export const DEFAULT_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info',
  'Access-Control-Max-Age': '86400',
};

/**
 * Handle CORS preflight requests
 * @param {Request} req - The request object
 * @returns {Response|null} Response for preflight requests, null for regular requests
 */
export function handleCorsPreflightRequest(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: DEFAULT_CORS_HEADERS });
  }
  return null;
}

/**
 * Add CORS headers to any response
 * @param {Object} headers - Response headers
 * @returns {Object} Headers with CORS headers added
 */
export function addCorsHeaders(headers = {}) {
  const newHeaders = { ...headers };
  Object.entries(DEFAULT_CORS_HEADERS).forEach(([key, value]) => {
    newHeaders[key] = value;
  });
  return newHeaders;
}
