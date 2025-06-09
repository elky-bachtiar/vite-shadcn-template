-- Ensure the authenticated role exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated'
  ) THEN
    CREATE ROLE authenticated;
  END IF;
END
$$;

-- Ensure the service_role role exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_catalog.pg_roles WHERE rolname = 'service_role'
  ) THEN
    CREATE ROLE service_role;
  END IF;
END
$$;

-- Add a comment explaining the purpose of this migration
COMMENT ON DATABASE postgres IS 'This migration ensures roles exist before other migrations reference them';
