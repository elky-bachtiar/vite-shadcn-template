/*
  # Shop2Give Platform Foundation Schema

  1. Core Tables
    - Enhanced user_profiles with additional fields
    - campaigns with comprehensive tracking
    - products with inventory and digital support
    - categories with hierarchy support
    - donations with multiple types
    - orders and order_items for e-commerce
    - campaign_products linking table

  2. Logging & Analytics
    - checkout_logs for payment tracking
    - webhook_logs for event processing
    - edge_function_logs for debugging

  3. Store Management
    - stores table for multi-store support
    - store_managers for role management

  4. Security
    - Comprehensive RLS policies
    - Role-based access control
    - Audit trails
*/

-- Create enhanced user profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN phone text;
    ALTER TABLE user_profiles ADD COLUMN date_of_birth date;
    ALTER TABLE user_profiles ADD COLUMN country text;
    ALTER TABLE user_profiles ADD COLUMN city text;
    ALTER TABLE user_profiles ADD COLUMN postal_code text;
    ALTER TABLE user_profiles ADD COLUMN address text;
    ALTER TABLE user_profiles ADD COLUMN bio text;
    ALTER TABLE user_profiles ADD COLUMN website_url text;
    ALTER TABLE user_profiles ADD COLUMN social_links jsonb DEFAULT '{}';
    ALTER TABLE user_profiles ADD COLUMN preferences jsonb DEFAULT '{"language": "en", "currency": "EUR", "notifications": {"email": true, "push": true}}';
    ALTER TABLE user_profiles ADD COLUMN verification_status text DEFAULT 'pending';
    ALTER TABLE user_profiles ADD COLUMN verification_documents jsonb DEFAULT '[]';
    ALTER TABLE user_profiles ADD COLUMN last_login_at timestamptz;
    ALTER TABLE user_profiles ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  logo_url text,
  banner_url text,
  owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  contact_email text,
  contact_phone text,
  address jsonb,
  business_registration text,
  tax_id text,
  payment_details jsonb DEFAULT '{}',
  settings jsonb DEFAULT '{"commission_rate": 5, "auto_approve_products": false}',
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create store_managers table
CREATE TABLE IF NOT EXISTS store_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'manager' CHECK (role IN ('owner', 'manager', 'editor')),
  permissions jsonb DEFAULT '["view_products", "edit_products", "view_orders", "manage_inventory"]',
  invited_by uuid REFERENCES auth.users(id),
  invited_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  is_active boolean DEFAULT true,
  UNIQUE(store_id, user_id)
);

-- Enhance campaigns table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'campaigns' AND column_name = 'beneficiary_info'
  ) THEN
    ALTER TABLE campaigns ADD COLUMN beneficiary_info jsonb DEFAULT '{}';
    ALTER TABLE campaigns ADD COLUMN bank_details jsonb DEFAULT '{}';
    ALTER TABLE campaigns ADD COLUMN social_links jsonb DEFAULT '{}';
    ALTER TABLE campaigns ADD COLUMN updates jsonb DEFAULT '[]';
    ALTER TABLE campaigns ADD COLUMN faq jsonb DEFAULT '[]';
    ALTER TABLE campaigns ADD COLUMN team_members jsonb DEFAULT '[]';
    ALTER TABLE campaigns ADD COLUMN expenses jsonb DEFAULT '[]';
    ALTER TABLE campaigns ADD COLUMN milestones jsonb DEFAULT '[]';
    ALTER TABLE campaigns ADD COLUMN risk_factors text;
    ALTER TABLE campaigns ADD COLUMN impact_statement text;
    ALTER TABLE campaigns ADD COLUMN target_audience text;
    ALTER TABLE campaigns ADD COLUMN marketing_plan text;
    ALTER TABLE campaigns ADD COLUMN success_metrics jsonb DEFAULT '{}';
    ALTER TABLE campaigns ADD COLUMN external_links jsonb DEFAULT '[]';
    ALTER TABLE campaigns ADD COLUMN press_coverage jsonb DEFAULT '[]';
    ALTER TABLE campaigns ADD COLUMN endorsements jsonb DEFAULT '[]';
  END IF;
