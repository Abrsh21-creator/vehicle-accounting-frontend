# ⚠️ PRODUCTION SETUP REQUIRED - Supabase Configuration

## 🚨 CRITICAL: App Requires Supabase to Function

This application **REQUIRES** Supabase cloud database to work in production. Without it:
- ❌ Data will NOT save
- ❌ Users will see error messages
- ❌ Multi-device sync will NOT work

---

## ⚡ Quick 5-Minute Setup

### Step 1: Create Supabase Account (1 minute)
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or Email
4. Create a new organization (any name)

### Step 2: Create Project (1 minute)
1. Click "New Project"
2. **Project Name:** `vehicle-accounting`
3. **Database Password:** Create a STRONG password and SAVE IT
4. **Region:** Choose closest to Ethiopia (e.g., `eu-central-1`)
5. **Plan:** FREE (sufficient for this app)
6. Click "Create new project"
7. **Wait 2 minutes** for project to initialize

### Step 3: Create Database Tables (1 minute)
1. Click "SQL Editor" in sidebar
2. Click "+ New query"
3. **Copy this SQL:**

```sql
-- Vehicle Accounting Database Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Monthly History Table
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

CREATE INDEX idx_monthly_history_user_id ON monthly_history(user_id);
CREATE INDEX idx_monthly_history_month ON monthly_history(month);

-- Enable Row Level Security
ALTER TABLE monthly_history ENABLE ROW LEVEL SECURITY;

-- Allow all operations (simple auth)
CREATE POLICY "Allow all operations on monthly_history"
  ON monthly_history FOR ALL USING (true) WITH CHECK (true);

-- Recycle Bin Table
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

CREATE INDEX idx_recycle_bin_user_id ON recycle_bin(user_id);

ALTER TABLE recycle_bin ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on recycle_bin"
  ON recycle_bin FOR ALL USING (true) WITH CHECK (true);

-- Cycle Archives Table
CREATE TABLE IF NOT EXISTS cycle_archives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE NOT NULL,
  archived_by TEXT NOT NULL,
  reason TEXT NOT NULL,
  cycle_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cycle_archives_user_id ON cycle_archives(user_id);

ALTER TABLE cycle_archives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on cycle_archives"
  ON cycle_archives FOR ALL USING (true) WITH CHECK (true);
```

4. Click **"Run"** (or press Ctrl+Enter)
5. Should see: "Success. No rows returned"

### Step 4: Get API Credentials (30 seconds)
1. Click **"Settings"** ⚙️ (bottom left)
2. Click **"API"**
3. You'll see two values - **COPY BOTH:**
   - **Project URL:** `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (very long)

### Step 5: Configure Vercel (2 minutes)
1. Go to https://vercel.com
2. Open your project: **vehicle-accounting-frontend**
3. Click **Settings** tab
4. Click **Environment Variables**
5. Add FIRST variable:
   - **Name:** `VITE_SUPABASE_URL`
   - **Value:** [Paste your Supabase URL]
   - Click **"Add"**
6. Add SECOND variable:
   - **Name:** `VITE_SUPABASE_ANON_KEY`
   - **Value:** [Paste your Supabase anon key]
   - Click **"Add"**
7. Go to **Deployments** tab
8. Click ⋯ (three dots) on latest deployment
9. Click **"Redeploy"**
10. **UNCHECK** "Use existing Build Cache"
11. Click **"Redeploy"**

### Step 6: Test (1 minute)
1. Wait 1-2 minutes for deployment
2. Open your Vercel URL: `https://vehicle-accounting-frontend.vercel.app`
3. Login as Admin: `Abrham` / `Abrham123`
4. Save a test month
5. Open browser console (F12)
6. Should see: **"✅ Data saved to Supabase cloud database successfully"**
7. Open app on phone - **same data should appear!** 🎉

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Open Supabase dashboard → Table Editor → monthly_history
- [ ] You should see your saved data
- [ ] Open app on PC - data visible
- [ ] Open app on mobile - same data visible
- [ ] Save a month on mobile - appears on PC immediately
- [ ] Browser console shows: "✅ Data saved to Supabase cloud database successfully"

---

## 🐛 Troubleshooting

### Problem: "Database not configured" error
**Solution:**
1. Check Vercel environment variables exist
2. Variable names MUST be exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Redeploy with cache disabled

### Problem: Data not syncing between devices
**Solution:**
1. Hard refresh both devices: Ctrl+Shift+R
2. Check browser console for errors
3. Verify internet connection on both devices

### Problem: "Failed to save to Supabase" error
**Solution:**
1. Check Supabase project is not paused (free tier pauses after inactivity)
2. Go to Supabase dashboard → check project status
3. Verify SQL tables were created (Table Editor should show 3 tables)

---

## 📊 Free Tier Limits (More Than Enough)

Supabase free tier includes:
- ✅ 500 MB database storage
- ✅ 2 GB bandwidth per month
- ✅ Unlimited API requests
- ✅ Unlimited users

This is sufficient for:
- ~50,000+ monthly records
- ~100 concurrent users
- Years of vehicle accounting data

---

## 🔐 Security Notes

- ✅ All data encrypted in transit (HTTPS)
- ✅ Row Level Security enabled
- ✅ API keys are public-safe (anon key)
- ✅ No credit card required for free tier

---

## 📞 Need Help?

1. **Supabase Docs:** https://supabase.com/docs
2. **Supabase Discord:** https://discord.supabase.com
3. **Setup Guide:** See `SUPABASE_SETUP_GUIDE.md` for detailed instructions

---

**IMPORTANT:** Without completing this setup, the app will show error messages and data will NOT persist across devices!

**Setup Time:** 5-7 minutes total
**Difficulty:** Easy ⭐⭐☆☆☆
**Cost:** FREE forever

---

Last Updated: October 25, 2026
