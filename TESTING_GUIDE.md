# 🧪 TESTING GUIDE - Vehicle Accounting Dashboard

**Quick Reference for Testing All New Features**

---

## 🚀 QUICK START

1. **Start Development Server:**
```bash
cd vehicle-accounting-dashboard
npm run dev
```

2. **Access Application:**
```
http://localhost:5173
```

---

## 👤 TEST USERS & CREDENTIALS

| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| **Admin** | admin | admin123 | Full access: Edit, Delete, Comment, Modify Inputs |
| **Shareholder** | kesyeshalem | kes123 | Read-only: View all data, no modifications |
| **Shareholder** | smeneh | smeneh123 | Read-only: View all data, no modifications |
| **Shareholder** | amsalu | amsalu123 | Read-only: View all data, no modifications |

---

## ✅ TEST SCENARIO 1: Admin Login & Full Access

**Steps:**
1. Open browser to http://localhost:5173
2. Login with: `admin` / `admin123`
3. **Verify:**
   - ✅ Header shows "Administrator" badge with shield icon
   - ✅ Logout button visible (red icon)
   - ✅ "Monthly Inputs" section visible with "Admin Only" badge
   - ✅ All input fields editable
   - ✅ "Save Month & Carry Over" button visible

**Expected Result:** Full admin interface with all controls enabled

---

## ✅ TEST SCENARIO 2: Shareholder Login & Read-Only

**Steps:**
1. Logout from admin account
2. Login with: `smeneh` / `smeneh123`
3. **Verify:**
   - ✅ Header shows "Smeneh" / "ስመኔህ" with "Driver" role
   - ✅ Logout button visible
   - ❌ "Monthly Inputs" section HIDDEN
   - ❌ "Save Month & Carry Over" button HIDDEN
   - ✅ "Final Net Payouts" section visible
   - ✅ "Detailed Breakdown" visible
   - ✅ "Monthly History Archive" visible
   - ❌ Edit/Delete/Comment buttons in history HIDDEN

**Expected Result:** Read-only access, no modification controls

---

## ✅ TEST SCENARIO 3: Insurance Payment Calculation

**Steps:**
1. Login as admin
2. Navigate to "General Financials" section
3. Enter test data:
   - Monthly Gross Income: `100,000`
   - Monthly Overtime Income: `10,000`
   - Bank Loan Installment: `15,000`
   - Misc. Vehicle Expenses: `5,000`
   - **Insurance Payment: `10,000`** ← NEW FIELD
4. Click "Show Breakdown"
5. **Verify Insurance Deductions:**
   - ✅ Kes Yeshalem: -7,180.00 ETB (71.8% of 10,000)
   - ✅ Smeneh: -1,260.00 ETB (12.6% of 10,000)
   - ✅ Amsalu: -1,560.00 ETB (15.6% of 10,000)
6. **Verify in Breakdown Sections:**
   - ✅ Kes Yeshalem: Step 3 shows "Insurance Payment Share"
   - ✅ Smeneh: Step 6 shows "Insurance Payment Share"
   - ✅ Amsalu: Step 6 shows "Insurance Payment Share"
7. **Verify in Summary:**
   - ✅ "Insurance Payment (Shared): 10,000.00 ETB" displayed with purple background

**Expected Result:** Insurance correctly distributed by ownership percentage

---

## ✅ TEST SCENARIO 4: Save Month with Insurance

**Steps:**
1. Continue from previous test
2. Select Month: `Meskerem` and Year: `2019`
3. Fill all required fields (salaries, equb, etc.)
4. Click "Save Month & Carry Over"
5. **Verify:**
   - ✅ Success alert appears
   - ✅ Month appears in "Monthly History Archive"
   - ✅ Insurance data saved with record
   - ✅ Input fields reset
   - ✅ Balances carried forward

**Expected Result:** Month saved successfully with insurance included

---

## ✅ TEST SCENARIO 5: Soft Delete with 3-Day Recovery

**Steps:**
1. Login as admin
2. Find a saved month in "Monthly History Archive"
3. Click the **Delete** button (trash icon)
4. **Verify ReasonModal appears:**
   - ✅ Modal title: "Delete Confirmation"
   - ✅ Month name displayed
   - ✅ Yellow warning box: "3-Day Recovery Period"
   - ✅ Reason textarea (required field)
5. Enter reason: `Testing soft delete feature`
6. Click "Confirm"
7. **Verify:**
   - ✅ Record removed from history table
   - ✅ "Pending Deletions" section appears above history
   - ✅ Record shows in pending with countdown timer
   - ✅ "Time left: 2d 23h" (approximate)
   - ✅ Green "Restore" button visible
8. Click "Restore" button
9. **Verify:**
   - ✅ Record returns to history table
   - ✅ Pending deletions section disappears (if no other pending)
   - ✅ Success alert: "Month restored successfully"

**Expected Result:** Soft delete works, 3-day recovery functional

---

## ✅ TEST SCENARIO 6: Add Comment to Month

**Steps:**
1. Login as admin
2. Find a month in history
3. Click the **Comment** button (message icon)
4. **Verify CommentModal appears:**
   - ✅ Modal title: "Add/Edit Comment"
   - ✅ Month name displayed
   - ✅ Large textarea for comment
