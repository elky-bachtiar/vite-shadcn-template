// Common API types for Supabase Edge Functions
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

// Generic API response type
export type ApiResponse = {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
};

// Product-related types
export type ProductRequest = {
  action: string;
  productId?: string;
  campaignId?: string;
  name?: string;
  description?: string;
  images?: string[];
  metadata?: Record<string, string>;
  prices?: PriceData[];
  active?: boolean;
};

export type PriceData = {
  id?: string;
  unitAmount: number; // in cents
  currency: string;
  recurring?: {
    interval: "day" | "week" | "month" | "year";
    intervalCount?: number;
  };
  metadata?: Record<string, string>;
};

export type ProductData = {
  id?: string;
  stripe_product_id?: string;
  name: string;
  description?: string;
  campaign_id?: string;
  active?: boolean;
  metadata?: Record<string, any>;
  prices?: PriceData[];
};

// User roles
export enum USER_ROLES {
  ADMIN = "admin",
  CAMPAIGN_OWNER = "campaign_owner",
  USER = "user"
}

// Campaign-related types
export type CampaignData = {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  ownerId?: string;
  goal?: number;
  raised?: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
};
