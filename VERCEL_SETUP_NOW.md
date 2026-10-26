# 🚀 Vercel Environment Variables Setup

## ✅ Your Correct Supabase Credentials

```
VITE_SUPABASE_URL=https://kxnbsuyvjcjvkhnpqexk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bmJzdXl2amNqdmtobnBxZXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5NzM0NzksImV4cCI6MjEwODU0OTQ3OX0.nPRXnfhNu17SFLz-mDfhHwn7c-DJ9ZF3QgZxkVUJVXs
```

---

## 📝 Step-by-Step Instructions

### Step 1: Go to Vercel Dashboard

1. Open: https://vercel.com
2. Click on your project: **vehicle-accounting-frontend**
3. Click on **Settings** tab (top menu)
4. Click on **Environment Variables** (left sidebar)

### Step 2: Delete Old Variables (If They Exist)

If you see these variables already:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

**Delete them:**
1. Click the ⋯ (three dots) menu on the right of each variable
2. Click **"Delete"**
3. Confirm deletion

### Step 3: Add New Environment Variables

**Add Variable 1:**
1. Click **"Add New"** button
2. **Type:** "Environment Variable" (select from dropdown)
3. **Key:** 
   ```
   VITE_SUPABASE_URL
   ```
4. **Value:**
   ```
   https://kxnbsuyvjcjvkhnpqexk.supabase.co
   ```
5. **Environments:** Check ✅ all three:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
6. Click **"Save"**

**Add Variable 2:**
1. Click **"Add New"** button again
2. **Type:** "Environment Variable"
3. **Key:**
   ```
   VITE_SUPABASE_ANON_KEY
   ```
4. **Value:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4bmJzdXl2amNqdmtobnBxZXhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5NzM0NzksImV4cCI6MjEwODU0OTQ3OX0.nPRXnfhNu17SFLz-mDfhHwn7c-DJ9ZF3QgZxkVUJVXs
   ```
5. **Environments:** Check ✅ all three:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
6. Click **"Save"**

### Step 4: Redeploy Vercel

1. Click on **Deployments** tab (top menu)
2. Find the **latest deployment** (top of the list)
3. Click the ⋯ (three dots) menu on the right
4. Click **"Redeploy"**
5. **IMPORTANT:** ❌ **UNCHECK** "Use existing Build Cache"
6. Click **"Redeploy"** button
7. Wait 1-2 minutes for deployment to complete

### Step 5: Test Your App

1. Open your live site: `https://vehicle-accounting-frontend.vercel.app`
2. Press **Ctrl + Shift + R** (hard refresh to clear browser cache)
3. Login with: `Abrham` / `Abrham123`
4. Try to **save a test month**
5. You should see: ✅ **"Data saved to Supabase cloud database successfully"**

---

## 🔍 Verify It's Working

### In Browser Console (Press F12):

You should see messages like:
```
✅ Loaded X records from Supabase cloud database
✅ Data saved to Supabase cloud database successfully
```

### In Supabase Table Editor:

1. Go to: https://app.supabase.com
2. Click: **Table Editor** (left sidebar)
3. Click: **monthly_history** table
4. You should see your saved data rows

---

## ⚠️ Important Notes

### URL Correction:
Your correct Supabase URL is:
```
https://kxnbsuyvjcjvkhnpqexk.supabase.co
```
(Note: has 'v' in the middle: kxnbsu**y**vjcjvkhnpqexk)

### Key Security:
- ✅ The **anon key** is safe to expose in browser code
- ✅ It's protected by Row Level Security (RLS) policies
- ❌ Never expose the **service_role key**

### Environment Variables:
- Must be prefixed with `VITE_` for Vite apps
- Changes require a full redeploy (no cache) to take effect
- Available in browser via `import.meta.env.VITE_*`

---

## 🎯 Success Checklist

After setup, verify:

- [ ] Two environment variables added to Vercel
- [ ] Both variables set for all 3 environments (Production, Preview, Development)
- [ ] Redeployed without cache
- [ ] App loads without errors
- [ ] Can save data successfully
- [ ] See success message after save
- [ ] Data appears in Supabase Table Editor
- [ ] Data syncs across devices

---

## 🐛 Troubleshooting

### Still Getting Errors?

**Error: "Invalid supabaseUrl"**
- Check URL has no typos
- Must start with `https://`
- Must end with `.supabase.co`

**Error: "Failed to save data"**
- Check environment variables are set correctly
- Verify you redeployed WITHOUT cache
- Check Supabase project is "Active" (not "Paused")

**Error: "Permission denied"**
- Run the SQL schema: `SUPABASE_COMPLETE_SCHEMA.sql`
- Creates RLS policies that allow all operations

### Check Environment Variables Are Applied:

In browser console (F12), run:
```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Key:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

Should show:
```
URL: https://kxnbsuyvjcjvkhnpqexk.supabase.co
Has Key: true
```

If shows `undefined`, the environment variables didn't apply. Redeploy again without cache.

---

## 📞 Next Steps

1. **Add environment variables to Vercel** (Steps 1-3)
2. **Redeploy without cache** (Step 4)
3. **Test the app** (Step 5)
4. **Verify success** (Check console & Supabase)

Everything should work after this! 🎉

---

**Created:** October 26, 2026
**Status:** Ready to implement
**Estimated Time:** 5 minutes
