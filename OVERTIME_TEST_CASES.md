# OVERTIME INCOME & FORMATTING TEST CASES

## Test Suite for New Features
Date: 2026-10-25

---

## TEST CASE 1: Currency Formatting - Basic Input

### Objective
Verify that number inputs display with comma formatting and 2 decimal places

### Test Steps
1. Open dashboard: http://localhost:5173
2. Click on "Monthly Gross Income" field
3. Type: `420000`

**Expected Result:**
- Display updates to: `420,000`
- When you tab out: `420,000`

4. Type: `1000000`

**Expected Result:**
- Display updates to: `1,000,000`

5. Type: `123456.78`

**Expected Result:**
- Display updates to: `123,456.78`

**Status:** ✓ PASS / ✗ FAIL

---

## TEST CASE 2: Overtime Distribution - Standard Case

### Objective
Verify overtime income distributes correctly with 50/35/15 split

### Test Inputs
```
Monthly Gross Income: 420,000
Monthly Overtime Income: 100,000
Smeneh Salary: 30,000
Amsalu Salary: 10,000
Bank Loan: 420,000
Misc Expenses: 0
All Previous Balances: 0
All Equb: 0
Month: Meskerem 2017
```

### Expected Overtime Distribution
- **Kes Yeshalem**: 50,000.00 ETB (50% of 100,000)
- **Smeneh**: 35,000.00 ETB (70% of 50,000)
- **Amsalu**: 15,000.00 ETB (30% of 50,000)
- **Total**: 100,000.00 ETB ✓

### Expected Final Net Payouts
Calculate manually:

**Kes Yeshalem:**
- Income Share: 420,000 × 71.8% = +301,560
- Salary Share: 40,000 × 71.8% = -28,720
- Bank Share: 420,000 × 71.8% = -301,560
- Misc Share: 0 × 71.8% = 0
- Previous: 0
- Overtime: +50,000
- **Net = 21,280.00 ETB**

**Smeneh:**
- Income Share: 420,000 × 12.6% = +52,920
- Salary: +30,000
- Salary Share: 40,000 × 12.6% = -5,040
- Equb: 0
- Bank Share: 420,000 × 12.6% = -52,920
- Previous: 0
- Overtime: +35,000
- **Net = 59,960.00 ETB**

**Amsalu:**
- Income Share: 420,000 × 15.6% = +65,520
- Salary: +10,000
- Salary Share: 40,000 × 15.6% = -6,240
- Equb: 0
- Bank Share: 420,000 × 15.6% = -65,520
- Previous: 0
- Overtime: +15,000
- **Net = 18,760.00 ETB**

### Test Steps
1. Enter all inputs as specified above
2. Click "Show Breakdown"
3. Verify each shareholder's breakdown shows Step 7 (or Step 6 for Kes Yeshalem) with overtime
4. Verify net payouts match expected values
5. Check that overtime steps have green background

**Status:** ✓ PASS / ✗ FAIL

---

## TEST CASE 3: Zero Overtime - Conditional Display

### Objective
Verify that overtime steps are hidden when overtime = 0

### Test Inputs
```
Monthly Overtime Income: 0  (or leave empty)
(Other inputs: any valid values)
```

### Expected Results
1. No "Step 7" overtime line appears in Smeneh breakdown
2. No "Step 7" overtime line appears in Amsalu breakdown
3. No "Step 6" overtime line appears in Kes Yeshalem breakdown
4. Net payouts follow standard 6-step calculation only
5. Summary section does NOT show "Total Overtime Income" line

**Status:** ✓ PASS / ✗ FAIL

---

## TEST CASE 4: Large Overtime Value

### Objective
Verify large overtime values format and calculate correctly

### Test Inputs
```
Monthly Overtime Income: 5000000  (5 million)
```

### Expected Results
1. Input displays as: `5,000,000`
2. Overtime Distribution:
   - Kes Yeshalem: `2,500,000.00 ETB`
   - Smeneh: `1,750,000.00 ETB`
   - Amsalu: `750,000.00 ETB`
3. All values display with proper comma formatting
4. Calculations are mathematically accurate

**Status:** ✓ PASS / ✗ FAIL

---

## TEST CASE 5: Decimal Overtime Value

### Objective
Verify decimal overtime values calculate correctly

### Test Inputs
```
Monthly Overtime Income: 99999.99
```

