# 🚀 Supabase Database Setup Guide

## Overview

This guide will help you set up Supabase as the cloud database for your Vehicle Accounting Application, replacing localStorage with a proper cloud database that syncs across all devices.

---

## ✅ Benefits of Supabase

- **Real-time sync** across PC and mobile devices
- **Data persistence** - never lose data due to browser cache clearing
- **Backup and recovery** - automatic backups
- **Scalability** - handles multiple users easily
- **Security** - built-in authentication and row-level security
- **Free tier** - 500MB database, 2GB bandwidth/month

---

## 📋 Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up with GitHub, Google, or Email
4. Verify your email

---

## 📋 Step 2: Create New Project

1. Click **"New Project"** button
2. Fill in the project details:
   - **Name**: `vehicle-accounting` (or any name you prefer)
   - **Database Password**: Create a strong password (save it somewhere safe!)
   - **Region**: Choose closest to Ethiopia (e.g., `eu-central-1` for Europe)
   - **Pricing Plan**: Select **Free** tier
3. Click **"Create new project"**
4. Wait 2-3 minutes for project to initialize

---

## 📋 Step 3: Get API Credentials

1. In your Supabase project dashboard, click **Settings** (⚙️ icon in sidebar)
2. Click **API** in the settings menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)
4. **Copy both values** - you'll need them in the next step

---

## 📋 Step 4: Create Database Tables

1. In your Supabase dashboard, click **SQL Editor** in the sidebar
2. Click **"New Query"**
3. Copy and paste the following SQL:

```sql
-- ============================================================================
-- VEHICLE ACCOUNTING DATABASE SCHEMA
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: Monthly History
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

-- Create index for faster queries
CREATE INDEX idx_monthly_history_user_id ON monthly_history(user_id);
CREATE INDEX idx_monthly_history_month ON monthly_history(month);
CREATE INDEX idx_monthly_history_order ON monthly_history(order_index);

-- ============================================================================
-- TABLE 2: Recycle Bin
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

-- Create index for faster queries
CREATE INDEX idx_recycle_bin_user_id ON recycle_bin(user_id);
CREATE INDEX idx_recycle_bin_deleted_at ON recycle_bin(deleted_at);

-- ============================================================================
-- TABLE 3: Cycle Archives
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

-- Create index for faster queries
CREATE INDEX idx_cycle_archives_user_id ON cycle_archives(user_id);
CREATE INDEX idx_cycle_archives_archived_at ON cycle_archives(archived_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS on all tables
ALTER TABLE monthly_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycle_bin ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_archives ENABLE ROW LEVEL SECURITY;

-- Policies for public access (since we're using simple auth)
-- In production, you'd want to implement proper authentication

-- Monthly History Policies
CREATE POLICY "Allow all operations on monthly_history"
  ON monthly_history
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Recycle Bin Policies
CREATE POLICY "Allow all operations on recycle_bin"
  ON recycle_bin
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Cycle Archives Policies
CREATE POLICY "Allow all operations on cycle_archives"
  ON cycle_archives
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- AUTOMATIC CLEANUP FUNCTION (Delete expired recycle bin items after 3 days)
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
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database tables created successfully!';
  RAISE NOTICE 'Tables: monthly_history, recycle_bin, cycle_archives';
  RAISE NOTICE 'Indexes and RLS policies enabled.';
END $$;
```

4. Click **"Run"** button (or press `Ctrl+Enter`)
5. You should see success messages: "Success. No rows returned"

---

## 📋 Step 5: Configure Your App

1. In your project folder, create/update `.env` file:

```bash
# Copy the example file
cp .env.example .env
```

2. Open `.env` file and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Mi...
```

3. **Replace the placeholder values** with your actual credentials from Step 3

---

## 📋 Step 6: Deploy to Vercel (Update Environment Variables)

1. Go to [vercel.com](https://vercel.com) and open your project
2. Click **Settings** → **Environment Variables**
3. Add these two variables:
   - **Name**: `VITE_SUPABASE_URL` | **Value**: Your Supabase URL
   - **Name**: `VITE_SUPABASE_ANON_KEY` | **Value**: Your Supabase anon key
4. Click **Save**
5. Go to **Deployments** tab
6. Click ⋯ menu on latest deployment → **Redeploy**

---

## 📋 Step 7: Migrate Existing Data (Optional)

If you have existing data in localStorage:

1. Open your app in the browser
2. Open Developer Console (F12)
3. Run this command:

```javascript
// Check if migration is needed
const hasLocalData = localStorage.getItem('vehicleAccountingHistory');
if (hasLocalData) {
  console.log('Local data found. Migration will happen automatically on next save.');
}
```

The app will automatically migrate your localStorage data to Supabase on the first save operation.

---

## 🔧 How It Works

### Before (localStorage):
- Data stored only in browser
- Clearing cache = losing all data
- Different devices = different data
- No backup

### After (Supabase):
- Data stored in cloud database
- Automatically syncs across all devices
- Access from PC, mobile, tablet
- Automatic backups
- Data persists forever

---

## 📊 Verifying Setup

1. Save a month in your app
2. Check Supabase dashboard → **Table Editor** → **monthly_history**
3. You should see your saved data
4. Open app on different device/browser
5. Data should appear automatically!

---

## 🆘 Troubleshooting

### ❌ "Failed to connect to Supabase"

**Solution:**
1. Check your `.env` file has correct credentials
2. Verify credentials in Supabase dashboard (Settings → API)
3. Restart your dev server: `npm run dev`

### ❌ "Insert failed" or "Permission denied"

**Solution:**
1. Verify RLS policies are enabled (see Step 4)
2. Check SQL Editor for any errors
3. Re-run the table creation SQL

### ❌ "Data not syncing between devices"

**Solution:**
1. Hard refresh on both devices (Ctrl+Shift+R)
2. Check Network tab in DevTools for API calls
3. Verify both devices are using same Supabase URL

### ❌ Environment variables not loading

**Solution:**
1. Make sure `.env` file is in root folder (same level as `package.json`)
2. Variable names must start with `VITE_` for Vite to expose them
3. Restart dev server after changing `.env`

---

## 🔐 Security Notes

- **Never commit `.env` file** to Git (it's in `.gitignore`)
- Store passwords securely (use password manager)
- For production, implement proper authentication
- Consider enabling additional RLS policies for user-specific data

---

## 📞 Support

For Supabase-specific issues:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)

For App-specific issues:
- Check `TASK_6_DEPLOYMENT_SUCCESS.md`
- Review `THREE_NEW_FEATURES_COMPLETE.md`

---

## 🎉 Next Steps

After setup:
1. ✅ Test saving a month
2. ✅ Open app on mobile device
3. ✅ Verify data appears on mobile
4. ✅ Save a month on mobile
5. ✅ Verify data appears on PC

**Congratulations! Your app now has cloud database sync!** 🚀

---

**Last Updated:** October 25, 2026  
**Supabase Version:** Latest  
**Compatible With:** React 18, Vite 5
