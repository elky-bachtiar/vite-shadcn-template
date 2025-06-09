import { DivideIcon as LucideIcon, Stethoscope, Flame, Heart, GraduationCap, Dog, Sprout, Building2, Users, Trophy, Palette, Calendar, Users2, FolderRoot as Football, Plane, HandMetal, Star, Cross } from 'lucide-react';

export const USER_ROLES = {
  ADMIN: 'admin' as const,
  USER: 'user' as const,
  DONOR: 'donor' as const,
  CAMPAIGN_OWNER: 'campaign_owner' as const,
  CAMPAIGN_MANAGER: 'campaign_manager' as const,
  PLATFORM_ADMIN: 'platform_admin' as const,
  STORE_OWNER: 'store_owner' as const,
  STORE_MANAGER: 'store_manager' as const
}

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
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


export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: typeof LucideIcon;
};

export const categories: Category[] = [
  { id: '1', name: 'Medical', slug: 'medical', icon: Stethoscope },
  { id: '2', name: 'Memorial', slug: 'memorial', icon: Flame },
  { id: '3', name: 'Emergency', slug: 'emergency', icon: Flame },
  { id: '4', name: 'Nonprofit', slug: 'nonprofit', icon: Heart },
  { id: '5', name: 'Education', slug: 'education', icon: GraduationCap },
  { id: '6', name: 'Animal', slug: 'animal', icon: Dog },
  { id: '7', name: 'Environment', slug: 'environment', icon: Sprout },
  { id: '8', name: 'Business', slug: 'business', icon: Building2 },
  { id: '9', name: 'Community', slug: 'community', icon: Users },
  { id: '10', name: 'Competition', slug: 'competition', icon: Trophy },
  { id: '11', name: 'Creative', slug: 'creative', icon: Palette },
  { id: '12', name: 'Event', slug: 'event', icon: Calendar },
  { id: '13', name: 'Faith', slug: 'faith', icon: Cross },
  { id: '14', name: 'Family', slug: 'family', icon: Users2 },
  { id: '15', name: 'Sports', slug: 'sports', icon: Football },
  { id: '16', name: 'Travel', slug: 'travel', icon: Plane },
  { id: '17', name: 'Volunteer', slug: 'volunteer', icon: HandMetal },
  { id: '18', name: 'Wishes', slug: 'wishes', icon: Star },
];

// Constants for use in code
export const CAMPAIGN_STATUS = {
    ACTIVE: 'active' as const,
    COMPLETED: 'completed' as const,
    PAUSED: 'paused' as const,
    CANCELLED: 'cancelled' as const,
    DRAFT: 'draft' as const,
    DELETED: 'deleted' as const,
    EXAMPLE: 'example' as const
} as const;

export type CampaignStatus = typeof CAMPAIGN_STATUS[keyof typeof CAMPAIGN_STATUS];

// Helper function to get random categories
export function getRandomCategories(count: number): Category[] {
    const shuffled = [...categories].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

export interface Campaign {
    id: string;
    slug: string;
    title: string;
    description: string;
    featuredImageUrl?: string;
    videoUrl?: string;
    currency: string;
    goalAmount: number;
    currentAmount: number;
    goal: number;
    amountRaised: number;
    location: string;
    country?: string;
    category: Category;
    donorCount: number;
    daysLeft: number;
    isUrgent: boolean;
    isFeatured: boolean;
    verificationStatus: string;
    verificationNotes?: string;
    startDate?: string;
    endDate?: string;
    ownerId: User;
    status: CampaignStatus;
    viewCount: number;
    shareCount: number;
    tags: string[];
    metadata: Record<string, any>;
    beneficiaryInfo?: Record<string, any>;
    bankDetails?: Record<string, any>;
    socialLinks?: Record<string, string>;
    updates?: any[];
    faq?: any[];
    teamMembers?: any[];
    expenses?: any[];
    milestones?: any[];
    riskFactors?: string;
    impactStatement?: string;
    targetAudience?: string;
    marketingPlan?: string;
    successMetrics?: Record<string, any>;
    externalLinks?: any[];
    pressCoverage?: any[];
    endorsements?: any[];
    createdAt: string;
    updatedAt: string;
  }
