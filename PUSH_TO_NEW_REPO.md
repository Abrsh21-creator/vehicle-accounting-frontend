# Push Frontend to New GitHub Repository

## Step 1: Create New Repository on GitHub

1. Go to: https://github.com/new
2. **Repository name:** `vehicle-accounting-frontend`
3. **Description:** "React Dashboard for Vehicle Accounting System"
4. **Public** repository
5. **DO NOT check:** "Initialize with README"
6. Click **"Create repository"**

## Step 2: Push Code to New Repository

Open PowerShell in this directory and run:

```powershell
# Add new remote (use YOUR repository URL)
git remote add origin https://github.com/Abrsh21-creator/vehicle-accounting-frontend.git

# Push code
git push -u origin main
```

## Step 3: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Find and import: `vehicle-accounting-frontend`
4. Configure:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `./`
5. Add Environment Variable:
   - Name: `VITE_API_URL`
   - Value: `https://vehicle-accounting.onrender.com/api`
6. Click **Deploy**

## Done! ✅

Your frontend will be deployed at: `https://vehicle-accounting-frontend.vercel.app`