### Expected Results
1. Input displays as: `99,999.99`
2. Overtime Distribution:
   - Kes Yeshalem: `49,999.995` → displays as `50,000.00 ETB` (rounded)
   - Smeneh: `34,999.9965` → displays as `35,000.00 ETB` (rounded)
   - Amsalu: `14,999.9985` → displays as `15,000.00 ETB` (rounded)
3. Rounding is consistent across all calculations

**Status:** ✓ PASS / ✗ FAIL

---

## TEST CASE 6: Mobile Responsiveness

### Objective
Verify dashboard is fully responsive on mobile devices

### Test Steps
1. Open dashboard in browser
2. Open Developer Tools (F12)
3. Switch to Device Toolbar (Ctrl+Shift+M)
4. Test with:
   - iPhone SE (375px width)
   - iPhone 12 Pro (390px width)
   - iPad (768px width)
   - iPad Pro (1024px width)

### Expected Results
**Mobile (< 768px):**
- Input sections stack vertically (1 column)
- All input fields are full width
- Text remains readable
- No horizontal scrolling on main content
- History table scrolls horizontally if needed
- Buttons are touch-friendly (min 44px height)

**Tablet (768px - 1024px):**
- Input sections display in 2 columns
- Breakdown cards remain readable
- Headers scale appropriately

**Desktop (> 1024px):**
- Input sections display in 3 columns
- Full layout as designed
- Optimal spacing and padding

**Status:** ✓ PASS / ✗ FAIL

---

## TEST CASE 7: Overtime in Monthly History

### Objective
Verify overtime data persists in saved monthly records

### Test Steps
1. Enter test data with overtime income (e.g., 100,000)
2. Click "Save Month & Carry Over"
3. Click "History" button
4. Find the saved month record

### Expected Results
1. Saved month shows in history
2. Clicking history details shows:
   - Overtime income value is stored
   - Net payouts include overtime impact
3. Reload page (F5)
4. Open history again
5. Data persists after page reload

**Status:** ✓ PASS / ✗ FAIL

---

## TEST CASE 8: Overtime with Equb and Previous Balance

### Objective
Verify overtime works correctly with other inputs

### Test Inputs
```
Monthly Gross Income: 420,000
Monthly Overtime Income: 100,000
Smeneh Salary: 30,000
Smeneh Equb: 40,000
Smeneh Previous Balance: 28,132
Amsalu Salary: 10,000
Amsalu Equb: 0
Amsalu Previous Balance: 0
Bank Loan: 420,000
Misc Expenses: 0
Kes Yeshalem Previous: 0
```

### Expected Smeneh Calculation
1. Income Share: +52,920
2. Salary: +30,000
3. Salary Share: -5,040
4. Equb: -40,000
5. Bank Share: -52,920
6. Previous: +28,132
7. Overtime: +35,000
**Net = 48,092.00 ETB**

### Expected Results
- Smeneh net payout: `48,092.00 ETB`
- Equb deduction appears before overtime addition
- Previous balance adds before overtime
- All steps clearly visible in breakdown

**Status:** ✓ PASS / ✗ FAIL

---

## TEST CASE 9: Copy/Paste Formatted Numbers

### Objective
Verify copy/pasting formatted numbers works correctly

### Test Steps
1. Open Excel or text editor
2. Type: `1,234,567.89`
3. Copy the formatted number
4. Paste into "Monthly Overtime Income" field
5. Tab out of the field

### Expected Results
1. Pasted value is cleaned and parsed correctly
2. Display shows: `1,234,567.89`
3. Calculations use value: `1234567.89`
4. No errors or NaN values appear

**Status:** ✓ PASS / ✗ FAIL

---

## TEST CASE 10: Bilingual Display

### Objective
Verify bilingual labels display correctly for overtime

### Test Steps
1. Open dashboard (default: both languages)
2. Find "Monthly Overtime Income" field

### Expected Results
- Label shows: **"የወር ኦቨርታይም ገቢ / Monthly Overtime Income"**
- Helper text shows: **"50% ለባለቤት፣ 50% 70/30 ለሾፌር/እረዳት / 50% to Owner, 50% split 70/30 Driver/Assistant"**

3. Click language toggle to "English"
4. Label shows: **"Monthly Overtime Income"**

