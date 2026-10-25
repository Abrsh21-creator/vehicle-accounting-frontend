# ⚡ COMMANDS QUICK REFERENCE

**All commands you need to work with the Vehicle Accounting Dashboard**

---

## 🚀 GETTING STARTED

### Initial Setup (First Time Only)
```bash
cd C:\Users\p\Desktop\car\vehicle-accounting-dashboard
npm install
```

### Start Development Server
```bash
npm run dev
```
**Opens:** http://localhost:5173

### Build for Production
```bash
npm run build
```
**Output:** `dist/` folder

### Preview Production Build
```bash
npm run preview
```
**Opens:** http://localhost:4173

---

## 🔑 LOGIN CREDENTIALS

### Admin (Full Access)
```
Username: admin
Password: admin123
```

### Shareholders (Read-Only)
```
Username: kesyeshalem    Password: kes123
Username: smeneh         Password: smeneh123
Username: amsalu         Password: amsalu123
```

---

## 🧪 TESTING COMMANDS

### Check Build Status
```bash
npm run build
```
**Expected:** `✓ built in XX.XXs` with 0 errors

### Verify File Structure
```bash
dir src
```
**Expected Files:**
- App.jsx
- main.jsx
- AuthContext.jsx
- LoginPage.jsx
- AuditLog.js
- Modals.jsx
- index.css

### Check Dependencies
```bash
npm list
```

### Check for Updates
```bash
npm outdated
```

---

## 🔍 DEBUGGING COMMANDS

### View localStorage Data (Browser Console)

#### View Audit Logs
```javascript
JSON.parse(localStorage.getItem('auditLogs'))
```

#### View History
```javascript
JSON.parse(localStorage.getItem('vehicleAccountingHistory'))
```

#### View Pending Deletions
```javascript
JSON.parse(localStorage.getItem('pendingDeletions'))
```

#### View Current User
```javascript
JSON.parse(localStorage.getItem('currentUser'))
```

#### Clear All Data (Reset)
```javascript
localStorage.clear();
location.reload();
```

### Check localStorage Size
```javascript
let size = 0;
for (let key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    size += localStorage[key].length;
  }
}
console.log(`Storage used: ${(size / 1024).toFixed(2)} KB`);
```

---

## 📦 DEPLOYMENT COMMANDS

### Deploy to Vercel
```bash
# Install Vercel CLI (one time)
npm install -g vercel

# Build first
npm run build

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Create GitHub Repository
```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "feat: Complete integration of RBAC, audit logging, and insurance"

# Add remote
git remote add origin https://github.com/Abrsh21-creator/vehicle-accounting-dashboard.git

# Push
git push -u origin main
```

---

## 🛠️ MAINTENANCE COMMANDS

### Update Dependencies
```bash
npm update
```

### Check for Security Issues
```bash
npm audit
```

### Fix Security Issues
```bash
npm audit fix
```

### Clean Install (if issues)
```bash
# Delete node_modules and package-lock.json
rmdir /s /q node_modules
del package-lock.json

# Reinstall
npm install
```

---

## 📊 PERFORMANCE COMMANDS

### Analyze Bundle Size
```bash
npm run build -- --analyze
```

### Check Build Stats
```bash
npm run build
```
**Look for:**
- Total bundle size
- Gzipped size
- Build time

---

## 🧹 CLEANUP COMMANDS

### Delete Build Output
```bash
rmdir /s /q dist
```

### Delete Node Modules
```bash
rmdir /s /q node_modules
```

### Full Clean
```bash
rmdir /s /q node_modules dist
del package-lock.json
```

---

## 🔧 CONFIGURATION FILES

### View Package.json
```bash
type package.json
```

### Edit Environment Variables
```bash
notepad .env
```

**Add:**
```
VITE_API_URL=https://vehicle-accounting.onrender.com/api
```

### View Vite Config
```bash
type vite.config.js
```

### View Tailwind Config
```bash
type tailwind.config.js
```

---

## 📝 FILE OPERATIONS

### List All Source Files
```bash
dir /s /b src\*.jsx src\*.js
```

### Count Lines of Code
```bash
# PowerShell
(Get-Content src\App.jsx).Count
```

### Search for Text in Files
```bash
# Find all files with "insurance"
findstr /s /i "insurance" src\*.jsx
```

### Create Backup
```bash
# Backup entire project
xcopy /E /I /Y . ..\vehicle-accounting-dashboard-backup
```

---

## 🌐 BROWSER COMMANDS (DevTools)

### Open DevTools
```
F12 or Ctrl+Shift+I
```

### Open Console
```
Ctrl+Shift+J
```

### Network Tab
```
Ctrl+Shift+E
```

### Performance Tab
```
Ctrl+Shift+P → "Show Performance"
```

### Responsive Design Mode
```
Ctrl+Shift+M
```

---

## 🐛 TROUBLESHOOTING

### Port Already in Use
```bash
# Find process using port 5173
netstat -ano | findstr :5173

