/**
 * CSRF (Cross-Site Request Forgery) Protection Module for Supabase Edge Functions
 * 
 * This module provides utilities to generate and validate CSRF tokens to protect
 * against CSRF attacks. It uses an in-memory store for tokens with expiration.
 */

// In-memory token store (for Edge Functions)
// In a production environment with multiple instances, consider using a distributed cache
const csrfTokens = new Map<string, { token: string, expires: number }>();

/**
 * Generates a CSRF token for a user
 * 
 * @param userId User ID to associate with the token
 * @returns Generated CSRF token
 */
export function generateCsrfToken(userId: string): string {
  // Use crypto for secure random token generation
  const token = crypto.randomUUID();
  
  // Token valid for 1 hour
  csrfTokens.set(userId, { 
    token, 
    expires: Date.now() + 3600000 
  });
  
  return token;
}

/**
 * Validates a CSRF token for a user
 * 
 * @param userId User ID associated with the token
 * @param token Token to validate
 * @returns Boolean indicating if token is valid
 */
export function validateCsrfToken(userId: string, token: string): boolean {
  const storedToken = csrfTokens.get(userId);
  
  if (!storedToken) {
    return false;
  }
  
  // Check if token is expired
  if (Date.now() > storedToken.expires) {
    csrfTokens.delete(userId);
    return false;
  }
  
  // Compare tokens using constant-time comparison
  return timingSafeEqual(storedToken.token, token);
}

/**
 * Constant-time comparison function to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * CSRF protection middleware for Edge Functions
 * Validates CSRF tokens for mutating operations
 * 
 * @param req Request object
 * @param supabase Initialized Supabase client
 * @returns Result of CSRF validation
 */
export async function csrfProtection(req: Request, supabase: any) {
  // Only protect mutating operations
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    return { valid: true };
  }
  
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return { valid: false, error: 'Unauthorized', status: 401 };
  }
  
  const csrfToken = req.headers.get('X-CSRF-Token');
  if (!csrfToken) {
    return { valid: false, error: 'Missing CSRF token', status: 403 };
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: getUserError } = await supabase.auth.getUser(token);
    
    if (getUserError || !user) {
      return { valid: false, error: 'Invalid authentication token', status: 401 };
    }
    
    const isValidToken = validateCsrfToken(user.id, csrfToken);
    return { 
      valid: isValidToken, 
      error: isValidToken ? null : 'Invalid or expired CSRF token', 
      status: isValidToken ? 200 : 403
    };
  } catch (error) {
    console.error('CSRF validation error:', error);
    return { valid: false, error: 'CSRF validation failed', status: 500 };
  }
}
