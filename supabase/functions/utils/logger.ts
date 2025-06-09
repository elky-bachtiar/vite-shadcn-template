import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for logging
const supabaseLogger = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  {
    auth: {
      persistSession: false,
    }
  }
);

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogEntry {
  function_name: string;
  level: LogLevel;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  user_id?: string;
  request_id?: string;
}

/**
 * Log a message to the Supabase function_logs table
 */
export async function logMessage(
  functionName: string,
  level: LogLevel,
  message: string,
  details?: Record<string, any>,
  userId?: string,
  requestId?: string
) {
  try {
    const timestamp = new Date().toISOString();
    
    // Log to console for development
    const consoleMethod = level.toLowerCase() === 'debug' ? 'log' : level.toLowerCase();
    if (consoleMethod === 'log') console.log(`[${timestamp}] [${level.toUpperCase()}] [${functionName}]: ${message}`);
    else if (consoleMethod === 'info') console.info(`[${timestamp}] [${level.toUpperCase()}] [${functionName}]: ${message}`);
    else if (consoleMethod === 'warn') console.warn(`[${timestamp}] [${level.toUpperCase()}] [${functionName}]: ${message}`);
    else if (consoleMethod === 'error') console.error(`[${timestamp}] [${level.toUpperCase()}] [${functionName}]: ${message}`);
    else console.log(`[${timestamp}] [${level.toUpperCase()}] [${functionName}]: ${message}`);
    
    if (details) {
      console.log('Details:', JSON.stringify(details));
    }
    
    // Store log in Supabase function_logs table
    const { error } = await supabaseLogger
      .from('function_logs')
      .insert({
        function_name: functionName,
        level,
        message,
        details,
        timestamp,
        user_id: userId,
        request_id: requestId
      });
    
    if (error) {
      console.error('Failed to write log to Supabase:', error);
    }
  } catch (err) {
    console.error('Error writing log:', err);
  }
}

/**
 * Logger utility for Supabase edge functions
 */
export class Logger {
  private functionName: string;
  private userId?: string;
  private requestId?: string;
  
  constructor(functionName: string, userId?: string, requestId?: string) {
    this.functionName = functionName;
    this.userId = userId;
    this.requestId = requestId || crypto.randomUUID();
  }
  
  setUserId(userId: string) {
    this.userId = userId;
    return this;
  }
  
  setRequestId(requestId: string) {
    this.requestId = requestId;
    return this;
  }
  
  debug(message: string, details?: Record<string, any>) {
    return logMessage(this.functionName, LogLevel.DEBUG, message, details, this.userId, this.requestId);
  }
  
  info(message: string, details?: Record<string, any>) {
    return logMessage(this.functionName, LogLevel.INFO, message, details, this.userId, this.requestId);
  }
  
  warn(message: string, details?: Record<string, any>) {
    return logMessage(this.functionName, LogLevel.WARN, message, details, this.userId, this.requestId);
  }
  
  error(message: string, details?: Record<string, any>) {
    return logMessage(this.functionName, LogLevel.ERROR, message, details, this.userId, this.requestId);
  }
  
  /**
   * Log an API request
   */
  logRequest(path: string, method: string, params?: Record<string, any>) {
    return this.info(`${method} ${path}`, { params });
  }
  
  /**
   * Log an API response
   */
  logResponse(path: string, status: number, body?: any) {
    return this.info(`Response ${status} for ${path}`, { body });
  }
  
  /**
   * Log an error with stack trace
   */
  logError(error: Error, context?: Record<string, any>) {
    return this.error(error.message, {
      ...context,
      stack: error.stack
    });
  }
}
