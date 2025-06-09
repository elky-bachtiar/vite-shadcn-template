-- This migration adds helper functions to safely access the auth schema
-- for counting users and other operations that tests need

-- Function to count users in the auth schema
CREATE OR REPLACE FUNCTION public.get_auth_users_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_count integer;
BEGIN
  SELECT COUNT(*) INTO user_count FROM auth.users;
  RETURN user_count;
END;
$$;

-- Function to check if required roles exist
CREATE OR REPLACE FUNCTION public.check_roles_exist()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  anon_exists boolean;
  authenticated_exists boolean;
  service_role_exists boolean;
BEGIN
  -- Check for required roles
  SELECT EXISTS(
    SELECT 1 FROM pg_roles WHERE rolname = 'anon'
  ) INTO anon_exists;
  
  SELECT EXISTS(
    SELECT 1 FROM pg_roles WHERE rolname = 'authenticated'
  ) INTO authenticated_exists;
  
  SELECT EXISTS(
    SELECT 1 FROM pg_roles WHERE rolname = 'service_role'
  ) INTO service_role_exists;
  
  RETURN anon_exists AND authenticated_exists AND service_role_exists;
END;
$$;

-- Function to check if a user exists by email
CREATE OR REPLACE FUNCTION public.check_user_exists_by_email(user_email TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exists boolean;
  found_user_id uuid;
  result json;
BEGIN
  -- Check if user exists
  SELECT EXISTS(
    SELECT 1 FROM auth.users WHERE email = user_email
  ) INTO user_exists;
  
  -- Get the user id if exists
  IF user_exists THEN
    SELECT id INTO found_user_id 
    FROM auth.users 
    WHERE email = user_email
    LIMIT 1;
  END IF;
  
  -- Return result as json
  SELECT json_build_object(
    'exists', user_exists,
    'user_id', found_user_id::text
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Grant execute permission to the anon and other roles
GRANT EXECUTE ON FUNCTION public.get_auth_users_count() TO anon;
GRANT EXECUTE ON FUNCTION public.get_auth_users_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_auth_users_count() TO service_role;

GRANT EXECUTE ON FUNCTION public.check_roles_exist() TO anon;
GRANT EXECUTE ON FUNCTION public.check_roles_exist() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_roles_exist() TO service_role;

GRANT EXECUTE ON FUNCTION public.check_user_exists_by_email(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.check_user_exists_by_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_exists_by_email(TEXT) TO service_role;
