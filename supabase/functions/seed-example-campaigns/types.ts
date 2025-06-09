export type CampaignStatus = 
  | 'active'
  | 'completed'
  | 'paused'
  | 'cancelled'
  | 'draft'
  | 'deleted'
  | 'example';

export enum USER_ROLES {
  ADMIN = 'admin',
  USER = 'user',
  CUSTOMER = 'customer',
  DONOR = 'donor',
  CAMPAIGN_OWNER = 'campaign_owner',
  CAMPAIGN_MANAGER = 'campaign_manager',
  PLATFORM_ADMIN = 'platform_admin',
  STORE_OWNER = 'store_owner',
  STORE_MANAGER = 'store_manager'
}

export type User = {
  id: string;
  email: string;
  role?: USER_ROLES;
  created_at: string;
  updated_at: string;
};

export type UserProfile = {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  country?: string;
  city?: string;
  postal_code?: string;
  address?: string;
  bio?: string;
  website_url?: string;
  social_links?: Record<string, string>;
  preferences?: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
  verification_status?: string;
  verification_documents?: any[];
  last_login_at?: string;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export type Campaign = {
  id: string;
  slug: string;
  title: string;
  description: string;
  featured_image_url: string;
  video_url?: string;
  currency: string;
  goal_amount: number;
  amount_raised: number;
  location: string;
  country?: string;
  category: Category;
  current_amount: number;
  donor_count: number;
  owner_id: string; // Reference to User ID
  status: CampaignStatus;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  is_urgent: boolean;
  is_featured: boolean;
  verification_status: string;
  verification_notes?: string;
  view_count: number;
  share_count: number;
  tags: string[];
  metadata: Record<string, any>;
  beneficiary_info?: Record<string, any>;
  bank_details?: Record<string, any>;
  social_links?: Record<string, string>;
  updates?: any[];
  faq?: any[];
  team_members?: any[];
  expenses?: any[];
  milestones?: any[];
  risk_factors?: string;
  impact_statement?: string;
  target_audience?: string;
  marketing_plan?: string;
  success_metrics?: Record<string, any>;
  external_links?: any[];
  press_coverage?: any[];
  endorsements?: any[];
  tag?: string; // For idempotency checking
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
};

export type Category = 
  | 'medical'
  | 'memorial'
  | 'emergency'
  | 'nonprofit'
  | 'education'
  | 'animal'
  | 'environment'
  | 'business'
  | 'community'
  | 'competition'
  | 'creative'
  | 'event'
  | 'faith'
  | 'family'
  | 'sports'
  | 'travel'
  | 'volunteer'
  | 'wishes';

export const CATEGORIES: Category[] = [
  'medical',
  'memorial',
  'emergency',
  'nonprofit',
  'education',
  'animal',
  'environment',
  'business',
  'community',
  'competition',
  'creative',
  'event',
  'faith',
  'family',
  'sports',
  'travel',
  'volunteer',
  'wishes'
];

export const CAMPAIGNS_PER_CATEGORY = 3;

export const SEED_TAG = 'example_campaign_seed_20230501';