5. Click language toggle to "አማርኛ" (Amharic)
6. Label shows: **"የወር ኦቨርታይም ገቢ"**

**Status:** ✓ PASS / ✗ FAIL

---

## TEST CASE 11: Summary Section Display

### Objective
Verify summary section shows overtime information correctly

### Test Inputs
```
Overtime Income: 100,000
```

### Expected Results in Summary Section
1. **Income & Expense Classification** box shows:
   - "Overtime Income Distribution: 50% to Owner, 50% split 70% Driver / 30% Assistant"
   
2. **Financial Summary** shows:
   - "Total Overtime Income: 100,000.00 ETB" (with green background)
   
3. When overtime = 0:
   - Classification text about overtime still appears (as a reference)
   - "Total Overtime Income" line is hidden

**Status:** ✓ PASS / ✗ FAIL

---

## TEST CASE 12: Print Functionality

### Objective
Verify print version displays overtime correctly

### Test Steps
1. Enter data with overtime income
2. Click "Print" button (or Ctrl+P)
3. Review print preview

### Expected Results
1. Overtime input field appears in print version
2. Overtime values visible in breakdown sections
3. Overtime highlighted steps print clearly
4. All formatting (commas, decimals) preserved
5. No UI elements hidden incorrectly

**Status:** ✓ PASS / ✗ FAIL

---

## REGRESSION TESTS

### Test Case R1: Original 6-Step Calculation Still Works
**Objective:** Ensure base calculation logic is unchanged

**Test:** Run previous test case from VERIFICATION_TEST.md:
- Income: 420,000
- Smeneh Salary: 30,000
- Amsalu Salary: 10,000
- Smeneh Equb: 40,000
- Bank: 420,000
- Smeneh Previous: 28,132
- **Overtime: 0 (or empty)**

**Expected:** Smeneh Net = 13,092.00 ETB ✓

**Status:** ✓ PASS / ✗ FAIL

---

### Test Case R2: Misc Expenses Still Only for Kes Yeshalem
**Objective:** Verify misc expense logic unchanged

**Test:** 
- Misc Expenses: 100,000
- Check Smeneh breakdown: NO misc line
- Check Amsalu breakdown: NO misc line  
- Check Kes Yeshalem breakdown: HAS misc line (71.8%)

**Expected:** Only Kes Yeshalem pays misc expenses

**Status:** ✓ PASS / ✗ FAIL

---

## BROWSER COMPATIBILITY

Test all features in:
- [ ] Google Chrome (latest)
- [ ] Mozilla Firefox (latest)
- [ ] Microsoft Edge (latest)
- [ ] Safari (Mac/iOS)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

---

## PERFORMANCE TESTS

### Test P1: Large Input Values
- Enter: Gross Income = `99,999,999.99`
- Enter: Overtime = `50,000,000.00`
- **Expected:** No lag, calculations complete instantly

### Test P2: Rapid Typing
- Type rapidly in formatted input fields
- **Expected:** Smooth formatting updates, no input lag

### Test P3: History with Many Records
- Save 20+ monthly records with overtime data
- **Expected:** History loads quickly, no performance degradation

---

## TEST SUMMARY TEMPLATE

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC1: Basic Formatting | ✓ | |
| TC2: Overtime Distribution | ✓ | |
| TC3: Zero Overtime | ✓ | |
| TC4: Large Values | ✓ | |
| TC5: Decimal Values | ✓ | |
| TC6: Mobile Responsive | ✓ | |
| TC7: History Persistence | ✓ | |
| TC8: Complex Calculation | ✓ | |
| TC9: Copy/Paste | ✓ | |
| TC10: Bilingual | ✓ | |
| TC11: Summary Display | ✓ | |
| TC12: Print | ✓ | |
| R1: 6-Step Regression | ✓ | |
| R2: Misc Expenses | ✓ | |

**Overall Status:** ✓ ALL PASS / ⚠ PARTIAL / ✗ FAIL

---

## ISSUES LOG

| Issue # | Description | Severity | Status | Resolution |
|---------|-------------|----------|--------|------------|
| - | - | - | - | - |

---

## SIGN-OFF

- [ ] All test cases passed
- [ ] No critical issues found
- [ ] Mobile responsiveness verified
- [ ] Browser compatibility confirmed
- [ ] Ready for deployment

**Tested By:** _____________
**Date:** _____________
**Approved By:** _____________