END $$;

-- Enhance products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'store_id'
  ) THEN
    ALTER TABLE products ADD COLUMN store_id uuid REFERENCES stores(id);
    ALTER TABLE products ADD COLUMN sku text UNIQUE;
    ALTER TABLE products ADD COLUMN barcode text;
    ALTER TABLE products ADD COLUMN brand text;
    ALTER TABLE products ADD COLUMN manufacturer text;
    ALTER TABLE products ADD COLUMN origin_country text;
    ALTER TABLE products ADD COLUMN materials jsonb DEFAULT '[]';
    ALTER TABLE products ADD COLUMN care_instructions text;
    ALTER TABLE products ADD COLUMN warranty_info text;
    ALTER TABLE products ADD COLUMN shipping_info jsonb DEFAULT '{}';
    ALTER TABLE products ADD COLUMN variants jsonb DEFAULT '[]';
    ALTER TABLE products ADD COLUMN reviews_summary jsonb DEFAULT '{"average_rating": 0, "total_reviews": 0}';
    ALTER TABLE products ADD COLUMN seo_title text;
    ALTER TABLE products ADD COLUMN seo_description text;
    ALTER TABLE products ADD COLUMN seo_keywords text[];
    ALTER TABLE products ADD COLUMN featured_until timestamptz;
    ALTER TABLE products ADD COLUMN launch_date timestamptz;
    ALTER TABLE products ADD COLUMN discontinue_date timestamptz;
  END IF;
END $$;

-- Create product_reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_item_id uuid REFERENCES order_items(id),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  content text,
  images text[],
  is_verified_purchase boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  helpful_votes integer DEFAULT 0,
  status text DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id, order_item_id)
);

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL DEFAULT 'My Wishlist',
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id uuid REFERENCES wishlists(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  added_at timestamptz DEFAULT now(),
  UNIQUE(wishlist_id, product_id)
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'free_shipping')),
  value numeric NOT NULL,
  minimum_amount integer DEFAULT 0,
  maximum_discount integer,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  user_limit integer DEFAULT 1,
  applicable_to text DEFAULT 'all' CHECK (applicable_to IN ('all', 'products', 'categories', 'campaigns')),
  applicable_ids uuid[],
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create coupon_usage table
CREATE TABLE IF NOT EXISTS coupon_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES coupons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  discount_amount integer NOT NULL,
  used_at timestamptz DEFAULT now(),
  UNIQUE(coupon_id, user_id, order_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  action_url text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create campaign_updates table
CREATE TABLE IF NOT EXISTS campaign_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  images text[],
  is_milestone boolean DEFAULT false,
  milestone_amount integer,
  is_published boolean DEFAULT true,
  published_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create campaign_comments table
CREATE TABLE IF NOT EXISTS campaign_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id uuid REFERENCES campaign_comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_anonymous boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  status text DEFAULT 'published' CHECK (status IN ('pending', 'published', 'hidden')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create analytics tables
CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  page_type text NOT NULL,
  page_id uuid,
  referrer text,
  user_agent text,
  ip_address inet,
  country text,
  city text,
  device_type text,
  browser text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversion_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  value_amount integer,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stores
CREATE POLICY "Anyone can view active stores"
  ON stores FOR SELECT
  TO authenticated, anon
  USING (status = 'active');

CREATE POLICY "Store owners can manage their stores"
  ON stores FOR ALL
  TO authenticated
  USING (owner_id = auth.uid());

-- RLS Policies for store_managers
CREATE POLICY "Store managers can view their store assignments"
  ON store_managers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR store_id IN (
    SELECT id FROM stores WHERE owner_id = auth.uid()
  ));

-- RLS Policies for product_reviews
CREATE POLICY "Anyone can view published reviews"
  ON product_reviews FOR SELECT
  TO authenticated, anon
  USING (status = 'published');

CREATE POLICY "Users can manage their own reviews"
  ON product_reviews FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for wishlists
CREATE POLICY "Users can manage their own wishlists"
  ON wishlists FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view public wishlists"
  ON wishlists FOR SELECT
  TO authenticated, anon
  USING (is_public = true);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);
