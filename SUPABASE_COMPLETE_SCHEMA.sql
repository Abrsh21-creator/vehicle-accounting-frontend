-- ============================================================================
-- VEHICLE ACCOUNTING - COMPLETE SUPABASE DATABASE SCHEMA
-- ============================================================================
-- This script creates all required tables with full public access policies
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DROP EXISTING TABLES (if you need a fresh start)
-- ============================================================================
-- Uncomment these lines if you want to recreate tables from scratch
-- DROP TABLE IF EXISTS monthly_history CASCADE;
-- DROP TABLE IF EXISTS recycle_bin CASCADE;
-- DROP TABLE IF EXISTS cycle_archives CASCADE;

-- ============================================================================
-- TABLE 1: monthly_history
-- Stores all monthly financial records
-- ============================================================================
CREATE TABLE IF NOT EXISTS monthly_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  month TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  inputs JSONB NOT NULL,
  results JSONB NOT NULL,
  comment TEXT DEFAULT '',
  commented_at TIMESTAMP WITH TIME ZONE,
  commented_by TEXT,
  last_edited_at TIMESTAMP WITH TIME ZONE,
  last_edited_by TEXT,
  edit_reason TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_monthly_history_user_id ON monthly_history(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_history_month ON monthly_history(month);
CREATE INDEX IF NOT EXISTS idx_monthly_history_order ON monthly_history(order_index);
CREATE INDEX IF NOT EXISTS idx_monthly_history_date ON monthly_history(date);

-- Enable Row Level Security
ALTER TABLE monthly_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all operations on monthly_history" ON monthly_history;
DROP POLICY IF EXISTS "Enable read access for all users" ON monthly_history;
DROP POLICY IF EXISTS "Enable insert for all users" ON monthly_history;
DROP POLICY IF EXISTS "Enable update for all users" ON monthly_history;
DROP POLICY IF EXISTS "Enable delete for all users" ON monthly_history;

-- Create permissive policy for ALL operations (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Allow all operations on monthly_history"
  ON monthly_history
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- TABLE 2: recycle_bin
-- Stores deleted records with 3-day grace period
-- ============================================================================
CREATE TABLE IF NOT EXISTS recycle_bin (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  month TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  inputs JSONB NOT NULL,
  results JSONB NOT NULL,
  comment TEXT DEFAULT '',
  deleted_at BIGINT NOT NULL,
  deletion_reason TEXT NOT NULL,
  deleted_by TEXT NOT NULL,
  deletion_type TEXT DEFAULT 'MANUAL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recycle_bin_user_id ON recycle_bin(user_id);
CREATE INDEX IF NOT EXISTS idx_recycle_bin_deleted_at ON recycle_bin(deleted_at);

-- Enable Row Level Security
ALTER TABLE recycle_bin ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on recycle_bin" ON recycle_bin;
DROP POLICY IF EXISTS "Enable read access for all users" ON recycle_bin;
DROP POLICY IF EXISTS "Enable insert for all users" ON recycle_bin;
DROP POLICY IF EXISTS "Enable update for all users" ON recycle_bin;
DROP POLICY IF EXISTS "Enable delete for all users" ON recycle_bin;

-- Create permissive policy
CREATE POLICY "Allow all operations on recycle_bin"
  ON recycle_bin
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- TABLE 3: cycle_archives
-- Stores archived cycles when "New Period" is started
-- ============================================================================
CREATE TABLE IF NOT EXISTS cycle_archives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE NOT NULL,
  archived_by TEXT NOT NULL,
  reason TEXT NOT NULL,
  cycle_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cycle_archives_user_id ON cycle_archives(user_id);
CREATE INDEX IF NOT EXISTS idx_cycle_archives_archived_at ON cycle_archives(archived_at);

-- Enable Row Level Security
ALTER TABLE cycle_archives ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all operations on cycle_archives" ON cycle_archives;
DROP POLICY IF EXISTS "Enable read access for all users" ON cycle_archives;
DROP POLICY IF EXISTS "Enable insert for all users" ON cycle_archives;
DROP POLICY IF EXISTS "Enable update for all users" ON cycle_archives;
DROP POLICY IF EXISTS "Enable delete for all users" ON cycle_archives;

-- Create permissive policy
CREATE POLICY "Allow all operations on cycle_archives"
  ON cycle_archives
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- OPTIONAL: Automatic cleanup function for old recycle bin items
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_recycle_bin()
RETURNS void AS $$
DECLARE
  three_days_ago BIGINT;
BEGIN
  -- Calculate timestamp for 3 days ago (in milliseconds)
  three_days_ago := EXTRACT(EPOCH FROM (NOW() - INTERVAL '3 days')) * 1000;
  
  -- Delete records older than 3 days
  DELETE FROM recycle_bin WHERE deleted_at < three_days_ago;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify tables were created successfully

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('monthly_history', 'recycle_bin', 'cycle_archives');

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('monthly_history', 'recycle_bin', 'cycle_archives');

-- Check indexes
SELECT tablename, indexname
FROM pg_indexes
WHERE tablename IN ('monthly_history', 'recycle_bin', 'cycle_archives');

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '  - monthly_history (with indexes and RLS policies)';
  RAISE NOTICE '  - recycle_bin (with indexes and RLS policies)';
  RAISE NOTICE '  - cycle_archives (with indexes and RLS policies)';
  RAISE NOTICE '';
  RAISE NOTICE 'Row Level Security: ENABLED with full public access';
  RAISE NOTICE 'Anonymous users: CAN read, insert, update, delete';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Check "Table Editor" to see your tables';
  RAISE NOTICE '2. Test insert: INSERT INTO monthly_history (user_id, month, date, inputs, results, order_index) VALUES (''test'', ''Test Month'', NOW(), ''{}''::jsonb, ''{}''::jsonb, 0);';
  RAISE NOTICE '3. Deploy your app to Vercel and test!';
END $$;
