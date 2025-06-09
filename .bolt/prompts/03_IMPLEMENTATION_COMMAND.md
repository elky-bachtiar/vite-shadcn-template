# Shop2Give Implementation Command

## Overview
You are tasked with implementing the Shop2Give platform according to the detailed specifications in the initial prompt and the comprehensive acceptance criteria in our implementation checklist. This is a full-stack e-commerce and donation platform where purchases support fundraising campaigns, rooted in Christian values and a mission of community and impact.

## Mission & Objective
"Empower generosity through everyday shopping."

Shop2Give links each product purchase to a campaign, making giving automatic, transparent, and impactful. The platform enables intentional shopping that powers direct giving, with the goal of implementing a full donation system tied to product purchases and campaign fundraising.

## Current Status
Currently, only the basic UI foundation has been created with:
- Basic homepage structure
- Some UI components 
- Brand styling

## Technology Stack
- **Frontend:** Vite with React, TailwindCSS 3 and Shadcn UI
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Payments:** Stripe Checkout for payments and donations, RevenueCat for subscriptions
- **State Management:** Zustand for store/cart state
- **Auth:** Supabase Auth
- **Deployment:** Netlify
- **Local Development:** Docker for Supabase local setup
- **Integrations:** 
  - Pica for ChatAI, notifications, and AI features
  - OpenAI/Claude through Pica
  - Gmail/Outlook/Slack/Discord through Pica
  - Algorand for crypto donations
  - RevenueCat for store manager subscriptions
- **Multi-Language:** English and Dutch with flag icons

## Implementation Tasks
For this implementation phase, focus on building the following key components, ensuring each meets the acceptance criteria outlined in the checklist:

1. **Supabase Database Schema & Backend**
   - Set up local Supabase with Docker using the provided configuration files
   - Create all required tables with proper relationships
   - Configure Row Level Security (RLS) for different user roles
   - Implement triggers for donation tracking
   - Set up Edge Functions for Stripe integration, webhooks, and other integrations

2. **Authentication System**
   - Implement Supabase Auth with social login integration (Google, Apple, Facebook)
   - Create sign-in and sign-up pages with proper validation
   - Set up user profiles and authorization roles
   - Implement role-based redirects (Campaign owner/Store Manager to /dashboard)

3. **Campaign & Product Management**
   - Create campaign listing and detail pages
   - Build campaign creation and editing forms with multi-language support
   - Implement product management interfaces with inventory tracking
   - Set up category system with proper filtering
   - Add campaign verification workflow
   - Implement donation tier configuration for campaigns

4. **Shopping & Donation Flow**
   - Implement cart with Zustand using product_id + campaign_id as unique combo
   - Create checkout flow with Stripe integration
   - Add donation processing with webhook handling
   - Implement direct donation options on campaigns with fixed tiers
   - Ensure proper metadata handling for donations
   - Calculate donation amounts based on donationPercentage (default 50%)

5. **Integrations**
   - Set up RevenueCat for store manager subscriptions (free, basic, premium)
   - Implement Pica integration for ChatAI and notifications
   - Connect with Gmail, Outlook, Slack, and Discord through Pica
   - Implement OpenAI/Claude integration through Pica for product/campaign analysis
   - Set up Algorand for crypto donations
   - Configure domain entry integration

## Implementation Requirements

1. **Code Quality**
   - Use TypeScript throughout the application
   - Implement proper error handling
   - Follow best practices
   - Include comprehensive comments
   - Use consistent code style

2. **UI/UX Standards**
   - Create responsive designs that work on all devices
   - Implement multilingual support (EN/NL) with flag icons
   - Use Shadcn UI components with brand theming based on provided color scheme
   - Ensure accessibility compliance
   - Create intuitive user flows for all user roles

3. **Testing & Documentation**
   - Write unit tests for critical functions
   - Create E2E tests with Playwright
   - Document API endpoints
   - Add user guides for each role
   - Include setup instructions

## Key Files to Update/Create

1. **Database Schema & Local Setup**
   - Add migration files in `/supabase/migrations/`
   - Implement Docker configuration for local Supabase
   - Create SQL scripts for initial data
   - Set up proper RLS policies

2. **API Layer**
   - Implement API routes in `/app/api/`
   - Create Supabase Edge Functions in `/supabase/functions/`
   - Set up service layer in `/lib/services/`
   - Implement data models in `/lib/models/`

3. **Frontend Components**
   - Create auth components in `/components/auth/`
   - Add campaign components in `/components/campaigns/`
   - Build product management in `/components/products/`
   - Implement cart and checkout in `/components/checkout/`
   - Create multi-language components with separate files for each language

4. **State Management & Cart**
   - Create Zustand stores in `/store/`
   - Implement cart state management with product_id + campaign_id as unique combo
   - Set up auth context with role-based access
   - Add campaign state management

## Key Concepts
- Each product purchase supports one campaign
- Products in cart are stored using `{ product_id + campaign_id }` as a unique combo
- Donation amount is computed based on `donationPercentage` (default 50%)
- On successful Stripe payment, donation records are written to Supabase and the campaign total is updated
- Each campaign has its own donation product with fixed tiers in Stripe

## Critical User Flows to Implement
1. Sign In / Sign Up flow with role-based redirects
2. Add to Cart flow with campaign selection
3. Checkout flow with Stripe integration
4. Donation processing flow with webhook handling
5. User donation flow with fixed donation tiers
6. User profile and donation history
7. Campaign and product CRUD operations
8. Category management
9. User management
10. Store manager and platform manager dashboards

## Deliverables
Provide fully functioning code that implements all features, meeting all acceptance criteria outlined in the implementation checklist. Focus on creating a robust, maintainable codebase that follows best practices and includes all integrations specified in the initial prompt.

## Testing Instructions
After implementation, demonstrate each feature working correctly by:
1. Creating test users with different roles (shopper, campaign owner, store manager, platform manager)
2. Adding test campaigns and products with multi-language support
3. Completing test donations and purchases with various donation percentages
4. Verifying database records are created correctly with proper relationships
5. Showing webhook processing works properly for all integrated services
6. Testing all integrations (Stripe, Supabase, Pica, RevenueCat, Algorand)
7. Verifying multi-language support for all content
