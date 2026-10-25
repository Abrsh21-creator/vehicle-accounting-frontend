# VERIFICATION TEST CASE - 6-STEP CALCULATION METHOD

## TEST INPUTS
- **Gross Income**: 420,000 ETB
- **Smeneh Salary** (Driver): 30,000 ETB
- **Amsalu Salary** (Assistant): 10,000 ETB
- **Total Salaries**: 40,000 ETB
- **Smeneh Equb**: 40,000 ETB
- **Amsalu Equb**: 0 ETB (for this test)
- **Bank Loan**: 420,000 ETB
- **Misc Expenses**: 0 ETB (for this test)
- **Smeneh Previous Balance**: 28,132 ETB
- **Amsalu Previous Balance**: 0 ETB (for this test)
- **Kes Yeshalem Previous Balance**: 0 ETB (for this test)

---

## EXPECTED RESULT FOR SMENEH: **13,092 ETB**

### SMENEH 6-STEP CALCULATION (12.6% Share):

**Step 1: Gross Income Share (+)**
= 420,000 × 12.6%
= **+52,920 ETB**

**Step 2: Driver Salary Received (+)**
= Smeneh Salary Input
= **+30,000 ETB**

**Step 3: Shared Salary Expense Share (-)**
= Total Salaries × 12.6%
= (30,000 + 10,000) × 12.6%
= 40,000 × 12.6%
= **-5,040 ETB**

**Step 4: Personal Equb Deduction (-)**
= Smeneh Equb Input (NOT percentage-based)
= **-40,000 ETB**

**Step 5: Bank Loan Share (-)**
= Bank Loan × 12.6%
= 420,000 × 12.6%
= **-52,920 ETB**

**Step 6: Previous Balance (+)**
= Smeneh Previous Balance Input
= **+28,132 ETB**

---

### SMENEH FINAL NET CALCULATION:
```
Net = (+52,920) + (+30,000) + (-5,040) + (-40,000) + (-52,920) + (+28,132)
Net = 52,920 + 30,000 - 5,040 - 40,000 - 52,920 + 28,132
Net = 82,920 - 97,960 + 28,132
Net = -15,040 + 28,132
Net = 13,092 ETB ✓
```

---

## KEY RULES IMPLEMENTED:

### 1. **MISC EXPENSES - KES YESHALEM ONLY**
- ❌ Smeneh does NOT pay Misc Expenses share
- ❌ Amsalu does NOT pay Misc Expenses share
- ✅ Kes Yeshalem pays 71.8% of Misc Expenses

### 2. **SHARED EXPENSES (ALL shareholders contribute by %)**
- ✅ Bank Loan: All shareholders pay their % share
- ✅ Total Salaries: All shareholders pay their % share

### 3. **PERSONAL EXPENSES (Direct deduction, NO %)**
- ✅ Equb: Direct deduction, NEVER calculated with percentages
- ✅ Only applies to Smeneh and Amsalu (Kes Yeshalem has no Equb)

---

## COMPLETE FORMULAS:

### SMENEH (12.6%):
```
Net = (Income × 12.6%) 
    + Salary 
    - (Total Salaries × 12.6%) 
    - Equb 
    - (Bank × 12.6%) 
    + Previous
```

### AMSALU (15.6%):
```
Net = (Income × 15.6%) 
    + Salary 
    - (Total Salaries × 15.6%) 
    - Equb 
    - (Bank × 15.6%) 
    + Previous
```

### KES YESHALEM (71.8%):
```
Net = (Income × 71.8%) 
    - (Total Salaries × 71.8%) 
    - (Bank × 71.8%) 
    - (Misc × 71.8%) 
    + Previous
```

---

## TESTING INSTRUCTIONS:

1. Open the dashboard: http://localhost:5173
2. Enter the test inputs above
3. Verify Smeneh's result shows: **13,092 ETB**
4. Check the breakdown to ensure:
   - Step 1: +52,920 ETB (Income Share)
   - Step 2: +30,000 ETB (Salary)
   - Step 3: -5,040 ETB (Salary Share)
   - Step 4: -40,000 ETB (Equb)
   - Step 5: -52,920 ETB (Bank Share)
   - Step 6: +28,132 ETB (Previous)
   - **FINAL: 13,092 ETB** ✓

5. Verify Amsalu's breakdown does NOT show any Misc Expenses line
6. Verify Smeneh's breakdown does NOT show any Misc Expenses line
7. Verify Kes Yeshalem's breakdown DOES show Misc Expenses line

---

## STATUS: ✅ IMPLEMENTATION COMPLETE

All calculation logic and UI have been updated to follow the strict 6-step method where:
- Misc Expenses are ONLY paid by Kes Yeshalem (71.8%)
- Bank Loan and Total Salaries are shared by ALL shareholders
- Equb is personal only (no percentage calculation)
