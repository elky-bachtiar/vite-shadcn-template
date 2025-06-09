/**
 * CORS utilities for Supabase Edge Functions
 */

// Default CORS headers for all responses
export const DEFAULT_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

/**
 * Create a CORS headers object with custom settings
 */
export function createCorsHeaders(
  allowOrigin = '*',
  allowMethods = 'GET, POST, PUT, DELETE, OPTIONS',
  allowHeaders = 'authorization, x-client-info, apikey, content-type'
): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': allowHeaders,
    'Access-Control-Allow-Methods': allowMethods,
  };
}

/**
 * Handle OPTIONS requests for CORS preflight
 */
export function handleCorsPreflightRequest(
  req: Request, 
  corsHeaders = DEFAULT_CORS_HEADERS
): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  return null;
}

/**
 * Add CORS headers to a Response
 */
export function addCorsHeaders(response: Response, corsHeaders = DEFAULT_CORS_HEADERS): Response {
  const headers = new Headers(response.headers);
  
  for (const [key, value] of Object.entries(corsHeaders)) {
    headers.set(key, value);
  }
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
