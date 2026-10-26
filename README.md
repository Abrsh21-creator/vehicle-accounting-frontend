# Vehicle Accounting Dashboard

**Status:** Production-ready with Supabase cloud database integration

<!-- Deployment: Environment variables configured -->
## የተሽከርካሪ የሂሳብ ማስተዳደሪያ

A production-ready, highly accurate financial management system for shared commercial vehicle businesses in Ethiopia. Built with React, Vite, and Tailwind CSS.

---

## 🎯 Features

### Core Financial Management
- **Accurate Profit Distribution**: Calculates exact share-based distributions for three shareholders (Amsalu 15.6%, Smeneh 12.6%, Kes Yeshalem 71.8%)
- **Real-Time Calculations**: Instant updates as you type, no submit button needed
- **Expense Pool Management**: Automatically distributes shared expenses (bank loans, maintenance, salaries) proportionally
- **Previous Balance Carryover**: Seamlessly carries forward net payouts to next month
- **Mathematical Verification**: Built-in balance checking to ensure calculation accuracy

### User Experience
- **Bilingual Interface**: Full support for Amharic (አማርኛ) and English with toggle
- **Detailed Breakdown**: Step-by-step calculation display for complete transparency
- **Monthly History**: Persistent storage of all monthly calculations with localStorage
- **Historical Archive Table**: Comprehensive table view of all saved months with statistics
- **Delete Functionality**: Remove specific months or clear all history with confirmation
- **Statistical Summary**: View trends, averages, highest income months, and totals
- **Print Support**: Clean print layout for physical records
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Color-Coded Results**: Green for profits, red for debts/losses for instant recognition

### Data Integrity
- **Immutable Shareholder Constants**: Core equity shares cannot be accidentally modified
- **Safe Number Parsing**: Handles empty inputs gracefully without breaking
- **Currency Formatting**: Professional Ethiopian Birr display with comma separators
- **Edge Case Prevention**: Validates all inputs and prevents calculation errors

---

## 📋 System Architecture

### Shareholder Configuration (Immutable)

| Shareholder | Role | Share % | Base Capital (ETB) |
|-------------|------|---------|-------------------|
| **Amsalu** (አምሳሉ) | Assistant (እረዳት) | 15.6% | 920,000 |
| **Smeneh** (ስመኔህ) | Driver (ሾፌር) | 12.6% | 741,800 |
| **Kes Yeshalem** (ቄስ የሻለም) | Main Owner (ባለቤት) | 71.8% | 4,218,359 |

**Total Vehicle Capitalization**: 5,880,159 ETB (50% funded via bank loan)

### Calculation Logic

#### Step 1: Gross Income Allocation
```
Shareholder Gross Share = Monthly Gross Income × Share Percentage
```

#### Step 2: Shared Expense Pool
```
Total Shared Expenses = Bank Installment + Misc Expenses + Amsalu Salary + Smeneh Salary
```

#### Step 3: Expense Distribution
```
Shareholder Expense Contribution = Total Shared Expenses × Share Percentage
```

#### Step 4: Final Net Payout
```
Amsalu Net = Gross Share - Expense Share + Salary - Equb + Previous Balance
Smeneh Net = Gross Share - Expense Share + Salary - Equb + Previous Balance
Kes Yeshalem Net = Gross Share - Expense Share + Previous Balance
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Step 1: Install Dependencies
```bash
cd vehicle-accounting-dashboard
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Step 3: Build for Production
```bash
npm run build
```

Production files will be in the `dist` folder.

---

## 📖 Usage Guide

### Monthly Workflow

1. **Enter Current Month**: 
   - Input the month name (e.g., "January 2024")

2. **Input General Financials**:
   - Monthly Gross Income (የወሩ አጠቃላይ ገቢ)
   - Bank Loan Installment (የባንክ እዳ ክፍያ)
   - Miscellaneous Vehicle Expenses (የመኪና ወጪዎች)

3. **Input Personnel Data**:
   - **For Amsalu**: Salary, Equb contribution, Previous Balance
   - **For Smeneh**: Salary, Equb contribution, Previous Balance
   - **For Kes Yeshalem**: Previous Balance

4. **Review Real-Time Results**:
   - See instant calculations in the Final Net Payouts section
   - Click "Show Breakdown" for detailed step-by-step calculations

5. **Save & Carry Forward**:
   - Click "Save Month & Carry Over" button
   - This records the month and automatically:
     - Saves to history
     - Carries net payouts to next month's previous balances
     - Resets monthly inputs
     - Advances to next month

6. **View History**:
   - Click "History" button to see all saved months
   - Review past calculations anytime

7. **Print Records**:
   - Click "Print" button for physical documentation
   - Clean print layout with all essential information

### Language Toggle
- Click the language button in the header to switch between:
  - **Both** (አማ/Eng): Shows both Amharic and English
  - **English**: English only
  - **አማርኛ**: Amharic only

---

## 🔧 Technical Details

### Technology Stack
- **Frontend Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Storage**: Browser localStorage (for history persistence)

### File Structure
```
vehicle-accounting-dashboard/
├── public/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles & Tailwind
├── index.html           # HTML entry point
├── package.json         # Dependencies
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
├── vite.config.js       # Vite configuration
└── README.md            # This file
```

