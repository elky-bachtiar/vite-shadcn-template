-- Fix foreign key relationship to auth.users using specially granted permissions
-- This avoids directly creating tables in the auth schema

-- Create a function to verify user existence without direct access
CREATE OR REPLACE FUNCTION check_user_exists(user_id uuid) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM auth.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user_profiles table to use the check function
ALTER TABLE IF EXISTS user_profiles 
  DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey,
  ADD CONSTRAINT user_profiles_user_id_check 
  CHECK (check_user_exists(user_id));

-- Update user_roles table to use the check function  
ALTER TABLE IF EXISTS user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey,
  ADD CONSTRAINT user_roles_user_id_check
  CHECK (check_user_exists(user_id));

-- Update user_roles assigned_by to use the check function
ALTER TABLE IF EXISTS user_roles
  DROP CONSTRAINT IF EXISTS user_roles_assigned_by_fkey,
  ADD CONSTRAINT user_roles_assigned_by_check
  CHECK (assigned_by IS NULL OR check_user_exists(assigned_by));

-- Update campaigns table to use the check function
ALTER TABLE IF EXISTS campaigns
  DROP CONSTRAINT IF EXISTS campaigns_owner_id_fkey,
  ADD CONSTRAINT campaigns_owner_id_check
  CHECK (check_user_exists(owner_id));