5. Enter comment: `This month had high maintenance costs due to tire replacement`
6. Click "Save Comment"
7. **Verify:**
   - ✅ Modal closes
   - ✅ Comment button turns GREEN (indicating comment exists)
8. Click comment button again
9. **Verify:**
   - ✅ Previous comment displayed in textarea
   - ✅ Can edit and save again

**Expected Result:** Comments saved and retrievable

---

## ✅ TEST SCENARIO 7: Edit Past Month

**Steps:**
1. Login as admin
2. Find a month in history
3. Click the **Edit** button (pencil icon)
4. **Verify EditMonthModal appears:**
   - ✅ Modal title: "Edit Month Data"
   - ✅ Month name displayed
   - ✅ All input fields pre-filled with existing values
   - ✅ Numbers formatted with commas
5. Change "Monthly Gross Income" from `100,000` to `105,000`
6. Click "Save Changes"
7. When prompted, enter reason: `Correcting data entry error`
8. **Verify:**
   - ✅ Modal closes
   - ✅ History table updates with new value
   - ✅ Net payouts recalculated

**Expected Result:** Edit functionality works, reason tracked

---

## ✅ TEST SCENARIO 8: Audit Log Verification

**Steps:**
1. Perform actions: Delete, Restore, Comment, Edit
2. Open browser console (F12)
3. Run command:
```javascript
JSON.parse(localStorage.getItem('auditLogs'))
```
4. **Verify each log entry contains:**
   - ✅ `id` - Unique identifier
   - ✅ `action` - Action type (DELETE_MONTH, RESTORE_MONTH, etc.)
   - ✅ `timestamp` - ISO 8601 format
   - ✅ `user` - Username, name, role
   - ✅ `data` - Action details (monthName, reason, etc.)
5. Check format of DELETE_MONTH entry:
```json
{
  "id": "audit_1234567890_abc123",
  "action": "DELETE_MONTH",
  "timestamp": "2026-10-25T10:30:00.000Z",
  "user": {
    "username": "admin",
    "name": "Administrator",
    "role": "admin"
  },
  "data": {
    "monthName": "Meskerem 2019",
    "reason": "Testing soft delete feature",
    "userAgent": "Mozilla/5.0..."
  }
}
```

**Expected Result:** All actions logged with complete metadata

---

## ✅ TEST SCENARIO 9: Permission Boundaries

**Test Admin Permissions:**
1. Login as admin
2. **Verify CAN DO:**
   - ✅ See input forms
   - ✅ Save months
   - ✅ Edit history
   - ✅ Delete history
   - ✅ Add comments
   - ✅ Restore deletions

**Test Shareholder Permissions:**
1. Logout and login as `kesyeshalem`
2. **Verify CANNOT DO:**
   - ❌ Input forms hidden
   - ❌ Save button hidden
   - ❌ Edit button hidden
   - ❌ Delete button hidden
   - ❌ Comment button hidden
3. **Verify CAN DO:**
   - ✅ View all results
   - ✅ View breakdowns
   - ✅ View history table
   - ✅ View statistics
   - ✅ Print page

**Expected Result:** Permissions enforced correctly

---

## ✅ TEST SCENARIO 10: Currency Formatting

**Steps:**
1. Enter various amounts in input fields
2. **Verify formatting:**
   - Input: `1234567` → Display: `1,234,567`
   - Input: `1000.50` → Display: `1,000.50`
   - Result display: `420,000.00 ETB`
3. **Verify in history table:**
   - All numbers show comma separators
   - Two decimal places for currency
4. **Verify in breakdown:**
   - All calculated values formatted
   - Consistent formatting throughout

**Expected Result:** All numbers properly formatted with commas

---

## ✅ TEST SCENARIO 11: Overtime Distribution

**Steps:**
1. Enter Overtime Income: `20,000`
2. Click "Show Breakdown"
3. **Verify Distribution:**
   - ✅ Kes Yeshalem: +10,000.00 ETB (50%)
   - ✅ Smeneh: +7,000.00 ETB (70% of remaining 50% = 35% total)
   - ✅ Amsalu: +3,000.00 ETB (30% of remaining 50% = 15% total)
4. **Math Check:**
   - 20,000 × 50% = 10,000 (Kes Yeshalem)
   - 20,000 × 50% = 10,000 (employee pool)
   - 10,000 × 70% = 7,000 (Smeneh)
   - 10,000 × 30% = 3,000 (Amsalu)
   - Total: 10,000 + 7,000 + 3,000 = 20,000 ✅

**Expected Result:** Overtime correctly split 50/35/15

---

## ✅ TEST SCENARIO 12: Language Toggle

**Steps:**
1. Click language button in header
2. **Verify 3 language modes:**
   - Mode 1: **Both** (አማ/Eng) - Shows "አማርኛ / English" for all labels
   - Mode 2: **English** - Shows "English" only
   - Mode 3: **Amharic** - Shows "አማርኛ" only