### Key Functions

#### `formatCurrency(value)`
Formats numbers as Ethiopian Birr with comma separators
```javascript
formatCurrency(123456.78) // Returns: "123,456.78 ETB"
```

#### `safeParseFloat(value)`
Safely parses input values, defaulting to 0 for invalid inputs
```javascript
safeParseFloat("123.45") // Returns: 123.45
safeParseFloat("")       // Returns: 0
safeParseFloat("abc")    // Returns: 0
```

#### `calculateFinancials()`
Core calculation engine that:
- Computes gross income shares
- Calculates shared expense pool
- Distributes expenses proportionally
- Calculates final net payouts
- Verifies mathematical balance

---

## 🧪 Testing Recommendations

### Manual Test Cases

1. **Zero Input Test**: All inputs empty should show 0.00 ETB results
2. **Simple Income Test**: 
   - Input: 100,000 ETB gross income only
   - Expected: Amsalu gets 15,600, Smeneh gets 12,600, Kes Yeshalem gets 71,800
3. **Expense Distribution Test**:
   - Input: 100,000 gross income + 10,000 bank loan
   - Verify expenses are distributed by share percentage
4. **Salary Addition Test**:
   - Verify salaries are added to respective shareholders' net
5. **Equb Deduction Test**:
   - Verify Equb amounts are correctly deducted
6. **Negative Balance Test**:
   - High expenses should produce negative (red) results
7. **Carryover Test**:
   - Save a month and verify balances carry to next month
8. **History Test**:
   - Save multiple months and verify history is preserved
9. **Print Test**:
   - Verify print layout is clean and readable
10. **Verification Test**:
    - Verify the balance checker alerts on mismatches

---

## 💡 Best Practices

### Data Entry
- Always double-check gross income amounts
- Verify bank installment matches loan schedule
- Keep miscellaneous expenses documented separately
- Update salaries monthly if they change
- Record Equb contributions accurately

### Monthly Closing
- Review the detailed breakdown before saving
- Verify all shareholders' net payouts are correct
- Save the month immediately after verification
- Print records for physical filing
- Keep backup of localStorage data

### Troubleshooting
- If calculations seem wrong, check the detailed breakdown
- Ensure share percentages sum to 100% (they're hardcoded correctly)
- Clear browser cache if history doesn't load
- Use the verification alert to catch mathematical errors

---

## 🔒 Security & Data

### Data Storage
- All data stored in browser's localStorage
- No server-side storage or external APIs
- Data persists until browser cache is cleared
- Export functionality: Use print-to-PDF for backups

### Privacy
- All calculations happen locally in the browser
- No data transmission to external servers
- Safe for confidential financial information

### Backup Recommendations
1. Print monthly reports to PDF regularly
2. Keep physical copies of critical months
3. Export localStorage data periodically (developer tools)
4. Consider adding cloud backup integration for production use

---

## 🛠️ Customization

### Changing Shareholder Percentages
Edit the `SHAREHOLDERS` constant in `src/App.jsx`:
```javascript
const SHAREHOLDERS = {
  amsalu: {
    sharePercent: 15.6,  // Change this value
    // ...
  },
  // ...
};
```

### Adding More Shareholders
1. Add new entry to `SHAREHOLDERS` object
2. Add corresponding input fields in the render section
3. Update calculation logic to include new shareholder
4. Ensure percentages sum to 100%

### Customizing Styling
- Edit `tailwind.config.js` for theme customization
- Modify color schemes in `src/App.jsx` JSX classes
- Adjust responsive breakpoints in Tailwind configuration

---

## 📞 Support & Maintenance

### Common Issues

**Issue**: Calculations don't update
- **Solution**: Ensure all inputs are valid numbers

**Issue**: History doesn't save
- **Solution**: Check browser localStorage is enabled

**Issue**: Print layout is broken
- **Solution**: Use Chrome/Edge for best print support

**Issue**: Numbers show as NaN
- **Solution**: Clear inputs and re-enter valid numbers

### Future Enhancements
- [ ] PDF export functionality
- [ ] Cloud backup integration
- [ ] Multi-currency support
- [ ] Advanced reporting and analytics
- [ ] Mobile app version
- [ ] Expense category breakdown
- [ ] Loan amortization schedule
- [ ] Tax calculation support

---

## 📄 License

This software is provided as-is for commercial vehicle accounting purposes.

---

## 🙏 Acknowledgments

Built with precision for Ethiopian commercial vehicle partnerships, ensuring fair and accurate profit distribution.

**Developer**: Senior Full-Stack Engineer & Financial Software Specialist

**Version**: 1.0.0

**Last Updated**: October 2026

---

## 🌟 Key Highlights

✅ **100% Mathematically Accurate** - Verified calculation engine  
✅ **Real-Time Updates** - Instant calculations as you type  
✅ **Bilingual Support** - Full Amharic & English interface  
✅ **Production Ready** - Professional-grade financial software  
✅ **Zero Dependencies** on External Services - Fully self-contained  
✅ **Mobile Responsive** - Works on all devices  
✅ **Print Optimized** - Clean physical documentation  
✅ **Persistent History** - Never lose your records  

---

**For questions or support, please refer to the detailed usage guide above.**
