# CALCULATION METHOD UPDATE SUMMARY

## Date: 2026-10-24

## Overview
Updated the Vehicle Accounting Dashboard to implement the **strict 6-step calculation method** where **Misc Expenses are ONLY deducted from Kes Yeshalem** (NOT from Smeneh or Amsalu).

---

## CRITICAL CHANGE: MISC EXPENSES HANDLING

### ❌ OLD BEHAVIOR (INCORRECT):
All three shareholders shared Misc Expenses by percentage:
- Kes Yeshalem paid 71.8% of Misc
- Smeneh paid 12.6% of Misc
- Amsalu paid 15.6% of Misc

### ✅ NEW BEHAVIOR (CORRECT):
ONLY Kes Yeshalem pays Misc Expenses:
- Kes Yeshalem pays 71.8% of Misc
- Smeneh pays 0% of Misc (NO deduction)
- Amsalu pays 0% of Misc (NO deduction)

---

## UPDATED CALCULATION FORMULAS

### SMENEH (Driver - 12.6% Share) - 6 STEPS:
```javascript
Net = (Gross Income × 12.6%)           // Step 1: Income Share (+)
    + Driver Salary                     // Step 2: Salary Received (+)
    - (Total Salaries × 12.6%)         // Step 3: Salary Share (-)
    - Personal Equb                     // Step 4: Equb Deduction (-)
    - (Bank Loan × 12.6%)              // Step 5: Bank Share (-)
    + Previous Balance                  // Step 6: Previous (+/-)
```

### AMSALU (Assistant - 15.6% Share) - 6 STEPS:
```javascript
Net = (Gross Income × 15.6%)           // Step 1: Income Share (+)
    + Assistant Salary                  // Step 2: Salary Received (+)
    - (Total Salaries × 15.6%)         // Step 3: Salary Share (-)
    - Personal Equb                     // Step 4: Equb Deduction (-)
    - (Bank Loan × 15.6%)              // Step 5: Bank Share (-)
    + Previous Balance                  // Step 6: Previous (+/-)
```

### KES YESHALEM (Main Owner - 71.8% Share) - 5 STEPS:
```javascript
Net = (Gross Income × 71.8%)           // Step 1: Income Share (+)
    - (Total Salaries × 71.8%)         // Step 2: Salary Share (-)
    - (Bank Loan × 71.8%)              // Step 3: Bank Share (-)
    - (Misc Expenses × 71.8%)          // Step 4: Misc Share (-) [ONLY KES YESHALEM]
    + Previous Balance                  // Step 5: Previous (+/-)
```

---

## EXPENSE CLASSIFICATION

### 1. **SHARED BY ALL SHAREHOLDERS** (% based):
- **Bank Loan Installment**: All three shareholders contribute by percentage
- **Total Salaries** (Smeneh + Amsalu): All three shareholders contribute by percentage

### 2. **KES YESHALEM ONLY** (71.8%):
- **Misc Expenses**: ONLY Kes Yeshalem pays (Smeneh and Amsalu do NOT pay)

### 3. **PERSONAL DEDUCTION** (Direct, NO %):
- **Equb**: Individual deduction, never calculated with percentages
  - Smeneh's Equb: Only deducted from Smeneh
  - Amsalu's Equb: Only deducted from Amsalu
  - Kes Yeshalem: No Equb

---

## CODE CHANGES MADE

### 1. **Calculation Logic** (`calculateFinancials()` function):
- ✅ Removed `miscShare` calculation for Smeneh
- ✅ Removed `miscShare` calculation for Amsalu
- ✅ Kept `miscShare` calculation ONLY for Kes Yeshalem
- ✅ Updated net payout formulas to exclude Misc from Smeneh/Amsalu

### 2. **UI Breakdown Display** (Detailed Breakdown section):
- ✅ **Smeneh Breakdown**: Updated to show 6 clear steps, NO Misc Expenses line
- ✅ **Amsalu Breakdown**: Updated to show 6 clear steps, NO Misc Expenses line
- ✅ **Kes Yeshalem Breakdown**: Shows 5 steps, INCLUDES Misc Expenses line

### 3. **Summary/Verification Section**:
- ✅ Updated expense classification info box to clarify:
  - "Shared by ALL: Bank Loan, Total Salaries"
  - "Kes Yeshalem ONLY: Misc Expenses"
  - "Personal: Equb - Never shared"

---

## VERIFICATION TEST CASE

### Test Inputs:
- Gross Income: 420,000 ETB
- Smeneh Salary: 30,000 ETB
- Amsalu Salary: 10,000 ETB
- Smeneh Equb: 40,000 ETB
- Bank Loan: 420,000 ETB
- Smeneh Previous: 28,132 ETB

### Expected Result for Smeneh:
**13,092 ETB** ✓

### Calculation Breakdown:
1. Income Share: +52,920 (420,000 × 12.6%)
2. Salary Received: +30,000
3. Salary Share: -5,040 (40,000 × 12.6%)
4. Equb: -40,000
5. Bank Share: -52,920 (420,000 × 12.6%)
6. Previous: +28,132
---
**TOTAL: 13,092 ETB** ✓

---

## FILES MODIFIED

1. **`src/App.jsx`**:
   - Updated `calculateFinancials()` function
   - Updated Smeneh breakdown UI (6-step display)
   - Updated Amsalu breakdown UI (6-step display)
   - Updated Kes Yeshalem breakdown UI (5-step display with Misc)
   - Updated expense classification info box

---

## TESTING CHECKLIST

- [x] Calculation logic removes Misc from Smeneh net calculation
- [x] Calculation logic removes Misc from Amsalu net calculation
- [x] Calculation logic keeps Misc for Kes Yeshalem net calculation
- [x] Smeneh breakdown UI shows 6 steps (NO Misc line)
- [x] Amsalu breakdown UI shows 6 steps (NO Misc line)
- [x] Kes Yeshalem breakdown UI shows 5 steps (WITH Misc line)
- [x] Summary section clarifies Misc is Kes Yeshalem only
- [x] Verification test case produces 13,092 ETB for Smeneh ✓

---

## DEPLOYMENT NOTES

After verifying locally:
1. Push changes to GitHub frontend repository
2. Vercel will auto-deploy the updated dashboard
3. Test on production URL: https://vehicle-accounting-frontend.vercel.app/
4. Verify with real monthly data

---

## SUMMARY

The dashboard now correctly implements the 6-step calculation method matching your manual ledger:
- **Misc Expenses** are paid ONLY by Kes Yeshalem (71.8%)
- **Bank Loan & Salaries** are shared by all shareholders (by %)
- **Equb** is personal only (no percentage calculation)
- All UI breakdowns clearly show the correct 6-step calculation for verification
