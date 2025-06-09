import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from '@supabase/supabase-js';
import { LogLevel } from './logger.js';

export interface RateLimitConfig {
  /**
   * Name of the rate limited function or endpoint
   */
  name: string;
  
  /**
   * The identifier for the client (IP, userId, etc.)
   */
  identifier: string;
  
  /**
   * Maximum number of requests allowed in the window
   */
  maxRequests: number;
  
  /**
   * Time window in seconds
   */
  windowSeconds: number;
}

/**
 * Simple rate limiter that uses Supabase to store request counters
 */
export class RateLimiter {
  private supabase: any;
  private tableName: string;
  private logger: any | undefined;
  private config: RateLimitConfig | undefined;
  
  constructor(supabase: any, tableName: string = 'api_rate_limits', logger?: any) {
    this.supabase = supabase;
    this.tableName = tableName;
    this.logger = logger;
  }
  
  /**
   * Set the rate limit configuration
   */
  setConfig(config: RateLimitConfig): RateLimiter {
    this.config = config;
    return this;
  }
  
  /**
   * Check if the client has exceeded their rate limit
   */
  async isRateLimited(): Promise<boolean> {
    if (!this.config) {
      throw new Error('Rate limit config not set. Call setConfig() first.');
    }

    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - this.config.windowSeconds;
    
    // Get or create a rate limit record
    const { data: records, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('name', this.config.name)
      .eq('identifier', this.config.identifier)
      .gte('timestamp', new Date(windowStart * 1000).toISOString());

    if (error) {
      if (this.logger) {
        this.logger.error('Error checking rate limit:', { error });
      } else {
        console.error('Error checking rate limit:', error);
      }
      // If there's an error checking the rate limit, let the request through
      return false;
    }
    
    // Check if the client has exceeded their rate limit
    const requestCount = records?.length || 0;
    return requestCount >= this.config.maxRequests;
  }
  
  /**
   * Record a request for rate limiting
   */
  async recordRequest(): Promise<void> {
    if (!this.config) {
      throw new Error('Rate limit config not set. Call setConfig() first.');
    }

    const { error } = await this.supabase
      .from(this.tableName)
      .insert({
        name: this.config.name,
        identifier: this.config.identifier,
        timestamp: new Date().toISOString(),
      });
    
    if (error) {
      if (this.logger) {
        this.logger.error('Error recording rate limit request:', { error });
      } else {
        console.error('Error recording rate limit request:', error);
      }
    }
  }
  
  /**
   * Check if the request would exceed rate limits
   * @returns Object with allowed status and remaining requests
   */
  async checkLimit(): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
    if (!this.config) {
      throw new Error('Rate limit config not set. Call setConfig() first.');
    }

    try {
      const now = new Date();
      const key = `${this.config.name}:${this.config.identifier}`;
      const windowStart = new Date(now.getTime() - (this.config.windowSeconds * 1000));
      const resetAt = new Date(now.getTime() + (this.config.windowSeconds * 1000));
      
      // Get current count from rate_limits table
      const { data: rateLimits, error } = await this.supabase
        .from('rate_limits')
        .select('count, reset_at')
        .eq('key', key)
        .gte('reset_at', windowStart.toISOString())
        .order('reset_at', { ascending: false })
        .limit(1);
      
      if (error) {
        if (this.logger) {
          this.logger.error('Error checking rate limit:', { error });
        } else {
          console.error('Error checking rate limit:', error);
        }
        // Fail open in case of database errors
        return { allowed: true, remaining: this.config.maxRequests, resetAt };
      }
      
      // If no record found or it's expired, create a new one
      if (!rateLimits || rateLimits.length === 0) {
        const { error: insertError } = await this.supabase
          .from('rate_limits')
          .insert({
            key,
            count: 1,
            reset_at: resetAt.toISOString()
          });
        
        if (insertError) {
          if (this.logger) {
            this.logger.error('Error creating rate limit record:', { error: insertError });
          } else {
            console.error('Error creating rate limit record:', insertError);
          }
        }
        
        return { 
          allowed: true, 
          remaining: this.config.maxRequests - 1,
          resetAt
        };
      }
      
      // Get the current count
      const currentCount = rateLimits[0].count;
      const currentResetAt = new Date(rateLimits[0].reset_at);
      
      // Check if we're over the limit
      if (currentCount >= this.config.maxRequests) {
        return { 
          allowed: false, 
          remaining: 0,
          resetAt: currentResetAt
        };
      }
      
      // Increment the count
      const { error: updateError } = await this.supabase
        .from('rate_limits')
        .update({ count: currentCount + 1 })
        .eq('key', key);
      
      if (updateError) {
        if (this.logger) {
          this.logger.error('Error updating rate limit count:', { error: updateError });
        } else {
          console.error('Error updating rate limit count:', updateError);
        }
      }
      
      return { 
        allowed: true, 
        remaining: this.config.maxRequests - (currentCount + 1),
        resetAt: currentResetAt
      };
    } catch (err) {
      if (this.logger) {
        this.logger.error('Rate limiter error:', { error: err });
      } else {
        console.error('Rate limiter error:', err);
      }
      // Fail open in case of errors
      return { 
        allowed: true, 
        remaining: this.config.maxRequests,
        resetAt: new Date(Date.now() + (this.config.windowSeconds * 1000))
      };
    }
  }
  
  /**
   * Apply rate limiting to a request
   * @returns A Response object if rate limited, undefined if allowed
   */
  async limitRequest(): Promise<Response | undefined> {
    if (!this.config) {
      throw new Error('Rate limit config not set. Call setConfig() first.');
    }

    const { allowed, remaining, resetAt } = await this.checkLimit();
    
    if (!allowed) {
      const retryAfter = Math.ceil((resetAt.getTime() - Date.now()) / 1000);
      
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Rate limit exceeded',
          retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': this.config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.floor(resetAt.getTime() / 1000).toString()
          }
        }
      );
    }
    
    return undefined;
  }
}

/**
 * Create a rate limiter instance for a function
 */
export function createRateLimiter(
  functionName: string, 
  identifier: string, 
  maxRequests = 60, 
  windowSeconds = 60
): RateLimiter {
  return new RateLimiter({
    name: functionName,
    identifier,
    maxRequests,
    windowSeconds
  });
}
