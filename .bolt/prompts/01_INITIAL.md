# 📦 Shop2Give Full Stack Implementation Blueprint

## 🧩 Overview
You are building Shop2Give, a full-stack e-commerce and donation platform where purchases support fundraising campaigns. The goal is to enable intentional shopping that powers direct giving, rooted in Christian values and a mission of community and impact.

## ⚡️ Execution Policy for Bolt.new
IMPORTANT: Bolt.new must operate continuously, checking off tasks in the Implementation Checklist without pausing or waiting for instructions. Each completed module or file should immediately trigger the next logical task.

### ✔ Behavior Rules
1. No Halting — Do not stop after completing a single task. Progress to the next checklist item immediately.
2. Checklist Bound — Reference and validate against 02_IMPLEMENTATION_CHECKLIST.md at each step. Only mark a task complete if it meets all specified acceptance criteria.
3. Checklist Completeness — The checklist must include:
- All routes/pages and edge functions
- Database schema (all referenced tables and relationships)
- Donation percentage enforcement logic
- Stripe metadata validation
- Crypto donation logic
- RevenueCat & Pica webhook testing
- AI onboarding + OpenAI key support for store managers
- Final success condition: the entire system matches 01_INITIAL.md blueprint

4. Command Escalation — When Bolt.new finishes 01_INITIAL.md, it must continue with 03_IMPLEMENTATION_COMMAND.md immediately.

5. Self-checks — Every function or module implemented must include:
- Validation logic (e.g., metadata checks, % limits)
- Integration test stubs
- Logging and error recovery (if applicable)

## 🧠 Strategy for Bolt.new
1. Start with 01_INITIAL.md
- Extract and map all components, functions, endpoints, user flows, and integrations.
- For each, find its corresponding implementation task in 02_IMPLEMENTATION_CHECKLIST.md.
- Mark missing items (e.g., donation validation, crypto donation edge case) and add them.

2. Validate 02_IMPLEMENTATION_CHECKLIST.md
- Confirm every feature and flow mentioned in 01_INITIAL.md is reflected.
- Add missing checklist items (if any) such as:
- Stripe metadata validation hook
- Duplicate {product_id + campaign_id} cart logic
- Donation certificate PDF generation
- AI Wizard for onboarding
- Crypto donation verification endpoint

3. Proceed with Development
- Start from the top of the checklist (Foundation → Auth → Campaigns → Checkout).
- After each section:
- ✅ Validate acceptance criteria
- 📥 Log result
- 🚀 Continue to next section without delay

4. Final Phase: 03_IMPLEMENTATION_COMMAND.md
- Begin only after all items from the initial blueprint have been verified and implemented.
- Use this file as the execution logic source (structure, architecture, setup files, commands).
- Confirm Bolt.new has set up all components including Docker, Supabase, Stripe, RevenueCat, and Pica.

## 🔁 Reiteration Mechanism
If Bolt.new is restarted or reloaded:
- Resume from last incomplete checklist section.
- Re-validate already completed sections before progressing.

## 📐 Architecture Overview

Build "Shop2Give" – Support causes by
shopping online
Hero text: "Support causes by shopping online"
Hero subtext: "Purchase goods where proceeds go directly to fundraising campaigns that you care about."
Goal: Implement a full donation system tied to product purchases and campaign fundraising using Stripe and Supabase, implement full Complete Platform Implementation for adding products to the shop and campaigns to the platform.

## 🎯 Mission
“Empower generosity through everyday shopping.”

Shop2Give links each product purchase to a campaign, making giving automatic, transparent, and impactful.

## Why Shop2Give?
**Because every purchase has power.**

When you shop through Shop2Give, you're not just buying a product — you're funding a mission, supporting someone's story, and making generosity simple. Whether it's helping a student attend Bible school, supporting a family through illness, or giving toward life-changing causes, your order becomes a gift that gives back.

**Shop intentionally. Donate effortlessly. Change lives — one purchase at a time.**

