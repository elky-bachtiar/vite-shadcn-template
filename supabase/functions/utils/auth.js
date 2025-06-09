// Auth utilities for Edge Functions
import { createClient } from '@supabase/supabase-js';
import { USER_ROLES } from "../types/api.js";

/**
 * @typedef {Object} AuthUser
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string[]} roles - User roles
 */

/**
 * Authentication utility class
 */
export class Auth {
  /**
   * Get the authenticated user from a request
   * @param {Request} req - The request object
   * @returns {Promise<AuthUser|null>} Authenticated user or null
   */
  static async getUserFromRequest(req) {
    try {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) return null;
      
      const token = authHeader.replace('Bearer ', '');
      if (!token) return null;
      
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
      );
      
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      
      if (error || !user) return null;
      
      return {
        id: user.id,
        email: user.email,
        roles: user.app_metadata?.roles || []
      };
    } catch (error) {
      console.error('Error getting authenticated user:', error);
      return null;
    }
  }
  
  /**
   * Check if a user has a specific role
   * @param {AuthUser} user - User object
   * @param {string} role - Role to check
   * @returns {boolean} True if user has the role
   */
  static hasRole(user, role) {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  }
  
  /**
   * Check if a user is an admin
   * @param {AuthUser} user - User object
   * @returns {boolean} True if user is an admin
   */
  static isAdmin(user) {
    return this.hasRole(user, USER_ROLES.ADMIN);
  }
  
  /**
   * Check if a user is a campaign owner
   * @param {AuthUser} user - User object
   * @returns {boolean} True if user is a campaign owner
   */
  static isCampaignOwner(user) {
    return this.hasRole(user, USER_ROLES.CAMPAIGN_OWNER);
  }
}