# Kill process (replace PID with actual)
taskkill /PID <PID> /F
```

### Module Not Found
```bash
npm install
```

### Build Errors
```bash
# Clean and rebuild
rmdir /s /q dist node_modules
npm install
npm run build
```

### React DevTools Not Working
```
Install React DevTools browser extension
```

---

## 📚 DOCUMENTATION COMMANDS

### View README
```bash
type README.md
```

### View Integration Status
```bash
type INTEGRATION_COMPLETE.md
```

### View Testing Guide
```bash
type TESTING_GUIDE.md
```

### View All Documentation
```bash
dir *.md
```

---

## 🔐 SECURITY COMMANDS

### Check for Vulnerable Packages
```bash
npm audit
```

### Update Vulnerable Packages
```bash
npm audit fix
```

### Force Update All
```bash
npm audit fix --force
```

---

## 📱 MOBILE TESTING

### Test on Network Devices
```bash
# Start server with host
npm run dev -- --host
```

**Access from phone:**
```
http://<YOUR-IP>:5173
```

### Find Your IP Address
```bash
ipconfig | findstr IPv4
```

---

## 🎯 COMMON WORKFLOWS

### Daily Development
```bash
# 1. Pull latest changes (if using git)
git pull

# 2. Install any new dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Make changes to files

# 5. Test in browser at localhost:5173
```

### Before Deployment
```bash
# 1. Run build
npm run build

# 2. Preview production
npm run preview

# 3. Test at localhost:4173

# 4. If all good, deploy
vercel --prod
```

### After Making Changes
```bash
# 1. Commit changes
git add .
git commit -m "Description of changes"

# 2. Push to GitHub
git push

# 3. Deploy to Vercel (auto-deploys if connected)
```

---

## 📊 MONITORING COMMANDS

### Watch for File Changes
```bash
# Dev server auto-reloads
npm run dev
```

### Check Server Status
```bash
# In browser
curl http://localhost:5173
```

### View Build Output
```bash
dir dist
```

---

## 🎨 STYLING COMMANDS

### Rebuild Tailwind CSS
```bash
npm run build
```

### Watch CSS Changes (if needed)
```bash
npm run dev
```

---

## 🔄 GIT COMMANDS

### Check Status
```bash
git status
```

### View Commit History
```bash
git log --oneline
```

### Create Branch
```bash
git checkout -b feature/new-feature
```

### Merge Branch
```bash
git checkout main
git merge feature/new-feature
```

### Undo Last Commit (keep changes)
```bash
git reset --soft HEAD~1
```

### Undo Last Commit (discard changes)
```bash
git reset --hard HEAD~1
```

---

## 📦 NPM SCRIPTS REFERENCE

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm install` | Install dependencies |
| `npm update` | Update packages |
| `npm audit` | Check security |

---

## ⚡ KEYBOARD SHORTCUTS (Browser)

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+I` | Open DevTools |
| `Ctrl+Shift+J` | Open Console |
| `Ctrl+Shift+M` | Toggle device mode |
| `Ctrl+R` | Reload page |
| `Ctrl+Shift+R` | Hard reload |
| `F12` | Toggle DevTools |

---

## 🎯 ONE-LINER COMMANDS

### Quick Start
```bash
cd C:\Users\p\Desktop\car\vehicle-accounting-dashboard && npm run dev
```

### Quick Build & Preview
```bash
npm run build && npm run preview
```

### Clean & Fresh Install
```bash
rmdir /s /q node_modules dist && npm install && npm run dev
```

### Full Reset
```bash
rmdir /s /q node_modules dist && del package-lock.json && npm install
```

---

## 📞 HELP COMMANDS

### NPM Help
```bash
npm help
npm help run
```

### Vite Help
```bash
npx vite --help
```

### Git Help
```bash
git --help
git help commit
```

---

## 🎊 SUCCESS INDICATORS

### Development Server Started ✅
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

### Build Successful ✅
```
vite v5.x.x building for production...
✓ XXX modules transformed.
dist/index.html                   0.XX kB
dist/assets/index-XXXXX.css      XX.XX kB
dist/assets/index-XXXXX.js      XXX.XX kB
✓ built in XX.XXs
```

### Preview Server Started ✅
```
➜  Local:   http://localhost:4173/
➜  Network: use --host to expose
```

---

*Quick reference for all Vehicle Accounting Dashboard commands*

**Updated:** October 25, 2026