## 🚀 Objective
Implement a fully integrated donation platform with:
- Stripe-powered checkout + donation flow
- Supabase-backed backend (auth, database, functions)
- Admin dashboards for platform, campaign, and store managers
- Multilingual (EN/NL), responsive UI using Vite, Tailwind 3, and Shadcn UI
- ChatAI and Pica integrations for product/campaign analysis, notifications, and AI onboarding
- Connect to:
    - Pica
    - Entry for domain
    - Algorand for crypto donations
    - RevenueCat for subscriptions
    - OpenAi, Claude for AI using Pica
    - Integration connection with Gmail, Outlook, Slack, Discord, using Pica

### Technologies Used:
- **Frontend:** React Vite + TailwindCSS 3 and Shadcn UI
- **Backend:** Supabase (PostgreSQL + Edge Functions), Pica integration for ChatAI (https://www.picaos.com/), OpenAI, Pica Integration with Slack/Discord for notifications (Platform Manager Notifications, Store Manager Notifications using his own API key),
Pica Integration with OpenAI for Store Manager to Analyze products and sales, using his own API key of OpenAI.
- **Payments:** Stripe Checkout for payments and donations. RevenueCat for subscriptions for Store Manager.
- **State Management:** Zustand + Custom Cart Store + Zustand for store/cart state
- **Auth:** Supabase Auth
- **Deployment:** Netlify 
- **Local Docker for Supabase:** Supabase Local Development Setup (Add files to project!)
    -- **Docker Compose:** https://raw.githubusercontent.com/elky-bachtiar/shop2give/refs/heads/feature/secure/docker-compose.yml
    -- **Supabase Local:** https://raw.githubusercontent.com/elky-bachtiar/shop2give/refs/heads/feature/secure/SUPABASE-LOCAL.md
    -- **Supabase Local script:** https://raw.githubusercontent.com/elky-bachtiar/shop2give/refs/heads/feature/secure/supabase/scripts/setup-local-supabase.sh

- **Dev Tools:** Bolt.new for prototyping, GitHub for version control
- **Multi Language:** English and Dutch, with flags icons. For each component and page, there is a separate file for each language. Each campaign / product language can be changed in the settings by user.


### Key Concepts:
- Each product purchase supports one campaign.
- Products in cart are stored using `{ product_id + campaign_id }` as a unique combo.
- Donation amount is computed based on `donationPercentage` (default 50%).
- On successful Stripe payment, donation records are written to Supabase and the campaign total is updated.

---

📦 Backend Architecture
**Supabase Schema Highlights:**

- Tables: users, user_profiles, donations, campaigns, campaign_products, orders, order_items, categories
- Stripe metadata synced to Supabase
- Logs: checkout_logs, webhook_logs, edge_function_logs
- RLS enabled, policy-controlled access

**Supabase Functions:**

- stripe-checkout: create checkout session with metadata
- stripe-webhook: process completed events, log, and update
- generate-csrf-token: CSRF protection
- category-detection, date-helpers, etc.

**Stripe Setup:**
- Per-campaign “Donation” product with fixed tiers (5–1000)
- Each checkout line includes metadata: product_id, campaign_id, donationPercentage
- Supabase inserts donation per item and updates campaign.total_raised

**RevenueCat Setup:**
- Connect RevenueCat to Supabase
- Create RevenueCat Edge Functions
- Store manager tiers (free, basic, premium)
- Subscriptions to SaaS E-commerce platform of Shop2Give 

---

🔁 User Flows

1. 📱 Sign In / Sign Up

**User Story:** As a user, I can sign in or sign up to the platform.

**Steps:**
- User visits /sign-in or /sign-up.
- Use social login or email login (Google, Apple, Facebook).
- User fills out form.
- User clicks "Sign In" or "Sign Up".
- User is redirected to /. (if Campaign owner/ Store Manager, redirect to /dashboard)

2. 🛒 Add to Cart Flow

**User Story:** As a shopper, I can add a product and select a campaign to donate to.

**Steps:**
-   User visits product page.
-   Selects a campaign from dropdown.
-   Clicks "Add to Cart".
-   If product + campaign combo does not exist in cart, it's added as a new line item.
-   If it already exists, quantity is increased.

3. 💸 Checkout Flow (Stripe)

**User Story:** As a shopper, I want to complete payment and donate automatically.

**Steps:**
-   User goes to /cart.
-   Sees each product tied to campaign and donation percentage.
-   Clicks “Checkout”.
-   App creates a Stripe Checkout session.
-   Each item includes metadata: product_id, campaign_id, donationPercentage.
-   User completes payment in Stripe.
-   Redirected to /success.

4. 📊 Donation Processing Flow (Webhook)

**User Story:** As a platform, I want to track all donations made via Stripe.

**Steps:**
-   Stripe sends checkout.session.completed event.
-   Supabase Edge Function reads metadata from each line_item.
-   Calculates donation = price * quantity * percentage.
-   Inserts donation row in donations table.
-   Updates campaign total_raised.

**Supabase Edge Function reads metadata from each line_item. Calculates donation = price * quantity * percentage. Inserts donation row in donations table. Updates campaign total_raised.**

5. 💖 User Donation Flow

**User Story:** As a user, I can add a donation to a campaign.
    
**Steps:**
-   Go to /campaigns/{slug}
-   Click "Donate Now"
-   Shadcn Dialog opens
-   Fill out form
-   Choose fixed donation (25, 50, 100, 250, 500, 1000) as configured by campaign owner
-   Enter optional flexible donation amount
-   Click "Add Donation to Cart"
-   Redirected to /cart
-   See donation as line item in cart
-   Click "Checkout"
-   Stripe Checkout opens
-   Product "Donation" has campaign_id in metadata
-   Stripe holds one "Donation" product with multiple price IDs
-   Redirected to /success

6. 👤 User Profile: Donation History (future)

**User Story:** As a logged-in user, I want to see my past donations.

**Steps:**
-   Go to /profile/donations
-   View table of:
    -- Campaign
    -- Product
    -- Amount donated
    -- Date

7. 👨‍💻 Campaign and Product CRUD (Admin)

**User Story:** As a platform manager, I want to manage campaigns and products.

**Steps:**
-   Go to /admin
-   Click "Add/Edit Campaign" or "Add/Edit Product"
-   Fill out form
-   Save

8. 🍿️ Category Management

**User Story:** As a platform manager, I want to manage product categories.

**Steps:**
-   Go to /admin
-   Click "Add/Edit Category"
-   Fill out form
-   Save

9. 👥 User Management

**User Story:** As a platform manager, I want to manage users.

**Steps:**
-   Go to /admin
-   Click "Add/Edit User"
-   Fill out form
-   Save

10. 🛠️ Admin Management

**User Story:** As a platform manager, I want to manage admins.

**Steps:**
-   Go to /admin
-   Click "Add/Edit Admin"
-   Fill out form
-   Save

11. 📦 Order Management

**User Story:** As a platform manager, I want to manage orders.

**Steps:**
-   Go to /admin
-   Click "Add/Edit Order"
-   Fill out form
-   Save

12. 📣 Campaign CRUD (Campaign Owner)

**User Story:** As a campaign owner, I want to manage my campaigns.

**Steps:**
-   Go to /dashboard
-   Click "Add/Edit Campaign"
-   Fill out title, description, category, location, goal, image
-   (optional) AI review
-   Save

13. 🛒 Product CRUD (Store Manager)

**User Story:** As a store manager, I want to manage products.

**Steps:**
-   Go to /dashboard
-   Click "Add/Edit Product"
-   Upload image
-   (optional) Assign to campaign
-   Save

14. 📊 Dashboard and Analytics (Store Manager)

**User Story:** As a store manager, I want to track my product sales and donation impact.

**Features:**

- Revenue summary
- Product performance chart (Sales, Donations)
- Campaign links and donation totals
- Product availability and inventory management

15. 🤨 Admin Dashboard and Analytics (Platform Admin)

**User Story:** As a platform admin, I want a complete overview of the system.

**Features:**

- Total platform donations
- Top performing products and campaigns
- New users, signups and conversion
- Order volume and traffic
- Creator and cause verification status
- Stripe balance, pending transfers
- Export data (CSV)

**User Story:** As a platform admin, I want a complete overview of the system.

**Features:**

- Total platform donations
- Top performing products and campaigns
- New users, signups and conversion
- Order volume and traffic
- Creator and cause verification status
- Stripe balance, pending transfers
- Export data (CSV)

16. 📢 Campaign Sharing

**User Story:** As a campaign owner, I want to share a campaign on social media using a campaign slug URL.

**Steps:**

- Go to /campaigns/{slug}
- Click "Share Campaign"
- Choose platform (Facebook, Twitter, LinkedIn, WhatsApp, etc.)

**System generates sharable URL https://shop2give.store/campaigns/{slug}

**Pre-fill social media text with campaign title and short description

**Link is copied or shared via native social share tools

---

17. 💱 Crypto Donation Flow (Algorand Wallet)

**User Story:** As a donor, I want to donate to a campaign using my Algorand wallet.

**Steps:**
- Visit /campaigns/{slug}
- Click "Donate with Crypto"
- Shadcn Dialog opens with QR code and wallet address
- Select donation tier or enter custom ALG amount
- Copy address or scan QR with Algorand-compatible wallet
- Send ALG from wallet
- Supabase Edge Function or webhook listens for transaction via Algorand API
- On confirmation, donation is recorded in donations table
- Campaign’s total_raised updated

**Optional: User redirected to /success-crypto with donation acknowledgment**

---
🚂 Future Enhancements – Detailed User Flows

1. 🙈 Anonymous Donations

**User Story:** As a donor, I want the option to donate anonymously.

**Steps:**

- User goes to /campaigns/{slug}
- Chooses donation amount and checks "Donate anonymously"
- Metadata on donation marks user as anonymous

**In donation history and campaign total, donor info is hidden or marked as "Anonymous"**

2. 🥛 Crypto Donations (Algorand)

**User Story:** As a donor, I want to donate using Algorand.

**Steps:**

- User selects crypto payment option at checkout
- Wallet connect modal opens for Algorand
- User transfers amount to smart contract tied to campaign_id
- Once confirmed, donation is recorded in Supabase
- Redirected to /success

3. 💼 Start Campaign via Hero CTA

**User Story:** As a user, I can launch the campaign wizard by clicking "Start a Shop2Give"

**Steps:**

- Click CTA on Hero
- Redirect to sign-in or register
- After login, launch AI Chat Wizard with preview UI (split screen)
- User answers questions (title, cause, goal, etc.)
- Campaign preview updates live

On submit, campaign is created

4. 🧠 AI Assistant for Campaign Creation

**User Story:** As a campaign manager, I want an AI to help build impactful campaigns.

**Steps:**

- Chat interface prompts campaign questions
- GPT suggests headlines, descriptions, goals, and categories
- Preview pane updates live
- On save, campaign is submitted with AI-optimized content

5. 📈 User Dashboard with Impact Tracking

**User Story:** As a user, I want to track how my purchases impact campaigns.

**Features:**

- Total donated
- Number of campaigns supported
- Donation graph over time
- Top 3 causes supported

6. 🌟 Creator Dashboard with Earnings

**User Story:** As a creator, I want to view my total earnings and donation impact.

**Features:**

- Total sales
- Tips earned
- Donations generated
- Payout status

7. 💼 Subscription Donation System

**User Story:** As a user, I want to subscribe monthly to a campaign.

**Steps:**

- Go to /campaigns/{slug}
- Choose "Subscribe Monthly"
- Select amount and duration
- Stripe creates subscription with metadata
- Donation recorded monthly

8. 📰 Campaign Updates & Social Feed

**User Story:** As a campaign manager, I want to post updates to supporters.

**Features:**

- Update text/images via /dashboard
- Support comments/likes
- Appear on campaign page timeline

9. 💎 Referral & Affiliate Link Tracking

**User Story:** As a user, I want to earn rewards via referrals.

**Steps:**

- User copies referral URL
- Others visit and buy using link
- Referral is tracked via query param
- User sees earned rewards in /profile/referrals

10. 📄 Donation Certificates via Email

**User Story:** As a donor, I receive a certificate after donating.

**Steps:**

- After /success, trigger email with certificate
- PDF shows donor name, date, amount, campaign
- Option to print/share

11. 🙏 Auto Thank-you Messages

**User Story:** As a campaign manager, I want auto thank-you emails sent to donors.

**Steps:**

- After Stripe success, Supabase triggers email
- Email includes personalized thank-you and impact info

12. 🎒 Product Bundling for Fundraising Kits

**User Story:** As a campaign owner, I want to create product bundles.

**Steps:**

- Select products
- Create bundle product with name and price
- Bundle appears in /products with custom donation config

13. ⏳ Campaign Expiration and Archive

**User Story:** As a platform, I want campaigns to auto-expire.

**Steps:**

- Campaign has end_date
- After date, status = "archived"
- Archived campaigns moved to /archive

14. 💶 Payout Tracking

**User Story:** As an admin, I track Stripe payouts for creators and causes.

**Features:**

- View payout history
- Status: pending, paid, failed
- Linked to Stripe transfer IDs

15. 🤜 Slack/Discord Bots/ Gmail/ Outlook for Real-Time Sales

**User Story:** As a team, I receive donation alerts.

**Steps:**

- Connect Slack or Discord, / Gmail/ Outlook for Real-Time Sales in /settings
- On Stripe success, webhook sends event
- Alert posted in real time to channel

16. 🔍 Live Stream Fundraising

**User Story:** As a campaign, I want to embed livestreams.

**Features:**

- Add YouTube/Twitch embed link
- Viewers can donate directly during stream
- Donation ticker shows on video overlay

17. 📏 QR Code Generator

**User Story:** As a campaign manager, I want a QR code for sharing.

**Steps:**

- Click "Generate QR Code" in /dashboard
- QR code created for https://shop2give.store/campaigns/{slug}
- Download and share in flyers/posters
---


## 🏠 Home Page
- Hero section with branding and CTA
- Scroll animation + AI onboarding prompt
- 3D animation in hero section
- Gradient transitions between sections (e.g. pink → yellow → white)
- Popular Campaigns, if clicked, go to campaign detail page 
- Featured Products sections, if clicked, go to product detail page
- Product contains "Add to Cart" button
- Global nav bar with:
    -- Home
    -- Campaigns
    -- Products
    -- About
    -- Sign In / Sign Up (Add Social Login)
    -- Shopping Cart (🛒)
- Footer with:
    -- Logo including tagline "Buy with purpose. Give with heart."
    -- Social links (Facebook, Twitter, Instagram, LinkedIn, Email icons)
    -- Language selector NL/EN with flags icons
    -- RESOURCES (How it works, Pricing FAQ, Privacy Policy, Terms of Service)
    -- COMPANY (Links About, Careers, Contact, Blog, Partner)
    -- LEGAL (Links Privacy Policy, Terms of Service, GDPR)
    -- Shopping Cart (🛒)
---

## 🏠 Categories Page
- Title "Browse fundraisers by category"
- CTA "Start a Shop2Give"
- List of categories with icons, 6 per row, and samples (max 3 per category)
- Sample Campaigns with Campaign images, Title and progress bar, 3 per row, button "See more" at bottom right of each category
- If clicked, go to campaign listing page

## 🏠 Category (slug)
- Search, filter by category
- List of campaigns in category with icons and samples, 3 per row, button "See all" at bottom of the list
- If clicked, go to campaign detail page

## 🔥 Campaign Features
- Campaign Listing Page
- Search, filter by category
- Categories shown with icons and samples (max 3 per category)
- Campaign Detail Page
    -- Title, Description, Main Image
    -- Add multiple images
    -- Campaign Manager Info
    -- Donation goal, current amount, donor count
    -- Circular Progress Bar (goal vs raised)
    -- CTA button (Donate)
    -- Share buttons  ( Dialog-> Facebook, Twitter, Instagram, LinkedIn)
    -- See who donated (Donor List, max 3), add button to see all donors
    -- Button to see top donors "Top Donors" (Dialog list of top donors, max 5), including TAB: "Newest", "Top" (current), "Most Donated"
    -- Linked Products (from Stripe)
    -- WYSIWYG Campaign Editor for owners

---

## 📦 Stripe Checkout Optimization
Mention Stripe metadata validation or cleanup hook to ensure:

- donationPercentage stays within bounds
- line items with duplicate product_id + campaign_id don’t result in over-donating

---

## 🛍️ Product Features
- Product Listing Page
- Products pulled from Stripe
- Search, filter by category
- Product Detail Page
- Add to Cart (with select Campaign)
- Show what % goes to donation
- Featured Products on homepage

---

## 🛒 Shopping Cart
- Unique line per product + campaign combination
- Product info includes donation split (default 50%)
- Change campaign from cart
- Checkout using Stripe
- After success → redirect to /success

---
## 🖼️ UI & Theme
Visual Identity:
- Brand pink: #FFF3F1
- Navigation teal dark: #2A6D69
- Brand teal light: #87D7CC
- Brand teal medical: #4ECDC4
- Brand teal education: #4CB8C4
- Brand teal mission: #4CBEB6
- Brand teal community: #3CBCB5
- Brand charcoal: #1A2C34
- Brand cream: #FFFAF9
- Brand gold dark: #F4D03F
- Brand gold: #F7DC6F
- Font: Playfair Display
- Shadcn UI theme, Light/Dark toggle, NL/EN toggle
global.css
```

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 346.8 77.2% 49.8%;
    --primary-foreground: 355.7 100% 97.3%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 346.8 77.2% 49.8%;
    --radius: 0.65rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    --background: 20 14.3% 4.1%;
    --foreground: 0 0% 95%;
    --card: 24 9.8% 10%;
    --card-foreground: 0 0% 95%;
    --popover: 0 0% 9%;
    --popover-foreground: 0 0% 95%;
    --primary: 346.8 77.2% 49.8%;
    --primary-foreground: 355.7 100% 97.3%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 15%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 12 6.5% 15.1%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 85.7% 97.3%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 346.8 77.2% 49.8%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
  }
}


```

---
## Branding
- Main brand background: `#FFF3F1` (light pink)
  -- Header/nav background: `#2A6D69` (dark teal)
  -- CTA button background: shadcn default
  -- CTA text color: shadcn default
  -- CTA hover: shadcn default
  -- Primary text color: shadcn default
  -- Font: @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
  -- Rounded corners: `border-radius: 12px;`

✅ GLOBAL LAYOUT
- Base page background: `#FFF3F1`
- Section padding: `padding: 2rem`
- Font sizes for H1, H2, and body as seen in image

✅ NAVIGATION BAR (shared)
- Background: `#4CBEB6`
- Font color: white or soft pink hover
- Right-aligned links: Products, Campaigns, About, Search Icon

✅ HOMEPAGE COMPONENTS
Use `pages/HomePage.css` for homepage-specific rules.

1. **Hero Section**
   - Centered text block
   - Title: dark text (brand charcoal) on pink background
   - Subtitle: same color, smaller size
   - 3D animation
   - Padding top and bottom: `5rem`
   - CTA button: Shadcn default theme important color

HeroSection.tsx
```
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, ShoppingBag, TrendingUp } from 'lucide-react';

export function HeroSection() {
  return (
    <section cl BassName="relative overflow-hidden gradient-hero py-20 lg:py-32">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full animate-bounce-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 bg-primary/5 rounded-full animate-float"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold brand-charcoal-text leading-tight"
            >
              Support causes by{' '}
              <span className="text-gradient">shopping online</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl"
            >
              Purchase goods where proceeds go directly to fundraising campaigns that you care about.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button size="lg" className="text-lg px-8 py-4 group">
                Start a Shop2Give
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                Browse Campaigns
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="mt-12 grid grid-cols-3 gap-8 text-center lg:text-left"
            >
              <div>
                <div className="text-2xl font-bold brand-charcoal-text">$2.4M+</div>
                <div className="text-sm text-gray-600">Donated</div>
              </div>
              <div>
                <div className="text-2xl font-bold brand-charcoal-text">15K+</div>
                <div className="text-sm text-gray-600">Campaigns</div>
              </div>
              <div>
                <div className="text-2xl font-bold brand-charcoal-text">50K+</div>
                <div className="text-sm text-gray-600">Donors</div>
              </div>
            </motion.div>
          </motion.div>

          {/* 3D Animation Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative"
          >
            <div className="relative w-full h-96 lg:h-[500px] flex items-center justify-center">
              {/* Central Heart */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute z-10"
              >
                <Heart className="w-20 h-20 text-primary fill-current" />
              </motion.div>

              {/* Floating Icons */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-10 bg-white p-4 rounded-full shadow-soft"
              >
                <ShoppingBag className="w-8 h-8 text-primary" />
              </motion.div>

              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-10 right-10 bg-white p-4 rounded-full shadow-soft"
              >
                <TrendingUp className="w-8 h-8 text-green-500" />
              </motion.div>

              <motion.div
                animate={{ y: [-5, 15, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-10 left-16 bg-white p-4 rounded-full shadow-soft"
              >
                <Heart className="w-8 h-8 text-red-500 fill-current" />
              </motion.div>

              <motion.div
                animate={{ y: [15, -5, 15] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-10 right-16 bg-white p-4 rounded-full shadow-soft"
              >
                <Heart className="w-8 h-8 text-pink-500 fill-current" />
              </motion.div>

              {/* Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full">
                <motion.path
                  d="M 100 100 Q 200 50 300 100"
                  stroke="rgba(75, 190, 182, 0.3)"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.path
                  d="M 100 300 Q 200 250 300 300"
                  stroke="rgba(75, 190, 182, 0.3)"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```
2. **Instructions Section**
   - Centered text block
   - Title: dark text (brand charcoal) on brand gold background
   - Padding top and bottom: `5rem`

   - Instructions, if possible add animation for each step: 
    -- Step 1 – Create your fundraiser
        Click the 'Start a Shop2Give' button to begin. Our AI-powered system will guide you through setting up your fundraiser details and goals.

    -- Step 2 – Share your fundraiser link
        Share your unique fundraiser link with friends and family. Track progress and engage supporters through your Shop2Give dashboard.

    -- Step 3 – Receive funds securely
        Add your bank details or invite your fundraiser beneficiary to receive donations directly and securely through our platform.

```ts
function Step({ number, title, description, icon }: StepProps) {
  return (
    <div className="flex flex-col items-center p-8 text-center md:items-start md:text-left bg-card rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
        <div className="text-accent-foreground">
          {icon}
        </div>
      </div>
      <h3 className="mb-3 font-serif text-xl font-semibold text-foreground">
        Step {number} – {title}
      </h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
```

3. **Popular Campaigns Grid**
    - Section background: brand-softCream
    - 3 columns , 3 rows
    - Card background: white
```ts
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { ProgressBar } from './ui/ProgressBar';
import { CircularProgress } from './ui/CircularProgress';
import { MapPin } from 'lucide-react';
import { Campaign } from '../data/campaigns';
import { calculateProgress, formatCurrency } from '../lib/utils';

type CampaignCardProps = {
  campaign: Campaign;
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  const progress = calculateProgress(campaign.amountRaised, campaign.goal);
  const isFullyFunded = progress >= 100;

  return (
    <Link 
      to={`/campaigns/${campaign.slug}`} 
      className="group block transform transition-all duration-300 hover:-translate-y-1"
    >
      <Card className="h-full overflow-hidden">
        <div className="relative h-48 overflow-hidden">
          <img
            src={campaign.imageUrl}
            alt={campaign.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {isFullyFunded && (
            <div className="absolute right-4 top-4">
              <Badge variant="success\" showIcon>Fully Funded</Badge>
            </div>
          )}
        </div>
        <div className="bg-brand-pink/30 p-6">
          <div className="flex items-center gap-1 text-sm text-brand-charcoal/70">
            <MapPin className="h-3 w-3" />
            <span>{campaign.location}</span>
          </div>
          <h3 className="line-clamp-2 font-serif text-lg font-semibold text-brand-charcoal mt-2">
            {campaign.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-brand-charcoal/80">
            {campaign.description}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <CircularProgress
              value={progress}
              size={40}
              category="mission"
            />
            <div className="flex-1">
              <ProgressBar value={progress} category="mission" />
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-brand-charcoal/70">Raised</span>
            <span className="font-bold text-brand-charcoal">
              {formatCurrency(campaign.amountRaised)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}    
```

3. **Featured Products Grid**
   - Card background: white
   - Product card wrapper background: `#FFE9E5` (slightly darker than main pink)
   - Shadow on cards: subtle drop-shadow
   - Image height fixed
   - `Add to cart` button: teal with white text

✅ PRODUCT CARDS (shared)
Use `components/ProductCard.css`
- Consistent box shadow, spacing, and hover interaction
- All prices and names aligned bottom

✅ DO NOT
- Use inline CSS or `style=` in any component
- Use Tailwind unless it pulls from a centralized theme config
- Change layout spacing defined in design
---
 ## Supabase functions
- supabase/functions/_shared/csrf.ts
- stripe-webhook
- stripe-checkout
- generate-csrf-token
- csrf
- date-helpers.ts
- category-detection

---
## Supabase functions (seed data stripe)
- Add donation product to stripe
    - Check for each campaign if "Donation" product exist in stripe
    - Each campaign has its own donation product (metadata campaign_id)
    - Each product has multiple tariffs (fixed amount) in stripe
    - pre seed tariffs (5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950, 1000)
- Get product from stripe by campaign_id and product name
- Get all products from stripe by campaign_id
- Get all products from stripe by product name
- Get all products from stripe by product name and campaign_id
- Get product with product_name and campaign_id
- Store products in supabase (Always base on stripe products)
---

## Supabase schema
### Supabase Auth Roles (custom claims / RLS policies)
- `platform_admin`
- `store_manager`
- `campaign_owner`
- `donor`

This is a basic implementation of a crowdfunding platform. If you miss something according to the prompt above, you need to add tables, views, policies, etc. to the database.

- stripe tables
https://github.com/elky-bachtiar/shop2give/blob/main/supabase/migrations/20250530203959_twilight_sunset.sql
- user_roles, campaigns, campaign_images, campaign_products, donations, nable Row Level Security
https://github.com/elky-bachtiar/shop2give/blob/main/supabase/migrations/20250601074857_fading_union.sql
- Logs, webhook_logs, checkout_logs, edge_function_logs, Enable RLS
https://github.com/elky-bachtiar/shop2give/blob/main/supabase/migrations/20250603104912_proud_tooth.sql
- campaigns update, products, categories, donations update, orders, order_items, categories seed data, Create RLS Policies
- user_profiles, creators, causes, update products, update orders, payment_splits
https://github.com/elky-bachtiar/shop2give/blob/main/supabase/migrations/20250604114145_sparkling_coast.sql


---
## Implementation details
- Supabase Edge Functions csrf.ts
https://raw.githubusercontent.com/elky-bachtiar/shop2give/refs/heads/feature/secure/supabase/functions/_shared/csrf.ts
- Supabase Edge Functions generate-csrf-token:
https://raw.githubusercontent.com/elky-bachtiar/shop2give/refs/heads/feature/secure/supabase/functions/generate-csrf-token/index.ts
- Supabase Edge Functions stripe_checkout:
https://raw.githubusercontent.com/elky-bachtiar/shop2give/refs/heads/feature/secure/supabase/functions/stripe-checkout/index.ts
- Supabase Edge Functions stripe_webhook:
https://raw.githubusercontent.com/elky-bachtiar/shop2give/refs/heads/feature/secure/supabase/functions/stripe-webhook/index.ts
- Supabase Edge Functions utils/date-helpers.ts:
https://raw.githubusercontent.com/elky-bachtiar/shop2give/refs/heads/feature/secure/supabase/functions/utils/date-helpers.ts
- Supabase Edge Functions category-detection:
https://github.com/elky-bachtiar/shop2give/blob/feature/secure/supabase/functions/category-detection/index.ts

# Files To be added to project
- Dev journal: https://raw.githubusercontent.com/elky-bachtiar/shop2give/refs/heads/feature/secure/DEV-JOURNAL.md
- bolt ignore file: https://raw.githubusercontent.com/elky-bachtiar/shop2give/refs/heads/feature/secure/.bolt/ignore

---

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
   - Follow Vite best practices
   - Include comprehensive comments
   - Use consistent code style

2. **UI/UX Standards**
   - Create responsive designs that work on all devices
   - Implement multilingual support (EN/NL) with flag icons
   - Use Shadcn UI components with brand theming based on provided color scheme
   - Ensure accessibility compliance
   - Create intuitive user flows for all user roles
   - Include Bolt.new badge with lightning icon in footer on all pages

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

## Important Note
If Bolt.new cannot finish all checklist items in one session, it should continue working on the next items without asking for permission. Development should proceed in a continuous manner until all requirements are implemented.