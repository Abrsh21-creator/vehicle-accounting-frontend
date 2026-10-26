# 🔧 Supabase Troubleshooting Guide

## Error: "Failed to save data to cloud database"

This error occurs when the app cannot connect to Supabase or RLS policies are blocking requests.

---

## ✅ Step-by-Step Fix

### Step 1: Verify Environment Variables in Vercel

1. Go to: https://vercel.com → Your Project → Settings → Environment Variables
2. **Check these TWO variables exist:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

3. **Verify values are correct:**
   - URL should be: `https://xxxxxxxxxxxxx.supabase.co` (starts with `https://`)
   - Key should be: `eyJhbGc...` (very long, starts with `eyJ`)

4. **If missing or wrong:**
   - Delete old variables
   - Add them again with correct values
   - **Redeploy** (important!)

### Step 2: Run Complete SQL Schema in Supabase

1. Go to: https://app.supabase.com → Your Project → SQL Editor
2. Click "+ New query"
3. **Copy the ENTIRE contents of `SUPABASE_COMPLETE_SCHEMA.sql`**
4. Paste into SQL Editor
5. Click "Run" (or Ctrl+Enter)
6. **Should see:**
   ```
   Success. No rows returned
   ✅ Database schema created successfully!
   ```

### Step 3: Verify Tables Were Created

1. Still in Supabase, click "Table Editor" in left sidebar
2. **You should see 3 tables:**
   - `monthly_history`
   - `recycle_bin`
   - `cycle_archives`

3. **Click on `monthly_history` table**
4. You should see columns:
   - id (uuid)
   - user_id (text)
   - month (text)
   - date (timestamptz)
   - inputs (jsonb)
   - results (jsonb)
   - comment (text)
   - order_index (int4)
   - etc.

### Step 4: Test RLS Policies

Run this test query in SQL Editor:

```sql
-- Test insert (should succeed)
INSERT INTO monthly_history (
  user_id, 
  month, 
  date, 
  inputs, 
  results, 
  order_index
) VALUES (
  'test_user',
  'Test Month 2026',
  NOW(),
  '{"grossIncome": 100000}'::jsonb,
  '{"amsalu": {"netPayout": 5000}}'::jsonb,
  0
);

-- Test select (should return the row)
SELECT * FROM monthly_history WHERE user_id = 'test_user';

-- Clean up test data
DELETE FROM monthly_history WHERE user_id = 'test_user';
```

**If this works, RLS policies are correct!**

### Step 5: Check Supabase Project Status

1. Go to: https://app.supabase.com
2. Check if your project shows "Active" status
3. **If "Paused":**
   - Click "Restore project"
   - Wait 1-2 minutes
   - Try again

### Step 6: Verify Network Connection

Open browser DevTools (F12) → Network tab:

1. Open your Vercel app
2. Try to save a month
3. Look for requests to `supabase.co`
4. **Click on the failed request**
5. Check the response:

**Common Errors:**

- **403 Forbidden:** RLS policy blocking request
  - **Fix:** Run Step 2 (SQL schema) again
  
- **404 Not Found:** Table doesn't exist
  - **Fix:** Run Step 2 (SQL schema)
  
- **401 Unauthorized:** Wrong API key
  - **Fix:** Check environment variables (Step 1)
  
- **Network Error:** Can't reach Supabase
  - **Fix:** Check internet connection, Supabase project status

### Step 7: Redeploy Vercel (Force Fresh Build)

1. Go to: Vercel → Deployments
2. Click ⋯ on latest deployment
3. Click "Redeploy"
4. **UNCHECK** "Use existing Build Cache"
5. Click "Redeploy"
6. Wait 1-2 minutes
7. Test again

---

## 🔍 Additional Debugging

### Enable Verbose Logging

Add this to your `.env` file (local testing):

```env
VITE_SUPABASE_URL=your_url_here
VITE_SUPABASE_ANON_KEY=your_key_here
VITE_DEBUG=true
```

### Check Browser Console