3. **Verify translations in all sections:**
   - ✅ Header title
   - ✅ Input labels
   - ✅ Button text
   - ✅ Shareholder names
   - ✅ Modal content
   - ✅ History table headers
4. Click through all 3 modes and verify consistency

**Expected Result:** Seamless language switching

---

## ✅ TEST SCENARIO 13: Responsive Design

**Steps:**
1. Open browser dev tools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. **Test viewports:**
   - Desktop: 1920×1080
   - Laptop: 1366×768
   - Tablet: 768×1024
   - Mobile: 375×667
4. **Verify on each device:**
   - ✅ Layout adapts properly
   - ✅ No horizontal scrolling
   - ✅ Buttons remain clickable
   - ✅ Text remains readable
   - ✅ Tables scroll or stack
   - ✅ Modals fit screen

**Expected Result:** Fully responsive on all devices

---

## ✅ TEST SCENARIO 14: Session Persistence

**Steps:**
1. Login as admin
2. Enter some data (don't save)
3. **Refresh page (F5)**
4. **Verify:**
   - ✅ Still logged in (no redirect to login)
   - ✅ User badge still shows "Administrator"
   - ✅ Entered data cleared (expected behavior)
5. Logout
6. Refresh page
7. **Verify:**
   - ✅ Redirected to login page
   - ❌ Cannot access app without login

**Expected Result:** Session persists across refreshes

---

## ✅ TEST SCENARIO 15: Pending Deletion Auto-Cleanup

**Steps (Manual Timestamp Manipulation):**
1. Delete a month with soft delete
2. Open browser console
3. Get pending deletions:
```javascript
let pending = JSON.parse(localStorage.getItem('pendingDeletions'));
console.log(pending);
```
4. Manually age the deletion (simulate 4 days):
```javascript
pending[0].deletedAt = Date.now() - (4 * 24 * 60 * 60 * 1000);
localStorage.setItem('pendingDeletions', JSON.stringify(pending));
```
5. Refresh page
6. **Verify:**
   - ✅ Pending deletion no longer shown
   - ✅ Audit log shows PERMANENT_DELETE action

**Expected Result:** Auto-cleanup works after 3 days

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: Login doesn't work
**Solution:** Check console for errors. Verify credentials match exactly (case-sensitive).

### Issue 2: Input forms not showing for admin
**Solution:** Clear localStorage and login again.
```javascript
localStorage.clear();
location.reload();
```

### Issue 3: Numbers not formatting
**Solution:** Ensure value is entered as digits only. Component handles formatting automatically.

### Issue 4: Modal doesn't close
**Solution:** Click outside modal or use X button. Check console for errors.

### Issue 5: Audit logs not saving
**Solution:** Check localStorage quota. May need to clear old logs.
```javascript
localStorage.getItem('auditLogs').length; // Check size
```

---

## 📊 PERFORMANCE TESTING

### Load Time Test
1. Open DevTools → Network tab
2. Refresh page
3. **Check metrics:**
   - ✅ Initial load < 3 seconds
   - ✅ Time to interactive < 2 seconds
   - ✅ First contentful paint < 1 second

### localStorage Usage
```javascript
// Check storage usage
let size = 0;
for (let key in localStorage) {
  size += localStorage[key].length;
}
console.log(`LocalStorage size: ${(size / 1024).toFixed(2)} KB`);
```

### Memory Leak Test
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Perform actions (add/delete records)
4. Take another snapshot
5. **Verify:** Memory growth is reasonable

---

## ✅ FINAL CHECKLIST

Before deploying, verify all tests pass:

- [ ] ✅ Admin login works
- [ ] ✅ Shareholder login works (read-only confirmed)
- [ ] ✅ Insurance calculation correct
- [ ] ✅ Insurance saves with month data
- [ ] ✅ Soft delete works
- [ ] ✅ 3-day recovery works
- [ ] ✅ Restore functionality works
- [ ] ✅ Comments can be added
- [ ] ✅ Comments persist and display
- [ ] ✅ Edit month works
- [ ] ✅ Audit logs created for all actions
- [ ] ✅ Permission boundaries enforced
- [ ] ✅ Currency formatting consistent
- [ ] ✅ Overtime distribution correct
- [ ] ✅ Language toggle works
- [ ] ✅ Responsive on all devices
- [ ] ✅ Session persistence works
- [ ] ✅ No console errors
- [ ] ✅ Build completes successfully
- [ ] ✅ Performance acceptable

---

## 🎯 SUCCESS CRITERIA

**Application is ready for production when:**
- ✅ All 15 test scenarios pass
- ✅ No critical bugs
- ✅ Performance metrics acceptable
- ✅ Security features working
- ✅ Audit trail complete
- ✅ User documentation complete

---

## 📞 SUPPORT

**If tests fail:**
1. Check browser console for errors
2. Verify Node version (v18+)
3. Clear cache and localStorage
4. Rebuild: `npm run build`
5. Review error messages carefully

**For production deployment:**
- Run all tests in production environment
- Monitor performance metrics
- Set up error tracking (Sentry/LogRocket)
- Enable analytics (Google Analytics/Mixpanel)

---

*Testing Guide v1.0*  
*Updated: October 25, 2026*
