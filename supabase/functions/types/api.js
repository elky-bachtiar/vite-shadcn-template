// Type definitions for API responses and requests

// User roles enum
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  CAMPAIGN_OWNER: 'campaign_owner'
};

// API response type
export const API_RESPONSE_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error'
};

/**
 * @typedef {Object} ApiResponse
 * @property {string} status - Response status (success or error)
 * @property {Object|null} data - Response data
 * @property {string|null} error - Error message if status is error
 */

/**
 * @typedef {Object} ProductRequest
 * @property {string} action - Action to perform (create, get, getAll, etc.)
 * @property {string} [productId] - Product ID for operations
 * @property {string} [name] - Product name
 * @property {string} [description] - Product description
 * @property {string} [campaignId] - Associated campaign ID
 * @property {string} [type] - Product type (donation, physical, etc.)
 * @property {Object} [metadata] - Additional metadata
 * @property {Array<string>} [images] - Product images URLs
 * @property {Array<PriceData>} [prices] - Price data for the product
 * @property {boolean} [active] - Whether the product is active
 */

/**
 * @typedef {Object} PriceData
 * @property {string} [id] - Price ID
 * @property {number} unitAmount - Amount in cents
 * @property {string} currency - Currency code (e.g., 'usd')
 * @property {Object} [recurring] - Recurring price configuration
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} ProductData
 * @property {string} [id] - Product ID
 * @property {string} [stripeProductId] - Stripe product ID
 * @property {string} name - Product name
 * @property {string} [description] - Product description
 * @property {string} [campaignId] - Campaign ID
 * @property {boolean} [active] - Whether product is active
 * @property {Object} [metadata] - Additional metadata
 * @property {Array<PriceData>} [prices] - Associated prices
 */