1. Press F12
2. Go to Console tab
3. Look for errors mentioning "Supabase" or "monthly_history"
4. Copy error message and check solutions below

### Common Console Errors

**Error: "relation public.monthly_history does not exist"**
- **Cause:** Table not created
- **Fix:** Run `SUPABASE_COMPLETE_SCHEMA.sql` in SQL Editor

**Error: "new row violates row-level security policy"**
- **Cause:** RLS policy too restrictive
- **Fix:** Run the DROP POLICY commands in schema, then recreate

**Error: "column inputs does not exist"**
- **Cause:** Table schema mismatch
- **Fix:** Drop table and recreate: `DROP TABLE monthly_history CASCADE;` then run schema

---

## 🛡️ RLS Policy Verification

Run this in SQL Editor to check policies:

```sql
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('monthly_history', 'recycle_bin', 'cycle_archives')
ORDER BY tablename, policyname;
```

**Expected Result:**

| tablename | policyname | permissive | roles | cmd |
|-----------|------------|------------|-------|-----|
| monthly_history | Allow all operations on monthly_history | PERMISSIVE | {anon,authenticated} | ALL |
| recycle_bin | Allow all operations on recycle_bin | PERMISSIVE | {anon,authenticated} | ALL |
| cycle_archives | Allow all operations on cycle_archives | PERMISSIVE | {anon,authenticated} | ALL |

If policies are missing or different, run the schema script again.

---

## ⚡ Quick Test

### Test 1: Manual Insert

In Supabase SQL Editor:

```sql
INSERT INTO monthly_history (
  user_id, month, date, inputs, results, order_index
) VALUES (
  'manual_test', 'October 2026', NOW(), 
  '{"grossIncome": 50000}'::jsonb, 
  '{"amsalu": {"netPayout": 1000}}'::jsonb, 
  0
);
```

If this works, Supabase is configured correctly.

### Test 2: App Insert

1. Open your Vercel app
2. Press F12 → Console tab
3. Paste this:

```javascript
const testData = [{
  month: 'Test Month',
  date: new Date().toISOString(),
  inputs: { grossIncome: 10000 },
  results: { amsalu: { netPayout: 500 } },
  comment: 'Test'
}];

// Check if function exists
if (window.saveMonthlyHistory) {
  console.log('Testing Supabase connection...');
} else {
  console.log('App not loaded yet');
}
```

---

## 🔒 Security Notes

The current RLS policies allow **full public access** for simplicity. This is OK for MVP/demo but NOT recommended for production with sensitive data.

### For Production (Future):

1. **Enable Supabase Auth:**
   ```sql
   -- Example: User-specific policy
   CREATE POLICY "Users can only access their own data"
     ON monthly_history
     FOR ALL
     USING (auth.uid()::text = user_id);
   ```

2. **Implement Authentication:**
   - Use Supabase Auth instead of simple username/password
   - Each user gets unique UUID
   - RLS automatically enforces per-user access

---

## 📞 Still Not Working?

### Checklist:

- [ ] Environment variables set in Vercel
- [ ] SQL schema run in Supabase
- [ ] Tables visible in Table Editor
- [ ] Test insert successful
- [ ] Supabase project Active (not Paused)
- [ ] Redeployed Vercel (no cache)
- [ ] Browser cache cleared (Ctrl+Shift+R)

### Get Help:

1. **Check Supabase Logs:**
   - Dashboard → Logs
   - Look for errors

2. **Check Vercel Logs:**
   - Deployments → Latest → View Function Logs
   - Look for build errors

3. **Supabase Discord:**
   - https://discord.supabase.com
   - #help channel

---

## ✅ Success Indicators

When everything works:

**Browser Console:**
```
✅ Loaded X records from Supabase cloud database
✅ Data saved to Supabase cloud database successfully
```

**Supabase Table Editor:**
- See rows in `monthly_history` table
- Data matches what you saved in app

**App:**
- Save month → Success message
- Refresh page → Data still there
- Open on phone → Same data appears

---

Last Updated: October 25, 2026
