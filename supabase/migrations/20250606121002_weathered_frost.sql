/*
  # Shop2Give Initial Database Schema

  1. Core Tables
    - users (extends auth.users)
    - user_profiles
    - campaigns
    - campaign_images
    - products
    - categories
    - donations
    - orders
    - order_items
    - campaign_products (linking table)

  2. Authentication & Roles
    - user_roles table with RLS policies
    - Role-based access control

  3. Logging Tables
    - checkout_logs
    - webhook_logs
    - edge_function_logs

  4. Security
    - Enable RLS on all tables
    - Create appropriate policies for each role
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('donor', 'campaign_owner', 'store_manager', 'platform_admin');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'archived');
CREATE TYPE campaign_category AS ENUM ('medical', 'education', 'community', 'mission', 'emergency', 'environment');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled', 'refunded');
CREATE TYPE donation_type AS ENUM ('direct', 'product_purchase', 'subscription');

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  date_of_birth date,
  language_preference text DEFAULT 'en',
  notification_preferences jsonb DEFAULT '{"email": true, "push": true}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'donor',
  assigned_by uuid REFERENCES auth.users(id),
  assigned_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(user_id, role)
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  color text,
  parent_id uuid REFERENCES categories(id),
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  short_description text,
  goal_amount integer NOT NULL CHECK (goal_amount > 0),
  current_amount integer DEFAULT 0 CHECK (current_amount >= 0),
  currency text DEFAULT 'EUR',
  category campaign_category NOT NULL,
  location text,
  country text,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status campaign_status DEFAULT 'draft',
  featured_image_url text,
  video_url text,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  is_urgent boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  verification_status text DEFAULT 'pending',
  verification_notes text,
  donor_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  share_count integer DEFAULT 0,
  tags text[],
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Campaign images table
CREATE TABLE IF NOT EXISTS campaign_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  alt_text text,
  caption text,
  sort_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  short_description text,
  price integer NOT NULL CHECK (price > 0),
  currency text DEFAULT 'EUR',
  category_id uuid REFERENCES categories(id),
  store_manager_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_product_id text,
  stripe_price_id text,
  featured_image_url text,
  gallery_images text[],
  inventory_count integer DEFAULT 0,
  is_digital boolean DEFAULT false,
  is_active boolean DEFAULT true,
  donation_percentage integer DEFAULT 50 CHECK (donation_percentage >= 0 AND donation_percentage <= 100),
  weight_grams integer,
  dimensions jsonb,
  tags text[],
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Campaign products linking table
CREATE TABLE IF NOT EXISTS campaign_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  donation_percentage integer DEFAULT 50 CHECK (donation_percentage >= 0 AND donation_percentage <= 100),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(campaign_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  email text NOT NULL,
  status order_status DEFAULT 'pending',
  subtotal integer NOT NULL CHECK (subtotal >= 0),
  tax_amount integer DEFAULT 0 CHECK (tax_amount >= 0),
  shipping_amount integer DEFAULT 0 CHECK (shipping_amount >= 0),
  total_amount integer NOT NULL CHECK (total_amount >= 0),
  currency text DEFAULT 'EUR',
  stripe_session_id text,
  stripe_payment_intent_id text,
  billing_address jsonb,
  shipping_address jsonb,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  campaign_id uuid REFERENCES campaigns(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price integer NOT NULL CHECK (unit_price >= 0),
  total_price integer NOT NULL CHECK (total_price >= 0),
  donation_amount integer DEFAULT 0 CHECK (donation_amount >= 0),
  donation_percentage integer DEFAULT 0 CHECK (donation_percentage >= 0 AND donation_percentage <= 100),
  created_at timestamptz DEFAULT now()
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount integer NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'EUR',
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  donor_id uuid REFERENCES auth.users(id),
  order_item_id uuid REFERENCES order_items(id),
  donation_type donation_type DEFAULT 'direct',
  is_anonymous boolean DEFAULT false,
  message text,
  stripe_payment_intent_id text,
  stripe_session_id text,
  donor_name text,
  donor_email text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Logging tables
CREATE TABLE IF NOT EXISTS checkout_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  status text NOT NULL,
  amount integer,
  currency text,
  metadata jsonb DEFAULT '{}',
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  event_type text NOT NULL,
  processed boolean DEFAULT false,
  error_message text,
  retry_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS edge_function_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  status text NOT NULL,
  execution_time_ms integer,
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE edge_function_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Platform admins can manage all roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'platform_admin' 
      AND ur.is_active = true
    )
  );

-- RLS Policies for categories
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Platform admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'platform_admin' 
      AND ur.is_active = true
    )
  );

-- RLS Policies for campaigns
CREATE POLICY "Anyone can view active campaigns"
  ON campaigns FOR SELECT
  TO authenticated, anon
  USING (status = 'active');

CREATE POLICY "Campaign owners can manage their campaigns"
  ON campaigns FOR ALL
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Platform admins can manage all campaigns"
  ON campaigns FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'platform_admin' 
      AND ur.is_active = true
    )
  );

-- RLS Policies for campaign_images
CREATE POLICY "Anyone can view campaign images"
  ON campaign_images FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c 
      WHERE c.id = campaign_id 
      AND c.status = 'active'
    )
  );

CREATE POLICY "Campaign owners can manage their campaign images"
  ON campaign_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c 
      WHERE c.id = campaign_id 
      AND c.owner_id = auth.uid()
    )
  );

-- RLS Policies for products
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Store managers can manage their products"
  ON products FOR ALL
  TO authenticated
  USING (store_manager_id = auth.uid());

CREATE POLICY "Platform admins can manage all products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'platform_admin' 
      AND ur.is_active = true
    )
  );

-- RLS Policies for campaign_products
CREATE POLICY "Anyone can view active campaign products"
  ON campaign_products FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

CREATE POLICY "Campaign owners can manage their campaign products"
  ON campaign_products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c 
      WHERE c.id = campaign_id 
      AND c.owner_id = auth.uid()
    )
  );

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Platform admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role = 'platform_admin' 
      AND ur.is_active = true
    )
  );

-- RLS Policies for order_items
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders o 
      WHERE o.id = order_id 
      AND o.user_id = auth.uid()
    )
  );

-- RLS Policies for donations
CREATE POLICY "Anyone can view non-anonymous donations"
  ON donations FOR SELECT
  TO authenticated, anon
  USING (is_anonymous = false);

CREATE POLICY "Donors can view their own donations"
  ON donations FOR SELECT
  TO authenticated
  USING (donor_id = auth.uid());

CREATE POLICY "Campaign owners can view donations to their campaigns"
  ON donations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns c 
      WHERE c.id = campaign_id 
      AND c.owner_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);
CREATE INDEX idx_campaigns_owner_id ON campaigns(owner_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_category ON campaigns(category);
CREATE INDEX idx_campaigns_slug ON campaigns(slug);
CREATE INDEX idx_products_store_manager_id ON products(store_manager_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX idx_donations_donor_id ON donations(donor_id);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update campaign totals
CREATE OR REPLACE FUNCTION update_campaign_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE campaigns 
    SET 
      current_amount = current_amount + NEW.amount,
      donor_count = (
        SELECT COUNT(DISTINCT COALESCE(donor_id, donor_email))
        FROM donations 
        WHERE campaign_id = NEW.campaign_id
      )
    WHERE id = NEW.campaign_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE campaigns 
    SET 
      current_amount = current_amount - OLD.amount,
      donor_count = (
        SELECT COUNT(DISTINCT COALESCE(donor_id, donor_email))
        FROM donations 
        WHERE campaign_id = OLD.campaign_id
      )
    WHERE id = OLD.campaign_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaign_totals_trigger
  AFTER INSERT OR DELETE ON donations
  FOR EACH ROW EXECUTE FUNCTION update_campaign_totals();

-- Insert default categories
INSERT INTO categories (name, slug, description, icon, color) VALUES
  ('Medical', 'medical', 'Healthcare and medical treatment campaigns', 'heart', '#ef4444'),
  ('Education', 'education', 'Educational support and scholarship campaigns', 'graduation-cap', '#3b82f6'),
  ('Community', 'community', 'Community development and support campaigns', 'users', '#10b981'),
  ('Mission', 'mission', 'Religious and missionary work campaigns', 'church', '#8b5cf6'),
  ('Emergency', 'emergency', 'Emergency relief and disaster response', 'alert-triangle', '#f59e0b'),
  ('Environment', 'environment', 'Environmental protection and sustainability', 'leaf', '#059669')
ON CONFLICT (slug) DO NOTHING;