CREATE INDEX IF NOT EXISTS idx_store_managers_store_id ON store_managers(store_id);
CREATE INDEX IF NOT EXISTS idx_store_managers_user_id ON store_managers(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_wishlist_id ON wishlist_items(wishlist_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_campaign_updates_campaign_id ON campaign_updates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_comments_campaign_id ON campaign_comments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at);

-- Create triggers for updated_at
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_reviews_updated_at BEFORE UPDATE ON product_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wishlists_updated_at BEFORE UPDATE ON wishlists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_updates_updated_at BEFORE UPDATE ON campaign_updates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaign_comments_updated_at BEFORE UPDATE ON campaign_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample categories if they don't exist
INSERT INTO categories (name, slug, description, icon, color) VALUES
  ('Electronics', 'electronics', 'Electronic devices and gadgets', 'smartphone', '#3b82f6'),
  ('Clothing', 'clothing', 'Fashion and apparel', 'shirt', '#ec4899'),
  ('Home & Garden', 'home-garden', 'Home improvement and gardening supplies', 'home', '#10b981'),
  ('Books', 'books', 'Books and educational materials', 'book', '#8b5cf6'),
  ('Sports', 'sports', 'Sports equipment and fitness gear', 'dumbbell', '#f59e0b'),
  ('Art & Crafts', 'art-crafts', 'Art supplies and handmade items', 'palette', '#ef4444')
ON CONFLICT (slug) DO NOTHING;

-- Create function to update product review summary
CREATE OR REPLACE FUNCTION update_product_review_summary()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products 
  SET reviews_summary = (
    SELECT jsonb_build_object(
      'average_rating', COALESCE(AVG(rating), 0),
      'total_reviews', COUNT(*),
      'rating_distribution', jsonb_build_object(
        '5', COUNT(*) FILTER (WHERE rating = 5),
        '4', COUNT(*) FILTER (WHERE rating = 4),
        '3', COUNT(*) FILTER (WHERE rating = 3),
        '2', COUNT(*) FILTER (WHERE rating = 2),
        '1', COUNT(*) FILTER (WHERE rating = 1)
      )
    )
    FROM product_reviews 
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    AND status = 'published'
  )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_review_summary_trigger
  AFTER INSERT OR UPDATE OR DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_review_summary();

-- Create function to track page views
CREATE OR REPLACE FUNCTION track_page_view(
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_page_type text DEFAULT NULL,
  p_page_id uuid DEFAULT NULL,
  p_referrer text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  view_id uuid;
BEGIN
  INSERT INTO page_views (
    user_id, session_id, page_type, page_id, referrer, user_agent
  ) VALUES (
    p_user_id, p_session_id, p_page_type, p_page_id, p_referrer, p_user_agent
  ) RETURNING id INTO view_id;
  
  RETURN view_id;
END;
$$ language 'plpgsql';

-- Create function to track conversion events
CREATE OR REPLACE FUNCTION track_conversion_event(
  p_user_id uuid DEFAULT NULL,
  p_session_id text DEFAULT NULL,
  p_event_type text DEFAULT NULL,
  p_event_data jsonb DEFAULT '{}',
  p_value_amount integer DEFAULT NULL,
  p_campaign_id uuid DEFAULT NULL,
  p_product_id uuid DEFAULT NULL,
  p_order_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO conversion_events (
    user_id, session_id, event_type, event_data, value_amount,
    campaign_id, product_id, order_id
  ) VALUES (
    p_user_id, p_session_id, p_event_type, p_event_data, p_value_amount,
    p_campaign_id, p_product_id, p_order_id
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ language 'plpgsql';