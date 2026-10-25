import React, { useState, useEffect } from 'react';
import { Save, FileText, Calculator, Info, History, Printer, Trash2, Edit, MessageSquare, RotateCcw, Shield, LogOut, AlertTriangle, Trash, User } from 'lucide-react';
import { useAuth } from './AuthContext';
import LoginPage from './LoginPage';
import { ReasonModal, CommentModal, EditMonthModal, ClearHistoryModal } from './Modals';
import { createAuditLog, saveAuditLog, AUDIT_ACTIONS } from './AuditLog';

// ============================================================================
// MASTER DATA - IMMUTABLE SHAREHOLDER CONSTANTS
// ============================================================================
// Display Order: Kes Yeshalem (Main Owner) → Smeneh (Driver) → Amsalu (Assistant)
const SHAREHOLDERS = {
  kesYeshalem: {
    name: 'Kes Yeshalem',
    nameAm: 'ቄስ የሻለም',
    role: 'Main Owner',
    roleAm: 'ባለቤት',
    sharePercent: 71.8,
    baseCapital: 4218359,
    order: 1,
  },
  smeneh: {
    name: 'Smeneh',
    nameAm: 'ስመኔህ',
    role: 'Driver',
    roleAm: 'ሾፌር',
    sharePercent: 12.6,
    baseCapital: 741800,
    order: 2,
  },
  amsalu: {
    name: 'Amsalu',
    nameAm: 'አምሳሉ',
    role: 'Assistant',
    roleAm: 'እረዳት',
    sharePercent: 15.6,
    baseCapital: 920000,
    order: 3,
  },
};

// Ordered shareholder keys for consistent display
const SHAREHOLDER_ORDER = ['kesYeshalem', 'smeneh', 'amsalu'];

const TOTAL_CAPITAL = 5880159;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format number as Ethiopian Birr with comma separators
 * @param {number} value - The number to format
 * @returns {string} Formatted string with ETB suffix
 */
const formatCurrency = (value) => {
  const num = parseFloat(value) || 0;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num) + ' ETB';
};

/**
 * Format number for display in input fields with commas
 * @param {string|number} value - The number to format
 * @returns {string} Formatted string with commas
 */
const formatNumberInput = (value) => {
  if (!value) return '';
  // Remove all non-digit characters except decimal point
  const numStr = value.toString().replace(/[^\d.]/g, '');
  const num = parseFloat(numStr);
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Safely parse input value to float, defaulting to 0
 * @param {string|number} value - Input value
 * @returns {number} Parsed float value
 */
const safeParseFloat = (value) => {
  if (!value) return 0;
  // Remove commas and other formatting characters
  const cleanValue = value.toString().replace(/,/g, '');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  // ============================================================================
  // AUTHENTICATION & AUTHORIZATION
  // ============================================================================
  const { user, isAdmin, hasPermission, loading, logout } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!user) {
    return <LoginPage />;
  }

  // Language toggle state
  const [language, setLanguage] = useState('both'); // 'english', 'amharic', 'both'

  // Month and Year Selection States
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  // Monthly Input States
  const [grossIncome, setGrossIncome] = useState('');
  const [overtimeIncome, setOvertimeIncome] = useState('');
  const [bankInstallment, setBankInstallment] = useState('');
  const [miscExpenses, setMiscExpenses] = useState('');
  const [insurancePayment, setInsurancePayment] = useState(''); // NEW: Insurance expense
  
  // Personnel Salaries & Equb
  const [amsaluSalary, setAmsaluSalary] = useState('');
  const [amsaluEqub, setAmsaluEqub] = useState('');
  const [smenehSalary, setSmenehSalary] = useState('');
  const [smenehEqub, setSmenehEqub] = useState('');
  
  // Previous Balances (Carryovers)
  const [amsaluPrevBalance, setAmsaluPrevBalance] = useState('');
  const [smenehPrevBalance, setSmenehPrevBalance] = useState('');
  const [kesYeshalemPrevBalance, setKesYeshalemPrevBalance] = useState('');
  
  // Kes Yeshalem Out-of-Pocket Expense (Cash Advance)
  const [kesOutOfPocket, setKesOutOfPocket] = useState('');
  
  // UI States
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  
  // Modal States for Security Features
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, index: null, monthName: '' });
  const [editModal, setEditModal] = useState({ isOpen: false, data: null, index: null });
  const [commentModal, setCommentModal] = useState({ isOpen: false, index: null, monthName: '', comment: '' });
  const [clearHistoryModal, setClearHistoryModal] = useState({ isOpen: false, totalRecords: 0 });
  const [pendingDeletions, setPendingDeletions] = useState([]);
  const [recycleBin, setRecycleBin] = useState([]);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  
  // Ethiopian Calendar Months (13 months)
  const MONTHS = [
    { value: 'Meskerem', label: 'Meskerem', labelAm: 'መስከረም', days: 30 },
    { value: 'Tikimt', label: 'Tikimt', labelAm: 'ጥቅምት', days: 30 },
    { value: 'Hidar', label: 'Hidar', labelAm: 'ኅዳር', days: 30 },
    { value: 'Tahsas', label: 'Tahsas', labelAm: 'ታህሳስ', days: 30 },
    { value: 'Tir', label: 'Tir', labelAm: 'ጥር', days: 30 },
    { value: 'Yekatit', label: 'Yekatit', labelAm: 'የካቲት', days: 30 },
    { value: 'Megabit', label: 'Megabit', labelAm: 'መጋቢት', days: 30 },
    { value: 'Miazia', label: 'Miazia', labelAm: 'ሚያዝያ', days: 30 },
    { value: 'Ginbot', label: 'Ginbot', labelAm: 'ግንቦት', days: 30 },
    { value: 'Sene', label: 'Sene', labelAm: 'ሰኔ', days: 30 },
    { value: 'Hamle', label: 'Hamle', labelAm: 'ሐምሌ', days: 30 },
    { value: 'Nehase', label: 'Nehase', labelAm: 'ነሐሴ', days: 30 },
    { value: 'Pagume', label: 'Pagume', labelAm: 'ጳጉሜ', days: 5 }
  ];
  
  // Generate Ethiopian year options (current Ethiopian year is ~2016-2017)
  // Ethiopian calendar is about 7-8 years behind Gregorian
  const currentGregorianYear = new Date().getFullYear();
  const currentEthiopianYear = currentGregorianYear - 7; // Approximate conversion
  const YEARS = Array.from({ length: 11 }, (_, i) => currentEthiopianYear - 5 + i);
  
  // Computed current month string
  const currentMonth = selectedMonth && selectedYear ? `${selectedMonth} ${selectedYear}` : '';

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('vehicleAccountingHistory');
    if (saved) {
      try {
        setMonthlyHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
    
    // Set current month and year to Ethiopian calendar equivalent
    // Ethiopian New Year starts on September 11 (or 12 in leap years)
    const now = new Date();
    const gregorianYear = now.getFullYear();
    const gregorianMonth = now.getMonth(); // 0-11
    const gregorianDay = now.getDate();
    
    // Simple Ethiopian date approximation
    // Ethiopian year starts around Sept 11
    let ethiopianYear;
    let ethiopianMonthIndex;
    
    if (gregorianMonth < 8 || (gregorianMonth === 8 && gregorianDay < 11)) {
      // Before Sept 11 = still previous Ethiopian year
      ethiopianYear = gregorianYear - 8;
      ethiopianMonthIndex = gregorianMonth + 4; // Rough mapping
    } else {
      // After Sept 11 = new Ethiopian year
      ethiopianYear = gregorianYear - 7;
      ethiopianMonthIndex = gregorianMonth - 8; // Sept=0(Meskerem), Oct=1(Tikimt), etc
    }
    
    // Ensure month index is within bounds
    ethiopianMonthIndex = Math.max(0, Math.min(12, ethiopianMonthIndex));
    
    setSelectedMonth(MONTHS[ethiopianMonthIndex].value);
    setSelectedYear(ethiopianYear.toString());
  }, []);

  // Load pending deletions and clean up expired ones (> 3 days)
  useEffect(() => {
    const saved = localStorage.getItem('pendingDeletions');
    if (saved) {
      try {
        const pending = JSON.parse(saved);
        // Filter out items older than 3 days
        const now = Date.now();
        const valid = pending.filter(item => {
          const ageInDays = (now - item.deletedAt) / (1000 * 60 * 60 * 24);
          return ageInDays < 3;
        });
        
        // If any expired, log permanent deletion
        const expired = pending.filter(item => {
          const ageInDays = (now - item.deletedAt) / (1000 * 60 * 60 * 24);
          return ageInDays >= 3;
        });
        
        expired.forEach(item => {
          const log = createAuditLog(
            AUDIT_ACTIONS.PERMANENT_DELETE,
            { monthName: item.month, deletionReason: item.deletionReason },
            user
          );
          saveAuditLog(log);
        });
        
        setPendingDeletions(valid);
        localStorage.setItem('pendingDeletions', JSON.stringify(valid));
      } catch (e) {
        console.error('Failed to load pending deletions:', e);
      }
    }

    // Load and clean recycle bin
    const savedBin = localStorage.getItem('recycleBin');
    if (savedBin) {
      try {
        const bin = JSON.parse(savedBin);
        const now = Date.now();
        const valid = bin.filter(item => {
          const ageInDays = (now - item.deletedAt) / (1000 * 60 * 60 * 24);
          return ageInDays < 3;
        });
        
        // Log permanent deletions
        const expired = bin.filter(item => {
          const ageInDays = (now - item.deletedAt) / (1000 * 60 * 60 * 24);
          return ageInDays >= 3;
        });
        
        expired.forEach(item => {
          const log = createAuditLog(
            AUDIT_ACTIONS.PERMANENT_DELETE,
            { monthName: item.month, deletionReason: item.deletionReason },
            user
          );
          saveAuditLog(log);
        });
        
        setRecycleBin(valid);
        localStorage.setItem('recycleBin', JSON.stringify(valid));
      } catch (e) {
        console.error('Failed to load recycle bin:', e);
      }
    }
  }, [user]);

  // ============================================================================
  // FINANCIAL CALCULATION ENGINE - STRICT 6-STEP METHOD + OVERTIME
  // ============================================================================

  /**
   * Calculate all financial distributions using the exact 6-step method
   * - Misc Expenses: ONLY deducted from Kes Yeshalem (Main Owner)
   * - Salaries: Shared expense pool, ALL shareholders contribute by percentage
   * - Equb: Personal deduction only (Smeneh & Amsalu)
   * - Bank Loan: Shared by percentage (all shareholders)
   * - Overtime: Special distribution (50% to Kes Yeshalem, 50% split 70/30 between Smeneh/Amsalu)
   * @returns {Object} Complete calculation breakdown for all shareholders
   */
  const calculateFinancials = () => {
    // Parse all inputs safely
    const income = safeParseFloat(grossIncome);
    const overtime = safeParseFloat(overtimeIncome);
    const bankPayment = safeParseFloat(bankInstallment);
    const misc = safeParseFloat(miscExpenses);
    const insurance = safeParseFloat(insurancePayment); // NEW: Insurance
    const kesOutOfPocketExpense = safeParseFloat(kesOutOfPocket); // NEW: Kes out-of-pocket expense
    const amsaluSal = safeParseFloat(amsaluSalary);
    const amsaluEq = safeParseFloat(amsaluEqub);
    const smenehSal = safeParseFloat(smenehSalary);
    const smenehEq = safeParseFloat(smenehEqub);
    const amsaluPrev = safeParseFloat(amsaluPrevBalance);
    const smenehPrev = safeParseFloat(smenehPrevBalance);
    const kesYeshalemPrev = safeParseFloat(kesYeshalemPrevBalance);

    // Total Salaries Pool (shared expense)
    const totalSalaries = amsaluSal + smenehSal;
    
    // ========================================================================
    // KES OUT-OF-POCKET EXPENSE DISTRIBUTION
    // ========================================================================
    // When Kes Yeshalem pays an expense out-of-pocket, all shareholders must
    // reimburse him according to their equity percentages.
    // Kes gets reimbursed by others, so he receives back what others owe.
    const kesOutOfPocketKesShare = (kesOutOfPocketExpense * SHAREHOLDERS.kesYeshalem.sharePercent) / 100;
    const kesOutOfPocketSmenehShare = (kesOutOfPocketExpense * SHAREHOLDERS.smeneh.sharePercent) / 100;
    const kesOutOfPocketAmsaluShare = (kesOutOfPocketExpense * SHAREHOLDERS.amsalu.sharePercent) / 100;
    
    // ========================================================================
    // OVERTIME INCOME DISTRIBUTION
    // ========================================================================
    // 50% to Kes Yeshalem directly
    const kesYeshalemOvertimeShare = overtime * 0.5;
    
    // Remaining 50% split between Smeneh (70%) and Amsalu (30%)
    const employeeOvertimePool = overtime * 0.5;
    const smenehOvertimeShare = employeeOvertimePool * 0.7;
    const amsaluOvertimeShare = employeeOvertimePool * 0.3;
    
    // ========================================================================
    // INSURANCE PAYMENT DISTRIBUTION (NEW)
    // ========================================================================
    // Insurance is a shared expense like Bank Loan and Salaries
    // Each shareholder pays their equity percentage
    const kesYeshalemInsuranceShare = (insurance * SHAREHOLDERS.kesYeshalem.sharePercent) / 100;
    const smenehInsuranceShare = (insurance * SHAREHOLDERS.smeneh.sharePercent) / 100;
    const amsaluInsuranceShare = (insurance * SHAREHOLDERS.amsalu.sharePercent) / 100;
    
    // ========================================================================
    // SMENEH (12.6% Shareholder / Driver) - 6 STEPS
    // ========================================================================
    // Step 1: Gross Income Share
    const smenehGrossShare = (income * SHAREHOLDERS.smeneh.sharePercent) / 100;
    
    // Step 2: Driver Salary Received
    const smenehSalaryReceived = smenehSal;
    
    // Step 3: Shared Salary Expense Share
    const smenehSalaryShare = (totalSalaries * SHAREHOLDERS.smeneh.sharePercent) / 100;
    
    // Step 4: Personal Equb Deduction
    const smenehEqubDeduction = smenehEq;
    
    // Step 5: Bank Loan Share
    const smenehBankShare = (bankPayment * SHAREHOLDERS.smeneh.sharePercent) / 100;
    
    // Step 6: Previous Balance
    const smenehPrevBalanceValue = smenehPrev;
    
    // Step 7: Overtime Income Share (NEW)
    const smenehOvertimeIncome = smenehOvertimeShare;
    
    // Step 8: Out-of-Pocket Expense Share (Deduction - reimbursement to Kes)
    const smenehOutOfPocketDeduction = kesOutOfPocketSmenehShare;
    
    // FINAL NET PAYOUT (includes overtime, insurance, and out-of-pocket reimbursement)
    const smenehNet = smenehGrossShare + smenehSalaryReceived - smenehSalaryShare - smenehEqubDeduction - smenehBankShare - smenehInsuranceShare + smenehPrevBalanceValue + smenehOvertimeIncome - smenehOutOfPocketDeduction;

    // ========================================================================
    // AMSALU (15.6% Shareholder / Assistant) - 6 STEPS
    // ========================================================================
    // Step 1: Gross Income Share
    const amsaluGrossShare = (income * SHAREHOLDERS.amsalu.sharePercent) / 100;
    
    // Step 2: Assistant Salary Received
    const amsaluSalaryReceived = amsaluSal;
    
    // Step 3: Shared Salary Expense Share
    const amsaluSalaryShare = (totalSalaries * SHAREHOLDERS.amsalu.sharePercent) / 100;
    
    // Step 4: Personal Equb Deduction
    const amsaluEqubDeduction = amsaluEq;
    
    // Step 5: Bank Loan Share
    const amsaluBankShare = (bankPayment * SHAREHOLDERS.amsalu.sharePercent) / 100;
    
    // Step 6: Previous Balance
    const amsaluPrevBalanceValue = amsaluPrev;
    
    // Step 7: Overtime Income Share (NEW)
    const amsaluOvertimeIncome = amsaluOvertimeShare;
    
    // Step 8: Out-of-Pocket Expense Share (Deduction - reimbursement to Kes)
    const amsaluOutOfPocketDeduction = kesOutOfPocketAmsaluShare;
    
    // FINAL NET PAYOUT (includes overtime, insurance, and out-of-pocket reimbursement)
    const amsaluNet = amsaluGrossShare + amsaluSalaryReceived - amsaluSalaryShare - amsaluEqubDeduction - amsaluBankShare - amsaluInsuranceShare + amsaluPrevBalanceValue + amsaluOvertimeIncome - amsaluOutOfPocketDeduction;

    // ========================================================================
    // KES YESHALEM (71.8% Shareholder / Main Owner) - 5 STEPS
    // ========================================================================
    // Step 1: Gross Income Share
    const kesYeshalemGrossShare = (income * SHAREHOLDERS.kesYeshalem.sharePercent) / 100;
    
    // Step 2: Shared Salary Expense Share
    const kesYeshalemSalaryShare = (totalSalaries * SHAREHOLDERS.kesYeshalem.sharePercent) / 100;
    
    // Step 3: Bank Loan Share
    const kesYeshalemBankShare = (bankPayment * SHAREHOLDERS.kesYeshalem.sharePercent) / 100;
    
    // Step 4: Misc Expenses Share (ONLY Kes Yeshalem pays this)
    const kesYeshalemMiscShare = (misc * SHAREHOLDERS.kesYeshalem.sharePercent) / 100;
    
    // Step 5: Previous Balance
    const kesYeshalemPrevBalanceValue = kesYeshalemPrev;
    
    // Step 6: Overtime Income Share (NEW)
    const kesYeshalemOvertimeIncome = kesYeshalemOvertimeShare;
    
    // Step 7: Out-of-Pocket Expense Reimbursement (Addition - gets reimbursed by others)
    // Kes paid the full amount, but only his share is his expense.
    // He gets reimbursed for what others owe (Smeneh's + Amsalu's shares)
    const kesOutOfPocketReimbursement = kesOutOfPocketSmenehShare + kesOutOfPocketAmsaluShare;
    
    // FINAL NET PAYOUT (includes overtime, insurance, and out-of-pocket reimbursement)
    const kesYeshalemNet = kesYeshalemGrossShare - kesYeshalemSalaryShare - kesYeshalemBankShare - kesYeshalemMiscShare - kesYeshalemInsuranceShare + kesYeshalemPrevBalanceValue + kesYeshalemOvertimeIncome - kesOutOfPocketKesShare + kesOutOfPocketReimbursement;

    // ========================================================================
    // VERIFICATION
    // ========================================================================
    const totalNetPayout = amsaluNet + smenehNet + kesYeshalemNet;
    const actualTotalExpenses = bankPayment + misc + amsaluEq + smenehEq;
    const expectedTotal = income - actualTotalExpenses;

    return {
      income,
      overtime,
      bankPayment,
      miscExpenses: misc,
      insurance,
      totalSalaries,
      overtimeDistribution: {
        total: overtime,
        kesYeshalemShare: kesYeshalemOvertimeShare,
        smenehShare: smenehOvertimeShare,
        amsaluShare: amsaluOvertimeShare,
      },
      insuranceShares: {
        kesYeshalem: kesYeshalemInsuranceShare,
        smeneh: smenehInsuranceShare,
        amsalu: amsaluInsuranceShare,
      },
      kesOutOfPocketExpense: {
        total: kesOutOfPocketExpense,
        kesYeshalemShare: kesOutOfPocketKesShare,
        smenehShare: kesOutOfPocketSmenehShare,
        amsaluShare: kesOutOfPocketAmsaluShare,
        reimbursementToKes: kesOutOfPocketReimbursement,
      },
      amsalu: {
        grossShare: amsaluGrossShare,
        salary: amsaluSal,
        salaryShare: amsaluSalaryShare,
        equb: amsaluEq,
        bankShare: amsaluBankShare,
        insuranceShare: amsaluInsuranceShare,
        overtimeShare: amsaluOvertimeIncome,
        outOfPocketShare: amsaluOutOfPocketDeduction,
        prevBalance: amsaluPrev,
        netPayout: amsaluNet,
      },
      smeneh: {
        grossShare: smenehGrossShare,
        salary: smenehSal,
        salaryShare: smenehSalaryShare,
        equb: smenehEq,
        bankShare: smenehBankShare,
        insuranceShare: smenehInsuranceShare,
        overtimeShare: smenehOvertimeIncome,
        outOfPocketShare: smenehOutOfPocketDeduction,
        prevBalance: smenehPrev,
        netPayout: smenehNet,
      },
      kesYeshalem: {
        grossShare: kesYeshalemGrossShare,
        salaryShare: kesYeshalemSalaryShare,
        bankShare: kesYeshalemBankShare,
        miscShare: kesYeshalemMiscShare,
        insuranceShare: kesYeshalemInsuranceShare,
        overtimeShare: kesYeshalemOvertimeIncome,
        outOfPocketExpense: kesOutOfPocketExpense,
        outOfPocketShare: kesOutOfPocketKesShare,
        outOfPocketReimbursement: kesOutOfPocketReimbursement,
        prevBalance: kesYeshalemPrev,
        netPayout: kesYeshalemNet,
      },
      verification: {
        totalNetPayout,
        actualTotalExpenses,
        expectedTotal,
        isBalanced: Math.abs(totalNetPayout - expectedTotal) < 0.01, // Allow 1 cent rounding difference
      },
    };
  };

  const calculations = calculateFinancials();

  // ============================================================================
  // MONTH SAVE & CARRYOVER LOGIC
  // ============================================================================

  /**
   * Save current month's calculations and carry forward net balances
   */
  const handleSaveMonth = () => {
    if (!selectedMonth || !selectedYear) {
      alert('Please select both month and year');
      return;
    }

    const monthData = {
      month: currentMonth,
      date: new Date().toISOString(),
      inputs: {
        grossIncome: safeParseFloat(grossIncome),
        overtimeIncome: safeParseFloat(overtimeIncome),
        bankInstallment: safeParseFloat(bankInstallment),
        miscExpenses: safeParseFloat(miscExpenses),
        insurancePayment: safeParseFloat(insurancePayment),
        kesOutOfPocket: safeParseFloat(kesOutOfPocket),
        amsaluSalary: safeParseFloat(amsaluSalary),
        amsaluEqub: safeParseFloat(amsaluEqub),
        smenehSalary: safeParseFloat(smenehSalary),
        smenehEqub: safeParseFloat(smenehEqub),
        amsaluPrevBalance: safeParseFloat(amsaluPrevBalance),
        smenehPrevBalance: safeParseFloat(smenehPrevBalance),
        kesYeshalemPrevBalance: safeParseFloat(kesYeshalemPrevBalance),
      },
      results: calculations,
      comment: '', // Initialize empty comment field
    };

    const newHistory = [monthData, ...monthlyHistory];
    setMonthlyHistory(newHistory);
    localStorage.setItem('vehicleAccountingHistory', JSON.stringify(newHistory));

    // Carry forward net payouts to next month's previous balances
    setAmsaluPrevBalance(calculations.amsalu.netPayout.toString());
    setSmenehPrevBalance(calculations.smeneh.netPayout.toString());
    setKesYeshalemPrevBalance(calculations.kesYeshalem.netPayout.toString());

    // Reset monthly inputs
    setGrossIncome('');
    setOvertimeIncome('');
    setBankInstallment('');
    setMiscExpenses('');
    setInsurancePayment('');
    setKesOutOfPocket('');
    setAmsaluSalary('');
    setAmsaluEqub('');
    setSmenehSalary('');
    setSmenehEqub('');

    // Log the save action
    const log = createAuditLog(
      AUDIT_ACTIONS.ADD_COMMENT,
      { monthName: currentMonth, comment: 'Month saved successfully' },
      user
    );
    saveAuditLog(log);

    // Advance to next month
    const currentMonthIndex = MONTHS.findIndex(m => m.value === selectedMonth);
    if (currentMonthIndex === 12) {
      // Pagume (13th month) -> Meskerem (1st month) next year
      setSelectedMonth('Meskerem');
      setSelectedYear((parseInt(selectedYear) + 1).toString());
    } else {
      // Advance to next month in Ethiopian calendar
      setSelectedMonth(MONTHS[currentMonthIndex + 1].value);
    }

    alert('Month saved successfully! Balances carried forward to next month.');
  };

  /**
   * Print current dashboard
   */
  const handlePrint = () => {
    window.print();
  };

  /**
   * Delete a specific month from history (DEPRECATED - Use soft delete instead)
   */
  const handleDeleteMonthOld = (index) => {
    if (window.confirm('Are you sure you want to delete this month record? This action cannot be undone.')) {
      const newHistory = monthlyHistory.filter((_, idx) => idx !== index);
      setMonthlyHistory(newHistory);
      localStorage.setItem('vehicleAccountingHistory', JSON.stringify(newHistory));
    }
  };

  /**
   * Initiate soft delete with reason modal
   */
  const handleDeleteMonth = (index) => {
    const record = monthlyHistory[index];
    setDeleteModal({
      isOpen: true,
      index,
      monthName: record.month,
    });
  };

  /**
   * Confirm soft delete and move to pending deletions
   */
  const confirmDeleteMonth = (reason) => {
    const index = deleteModal.index;
    const record = monthlyHistory[index];
    
    // Move to pending deletions with 3-day grace period
    const deletion = {
      ...record,
      deletedAt: Date.now(),
      deletionReason: reason,
      deletedBy: user.username,
    };
    
    const newPending = [...pendingDeletions, deletion];
    setPendingDeletions(newPending);
    localStorage.setItem('pendingDeletions', JSON.stringify(newPending));
    
    // Remove from active history
    const newHistory = monthlyHistory.filter((_, idx) => idx !== index);
    setMonthlyHistory(newHistory);
    localStorage.setItem('vehicleAccountingHistory', JSON.stringify(newHistory));
    
    // Log the deletion
    const log = createAuditLog(
      AUDIT_ACTIONS.DELETE_MONTH,
      { monthName: record.month, reason },
      user
    );
    saveAuditLog(log);
    
    setDeleteModal({ isOpen: false, index: null, monthName: '' });
  };

  /**
   * Restore a month from pending deletions
   */
  const handleRestoreMonth = (index) => {
    const deletion = pendingDeletions[index];
    
    // Remove from pending deletions
    const newPending = pendingDeletions.filter((_, idx) => idx !== index);
    setPendingDeletions(newPending);
    localStorage.setItem('pendingDeletions', JSON.stringify(newPending));
    
    // Add back to history
    const restoredRecord = { ...deletion };
    delete restoredRecord.deletedAt;
    delete restoredRecord.deletionReason;
    delete restoredRecord.deletedBy;
    
    const newHistory = [restoredRecord, ...monthlyHistory];
    setMonthlyHistory(newHistory);
    localStorage.setItem('vehicleAccountingHistory', JSON.stringify(newHistory));
    
    // Log the restoration
    const log = createAuditLog(
      AUDIT_ACTIONS.RESTORE_MONTH,
      { monthName: deletion.month },
      user
    );
    saveAuditLog(log);
    
    alert(renderLabel('Month restored successfully', 'ወር በተሳካ ሁኔታ ተመልሷል'));
  };

  /**
   * Restore a record from recycle bin
   */
  const handleRestoreFromRecycleBin = (index) => {
    const record = recycleBin[index];
    
    // Remove from recycle bin
    const newBin = recycleBin.filter((_, idx) => idx !== index);
    setRecycleBin(newBin);
    localStorage.setItem('recycleBin', JSON.stringify(newBin));
    
    // Add back to history
    const restoredRecord = { ...record };
    delete restoredRecord.deletedAt;
    delete restoredRecord.deletionReason;
    delete restoredRecord.deletedBy;
    delete restoredRecord.deletionType;
    
    const newHistory = [restoredRecord, ...monthlyHistory];
    setMonthlyHistory(newHistory);
    localStorage.setItem('vehicleAccountingHistory', JSON.stringify(newHistory));
    
    // Log the restoration
    const log = createAuditLog(
      AUDIT_ACTIONS.RESTORE_MONTH,
      { monthName: record.month, source: 'recycle_bin' },
      user
    );
    saveAuditLog(log);
    
    alert(renderLabel('Record restored successfully', 'መዝገብ በተሳካ ሁኔታ ተመልሷል'));
  };

  /**
   * Permanently delete a record from recycle bin
   */
  const handlePermanentDelete = (index) => {
    if (!window.confirm(renderLabel(
      'Permanently delete this record? This action cannot be undone!',
      'ይህን መዝገብ ለዘለዓለም ይሰርዙ? ይህ ድርጊት መልሰው ማግኘት አይችሉም!'
    ))) return;
    
    const record = recycleBin[index];
    
    // Remove from recycle bin
    const newBin = recycleBin.filter((_, idx) => idx !== index);
    setRecycleBin(newBin);
    localStorage.setItem('recycleBin', JSON.stringify(newBin));
    
    // Log permanent deletion
    const log = createAuditLog(
      AUDIT_ACTIONS.PERMANENT_DELETE,
      { monthName: record.month, deletionReason: record.deletionReason },
      user
    );
    saveAuditLog(log);
    
    alert(renderLabel('Record permanently deleted', 'መዝገብ ለዘለዓለም ተሰርዟል'));
  };

  /**
   * Empty entire recycle bin
   */
  const handleEmptyRecycleBin = () => {
    if (!window.confirm(renderLabel(
      `Permanently delete all ${recycleBin.length} records? This action cannot be undone!`,
      `ሁሉንም ${recycleBin.length} መዝገቦች ለዘለዓለም ይሰርዙ? ይህ ድርጊት መልሰው ማግኘት አይችሉም!`
    ))) return;
    
    // Log each permanent deletion
    recycleBin.forEach(record => {
      const log = createAuditLog(
        AUDIT_ACTIONS.PERMANENT_DELETE,
        { monthName: record.month, deletionReason: record.deletionReason, source: 'empty_bin' },
        user
      );
      saveAuditLog(log);
    });
    
    // Clear recycle bin
    setRecycleBin([]);
    localStorage.removeItem('recycleBin');
    
    alert(renderLabel('Recycle bin emptied', 'ቆሻሻ መጣያ ባዶ ሆኗል'));
  };

  /**
   * Initiate edit with modal
   */
  const handleEditMonth = (index) => {
    const record = monthlyHistory[index];
    setEditModal({
      isOpen: true,
      data: record,
      index,
    });
  };

  /**
   * Confirm edit with reason
   */
  const confirmEditMonth = (newInputs) => {
    // This would need a reason modal first, but for simplicity, we'll prompt
    const reason = prompt(renderLabel('Enter reason for edit:', 'የማስተካከል ምክንያት ያስገቡ:'));
    if (!reason) return;
    
    const index = editModal.index;
    const record = monthlyHistory[index];
    
    // Recalculate with new inputs
    const updatedRecord = {
      ...record,
      inputs: newInputs,
      // Would need to recalculate results here
      lastEditedAt: new Date().toISOString(),
      lastEditedBy: user.username,
      editReason: reason,
    };
    
    const newHistory = [...monthlyHistory];
    newHistory[index] = updatedRecord;
    setMonthlyHistory(newHistory);
    localStorage.setItem('vehicleAccountingHistory', JSON.stringify(newHistory));
    
    // Log the edit
    const log = createAuditLog(
      AUDIT_ACTIONS.EDIT_MONTH,
      { monthName: record.month, reason, changes: newInputs },
      user
    );
    saveAuditLog(log);
    
    setEditModal({ isOpen: false, data: null, index: null });
  };

  /**
   * Open comment modal
   */
  const handleAddComment = (index) => {
    const record = monthlyHistory[index];
    setCommentModal({
      isOpen: true,
      index,
      monthName: record.month,
      comment: record.comment || '',
    });
  };

  /**
   * Save comment
   */
  const saveComment = (comment) => {
    const index = commentModal.index;
    const record = monthlyHistory[index];
    
    const updatedRecord = {
      ...record,
      comment,
      commentedAt: new Date().toISOString(),
      commentedBy: user.username,
    };
    
    const newHistory = [...monthlyHistory];
    newHistory[index] = updatedRecord;
    setMonthlyHistory(newHistory);
    localStorage.setItem('vehicleAccountingHistory', JSON.stringify(newHistory));
    
    // Log the comment
    const log = createAuditLog(
      AUDIT_ACTIONS.ADD_COMMENT,
      { monthName: record.month, comment },
      user
    );
    saveAuditLog(log);
    
    setCommentModal({ isOpen: false, index: null, monthName: '', comment: '' });
  };

  /**
   * Initiate clear all history with reason modal (Admin only)
   */
  const handleClearAllHistory = () => {
    setClearHistoryModal({
      isOpen: true,
      totalRecords: monthlyHistory.length,
    });
  };

  /**
   * Confirm clear all history and move to recycle bin
   */
  const confirmClearAllHistory = (reason) => {
    if (!monthlyHistory.length) return;
    
    // Move all records to recycle bin
    const deletedRecords = monthlyHistory.map(record => ({
      ...record,
      deletedAt: Date.now(),
      deletionReason: reason,
      deletedBy: user.username,
      deletionType: 'CLEAR_ALL',
    }));
    
    const newRecycleBin = [...recycleBin, ...deletedRecords];
    setRecycleBin(newRecycleBin);
    localStorage.setItem('recycleBin', JSON.stringify(newRecycleBin));
    
    // Clear active history
    setMonthlyHistory([]);
    localStorage.setItem('vehicleAccountingHistory', JSON.stringify([]));
    
    // Log the action
    const log = createAuditLog(
      AUDIT_ACTIONS.CLEAR_HISTORY,
      { reason, recordsCount: monthlyHistory.length },
      user
    );
    saveAuditLog(log);
    
    setClearHistoryModal({ isOpen: false, totalRecords: 0 });
    alert(renderLabel(
      `${monthlyHistory.length} records moved to Recycle Bin. You can restore them within 3 days.`,
      `${monthlyHistory.length} መዝገቦች ወደ ቆሻሻ መጣያ ተንቀሳቅሰዋል። በ3 ቀናት ውስጥ መመለስ ይችላሉ።`
    ));
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderLabel = (en, am) => {
    if (language === 'english') return en;
    if (language === 'amharic') return am;
    return `${am} / ${en}`;
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                {renderLabel('Vehicle Accounting Dashboard', 'የተሽከርካሪ የሂሳብ ማስተዳደሪያ')}
              </h1>
              <p className="text-gray-600">
                {renderLabel('Shared Commercial Vehicle Financial Management System', 'የጋራ የንግድ ተሽከርካሪ የፋይናንስ አስተዳደር ስርዓት')}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {/* User Badge with Logout */}
              <div className="flex items-center gap-3 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2">
                  <Shield className="text-indigo-600" size={20} />
                  <div className="text-sm">
                    <p className="font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-600">
                      {language === 'amharic' 
                        ? user.permissions.displayNameAm 
                        : language === 'both' 
                        ? `${user.permissions.displayNameAm} / ${user.permissions.displayName}`
                        : user.permissions.displayName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={renderLabel('Logout', 'ውጣ')}
                >
                  <LogOut size={18} />
                </button>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2 no-print">
                <button
                  onClick={() => setLanguage(language === 'both' ? 'english' : language === 'english' ? 'amharic' : 'both')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                >
                  {language === 'both' ? 'አማ/Eng' : language === 'english' ? 'English' : 'አማርኛ'}
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <History size={18} />
                  {renderLabel('History', 'ታሪክ')}
                </button>
                {hasPermission('canDelete') && recycleBin.length > 0 && (
                  <button
                    onClick={() => setShowRecycleBin(!showRecycleBin)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 relative"
                  >
                    <Trash size={18} />
                    {renderLabel('Recycle Bin', 'ቆሻሻ መጣያ')}
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                      {recycleBin.length}
                    </span>
                  </button>
                )}
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Printer size={18} />
                  {renderLabel('Print', 'አትም')}
                </button>
              </div>
            </div>
          </div>

          {/* Shareholder Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {SHAREHOLDER_ORDER.map((key) => {
              const sh = SHAREHOLDERS[key];
              return (
              <div key={key} className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                <h3 className="font-bold text-gray-800">{renderLabel(sh.name, sh.nameAm)}</h3>
                <p className="text-sm text-gray-600">{renderLabel(sh.role, sh.roleAm)}</p>
                <p className="text-lg font-semibold text-indigo-700 mt-2">{sh.sharePercent}%</p>
                <p className="text-xs text-gray-500">{renderLabel('Base Capital', 'መሠረታዊ ካፒታል')}: {formatCurrency(sh.baseCapital)}</p>
              </div>
            );
            })}
          </div>
        </div>

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 no-print">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{renderLabel('Monthly History', 'የወር ታሪክ')}</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              {monthlyHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{renderLabel('No history yet', 'ገና ታሪክ የለም')}</p>
              ) : (
                <div className="space-y-4">
                  {monthlyHistory.map((record, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-gray-50">
                      <h3 className="font-bold text-lg mb-2">{record.month}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="font-semibold">{renderLabel('Income', 'ገቢ')}:</span> {formatCurrency(record.inputs.grossIncome)}
                        </div>
                        <div>
                          <span className="font-semibold">{renderLabel('Amsalu Net', 'አምሳሉ ንጹህ')}:</span> 
                          <span className={record.results.amsalu.netPayout < 0 ? 'text-red-600' : 'text-green-600'}>
                            {' '}{formatCurrency(record.results.amsalu.netPayout)}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold">{renderLabel('Smeneh Net', 'ስመኔህ ንጹህ')}:</span>
                          <span className={record.results.smeneh.netPayout < 0 ? 'text-red-600' : 'text-green-600'}>
                            {' '}{formatCurrency(record.results.smeneh.netPayout)}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold">{renderLabel('Kes Yeshalem Net', 'ቄስ የሻለም ንጹህ')}:</span>
                          <span className={record.results.kesYeshalem.netPayout < 0 ? 'text-red-600' : 'text-green-600'}>
                            {' '}{formatCurrency(record.results.kesYeshalem.netPayout)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input Section - ONLY visible to Admin */}
        {hasPermission('canModifyInputs') && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="text-indigo-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">
              {renderLabel('Monthly Inputs', 'የወር ግብዓቶች')}
            </h2>
            <span className="ml-auto px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
              {renderLabel('Admin Only', 'የአስተዳዳሪ ብቻ')}
            </span>
          </div>

          {/* Current Month and Year Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {renderLabel('Select Month & Year', 'ወር እና ዓመት ይምረጡ')}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              {/* Month Dropdown */}
              <div>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 font-medium shadow-sm hover:border-indigo-400 transition-colors"
                >
                  <option value="">{renderLabel('-- Select Month --', '-- ወር ይምረጡ --')}</option>
                  {MONTHS.map((month) => (
                    <option key={month.value} value={month.value}>
                      {language === 'amharic' ? month.labelAm : language === 'both' ? `${month.labelAm} / ${month.label}` : month.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Dropdown */}
              <div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-gray-900 font-medium shadow-sm hover:border-indigo-400 transition-colors"
                >
                  <option value="">{renderLabel('-- Select Year --', '-- ዓመት ይምረጡ --')}</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Display Selected Month & Year */}
            {currentMonth && (
              <div className="mt-3 px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg inline-block">
                <span className="text-sm text-gray-600 mr-2">{renderLabel('Selected:', 'የተመረጠው:')}</span>
                <span className="font-bold text-indigo-700">{currentMonth}</span>
              </div>
            )}
          </div>

          {/* General Vehicle Financials - Full Width Section */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 border-2 border-indigo-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calculator className="text-indigo-600" size={24} />
                {renderLabel('General Financials', 'አጠቃላይ ፋይናንስ')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Monthly Gross Income', 'የወሩ አጠቃላይ ገቢ')}
                </label>
                <input
                  type="text"
                  value={formatNumberInput(grossIncome)}
                  onChange={(e) => setGrossIncome(e.target.value.replace(/,/g, ''))}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={!hasPermission('canEdit')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Monthly Overtime Income', 'የወር ኦቨርታይም ገቢ')}
                </label>
                <input
                  type="text"
                  value={formatNumberInput(overtimeIncome)}
                  onChange={(e) => setOvertimeIncome(e.target.value.replace(/,/g, ''))}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50"
                  placeholder="0.00"
                  disabled={!hasPermission('canEdit')}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {renderLabel('50% to Owner, 50% split 70/30 Driver/Assistant', '50% ለባለቤት፣ 50% 70/30 ለሾፌር/እረዳት')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Bank Loan Installment', 'የባንክ እዳ ክፍያ')}
                </label>
                <input
                  type="text"
                  value={formatNumberInput(bankInstallment)}
                  onChange={(e) => setBankInstallment(e.target.value.replace(/,/g, ''))}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={!hasPermission('canEdit')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Misc. Vehicle Expenses', 'የመኪና ወጪዎች')}
                </label>
                <input
                  type="text"
                  value={formatNumberInput(miscExpenses)}
                  onChange={(e) => setMiscExpenses(e.target.value.replace(/,/g, ''))}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={!hasPermission('canEdit')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Insurance Payment', 'የኢንሹራንስ ክፍያ')}
                </label>
                <input
                  type="text"
                  value={formatNumberInput(insurancePayment)}
                  onChange={(e) => setInsurancePayment(e.target.value.replace(/,/g, ''))}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-50"
                  placeholder="0.00"
                  disabled={!hasPermission('canEdit')}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {renderLabel('Shared by all shareholders by percentage', 'በሁሉም ባለአክሲዮኖች በመቶኛ ይጋራል')}
                </p>
              </div>
              </div>
            </div>
          </div>

          {/* Three Shareholders Section - Side by Side Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kes Yeshalem Section */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border-2 border-green-200 space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b-2 border-green-300 pb-2 flex items-center gap-2">
                <Shield className="text-green-600" size={20} />
                {renderLabel(`${SHAREHOLDERS.kesYeshalem.name} (${SHAREHOLDERS.kesYeshalem.role})`, `${SHAREHOLDERS.kesYeshalem.nameAm} (${SHAREHOLDERS.kesYeshalem.roleAm})`)}
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Previous Balance', 'የቀደመ ሂሳብ')}
                </label>
                <input
                  type="text"
                  value={formatNumberInput(kesYeshalemPrevBalance)}
                  onChange={(e) => setKesYeshalemPrevBalance(e.target.value.replace(/,/g, ''))}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={!hasPermission('canEdit')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Out-of-Pocket Expense / Cash Advance', 'የካሽ መቅደም / ከኪስ ወጪ')}
                </label>
                <input
                  type="text"
                  value={formatNumberInput(kesOutOfPocket)}
                  onChange={(e) => setKesOutOfPocket(e.target.value.replace(/,/g, ''))}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-yellow-50"
                  placeholder="0.00"
                  disabled={!hasPermission('canEdit')}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {renderLabel('Shared by all shareholders (71.8%, 12.6%, 15.6%)', 'በሁሉም ባለአክሲዮኖች ይጋራል (71.8%, 12.6%, 15.6%)')}
                </p>
              </div>
              
              <div className="pt-3 border-t border-green-200">
                <p className="text-xs text-gray-600 font-semibold">
                  {renderLabel('Equity Share', 'የአክሲዮን ድርሻ')}: {SHAREHOLDERS.kesYeshalem.sharePercent}%
                </p>
              </div>
            </div>

            {/* Smeneh Section */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-5 border-2 border-purple-200 space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b-2 border-purple-300 pb-2 flex items-center gap-2">
                <User className="text-purple-600" size={20} />
                {renderLabel(`${SHAREHOLDERS.smeneh.name} (${SHAREHOLDERS.smeneh.role})`, `${SHAREHOLDERS.smeneh.nameAm} (${SHAREHOLDERS.smeneh.roleAm})`)}
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Monthly Salary', 'የወር ደሞዝ')}
                </label>
                <input
                  type="text"
                  value={formatNumberInput(smenehSalary)}
                  onChange={(e) => setSmenehSalary(e.target.value.replace(/,/g, ''))}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={!hasPermission('canEdit')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Monthly Equb', 'የወር እቁብ')}
                </label>
                <input
                  type="text"
                  value={formatNumberInput(smenehEqub)}
                  onChange={(e) => setSmenehEqub(e.target.value.replace(/,/g, ''))}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={!hasPermission('canEdit')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Previous Balance', 'የቀደመ ሂሳብ')}
                </label>
                <input
                  type="text"
                  value={formatNumberInput(smenehPrevBalance)}
                  onChange={(e) => setSmenehPrevBalance(e.target.value.replace(/,/g, ''))}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={!hasPermission('canEdit')}
                />
              </div>
              
              <div className="pt-3 border-t border-purple-200">
                <p className="text-xs text-gray-600 font-semibold">
                  {renderLabel('Equity Share', 'የአክሲዮን ድርሻ')}: {SHAREHOLDERS.smeneh.sharePercent}%
                </p>
              </div>
            </div>

            {/* Amsalu Section */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border-2 border-blue-200 space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b-2 border-blue-300 pb-2 flex items-center gap-2">
                <User className="text-blue-600" size={20} />
                {renderLabel(`${SHAREHOLDERS.amsalu.name} (${SHAREHOLDERS.amsalu.role})`, `${SHAREHOLDERS.amsalu.nameAm} (${SHAREHOLDERS.amsalu.roleAm})`)}
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Monthly Salary', 'የወር ደሞዝ')}
                </label>
                <input
                  type="text"
                  value={formatNumberInput(amsaluSalary)}
                  onChange={(e) => setAmsaluSalary(e.target.value.replace(/,/g, ''))}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={!hasPermission('canEdit')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Monthly Equb', 'የወር እቁብ')}
                </label>
                <input
                  type="text"
                  value={formatNumberInput(amsaluEqub)}
                  onChange={(e) => setAmsaluEqub(e.target.value.replace(/,/g, ''))}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={!hasPermission('canEdit')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Previous Balance', 'የቀደመ ሂሳብ')}
                </label>
                <input
                  type="text"
                  value={formatNumberInput(amsaluPrevBalance)}
                  onChange={(e) => setAmsaluPrevBalance(e.target.value.replace(/,/g, ''))}
                  className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  disabled={!hasPermission('canEdit')}
                />
              </div>
              
              <div className="pt-3 border-t border-blue-200">
                <p className="text-xs text-gray-600 font-semibold">
                  {renderLabel('Equity Share', 'የአክሲዮን ድርሻ')}: {SHAREHOLDERS.amsalu.sharePercent}%
                </p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="text-green-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">
                {renderLabel('Final Net Payouts', 'የመጨረሻ ንጹህ ክፍያዎች')}
              </h2>
            </div>
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="no-print px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Info size={18} />
              {showBreakdown ? renderLabel('Hide Breakdown', 'ዝርዝር ደብቅ') : renderLabel('Show Breakdown', 'ዝርዝር አሳይ')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Kes Yeshalem Result */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {renderLabel(SHAREHOLDERS.kesYeshalem.name, SHAREHOLDERS.kesYeshalem.nameAm)}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {SHAREHOLDERS.kesYeshalem.sharePercent}% {renderLabel('Share', 'ድርሻ')}
              </p>
              <div className={`text-3xl font-bold ${calculations.kesYeshalem.netPayout < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(calculations.kesYeshalem.netPayout)}
              </div>
              {calculations.kesYeshalem.netPayout < 0 && (
                <p className="text-red-600 text-sm mt-2">{renderLabel('(Debt/Loss)', '(እዳ/ኪሳራ)')}</p>
              )}
            </div>

            {/* Smeneh Result */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {renderLabel(SHAREHOLDERS.smeneh.name, SHAREHOLDERS.smeneh.nameAm)}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {SHAREHOLDERS.smeneh.sharePercent}% {renderLabel('Share', 'ድርሻ')}
              </p>
              <div className={`text-3xl font-bold ${calculations.smeneh.netPayout < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(calculations.smeneh.netPayout)}
              </div>
              {calculations.smeneh.netPayout < 0 && (
                <p className="text-red-600 text-sm mt-2">{renderLabel('(Debt/Loss)', '(እዳ/ኪሳራ)')}</p>
              )}
            </div>

            {/* Amsalu Result */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-indigo-200">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {renderLabel(SHAREHOLDERS.amsalu.name, SHAREHOLDERS.amsalu.nameAm)}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {SHAREHOLDERS.amsalu.sharePercent}% {renderLabel('Share', 'ድርሻ')}
              </p>
              <div className={`text-3xl font-bold ${calculations.amsalu.netPayout < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(calculations.amsalu.netPayout)}
              </div>
              {calculations.amsalu.netPayout < 0 && (
                <p className="text-red-600 text-sm mt-2">{renderLabel('(Debt/Loss)', '(እዳ/ኪሳራ)')}</p>
              )}
            </div>
          </div>

          {/* Verification Alert */}
          {!calculations.verification.isBalanced && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-semibold">
                ⚠️ {renderLabel('Warning: Calculation verification failed. Please check inputs.', 'ማስጠንቀቂያ: የሂሳብ ማረጋገጫ አልተሳካም። እባክዎ ግብዓቶችን ያረጋግጡ።')}
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                {renderLabel('Total Net', 'ጠቅላላ ንጹህ')}: {formatCurrency(calculations.verification.totalNetPayout)} | 
                {renderLabel(' Expected', ' የሚጠበቀው')}: {formatCurrency(calculations.verification.expectedTotal)}
              </p>
            </div>
          )}
        </div>

        {/* Detailed Breakdown (Collapsible) */}
        {showBreakdown && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {renderLabel('Detailed Financial Breakdown', 'ዝርዝር የፋይናንስ ትንተና')}
            </h2>

            {/* Kes Yeshalem Breakdown - SHOWN FIRST */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-300">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {renderLabel(SHAREHOLDERS.kesYeshalem.name, SHAREHOLDERS.kesYeshalem.nameAm)} {renderLabel('- Calculation Steps', '- የሂሳብ ደረጃዎች')}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{renderLabel('1. Gross Income Share', '1. ጠቅላላ ገቢ ድርሻ')} ({SHAREHOLDERS.kesYeshalem.sharePercent}%):</span>
                  <span className="font-semibold text-green-600">+{formatCurrency(calculations.kesYeshalem.grossShare)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{renderLabel('2. Bank Loan Direct Share', '2. የባንክ እዳ ቀጥታ ድርሻ')} ({SHAREHOLDERS.kesYeshalem.sharePercent}%):</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(calculations.kesYeshalem.bankShare)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{renderLabel('3. Insurance Payment Share', '3. የኢንሹራንስ ክፍያ ድርሻ')} ({SHAREHOLDERS.kesYeshalem.sharePercent}%):</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(calculations.kesYeshalem.insuranceShare)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{renderLabel('4. Misc Expenses Direct Share', '4. ልዩ ወጪዎች ቀጥታ ድርሻ')} ({SHAREHOLDERS.kesYeshalem.sharePercent}%):</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(calculations.kesYeshalem.miscShare)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-2">
                  <span className="font-medium">{renderLabel('5. Shared Salary Expense', '5. የጋራ ደሞዝ ወጪ')} ({SHAREHOLDERS.kesYeshalem.sharePercent}% of {formatCurrency(calculations.totalSalaries)}):</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(calculations.kesYeshalem.salaryShare)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{renderLabel('6. Previous Balance', '6. የቀደመ ሂሳብ')}:</span>
                  <span className={`font-semibold ${calculations.kesYeshalem.prevBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculations.kesYeshalem.prevBalance >= 0 ? '+' : ''}{formatCurrency(calculations.kesYeshalem.prevBalance)}
                  </span>
                </div>
                {calculations.overtimeDistribution.total > 0 && (
                  <div className="flex justify-between bg-green-100 p-2 rounded">
                    <span className="font-medium">{renderLabel('7. Overtime Income (50%)', '7. የኦቨርታይም ገቢ (50%)')}</span>
                    <span className="font-semibold text-green-600">+{formatCurrency(calculations.kesYeshalem.overtimeShare)}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-400 pt-2 mt-2 flex justify-between text-lg">
                  <span className="font-bold">{renderLabel('FINAL NET PAYOUT', 'የመጨረሻ ንጹህ ክፍያ')}:</span>
                  <span className={`font-bold ${calculations.kesYeshalem.netPayout >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculations.kesYeshalem.netPayout)}
                  </span>
                </div>
              </div>
            </div>

            {/* Smeneh Breakdown - SHOWN SECOND - 7 STEPS (with Overtime) */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {renderLabel(SHAREHOLDERS.smeneh.name, SHAREHOLDERS.smeneh.nameAm)} {renderLabel('- Calculation Steps', '- የሂሳብ ደረጃዎች')}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-medium text-gray-700">
                  <span>{renderLabel('Step 1: Gross Income Share', 'ደረጃ 1: ጠቅላላ ገቢ ድርሻ')} ({SHAREHOLDERS.smeneh.sharePercent}%)</span>
                  <span className="text-green-600">+{formatCurrency(calculations.smeneh.grossShare)}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-700">
                  <span>{renderLabel('Step 2: Driver Salary Received', 'ደረጃ 2: የተቀበለው ደሞዝ')}</span>
                  <span className="text-green-600">+{formatCurrency(calculations.smeneh.salary)}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-700">
                  <span>{renderLabel('Step 3: Shared Salary Expense', 'ደረጃ 3: የጋራ ደሞዝ ወጪ')} ({SHAREHOLDERS.smeneh.sharePercent}% of {formatCurrency(calculations.totalSalaries)})</span>
                  <span className="text-red-600">-{formatCurrency(calculations.smeneh.salaryShare)}</span>
                </div>
                <div className="flex justify-between bg-yellow-50 p-2 rounded font-medium text-gray-700">
                  <span>{renderLabel('Step 4: Personal Equb (Not Shared)', 'ደረጃ 4: የግል እቁብ (ያልተጋራ)')}</span>
                  <span className="text-red-600">-{formatCurrency(calculations.smeneh.equb)}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-700">
                  <span>{renderLabel('Step 5: Bank Loan Share', 'ደረጃ 5: የባንክ እዳ ድርሻ')} ({SHAREHOLDERS.smeneh.sharePercent}%)</span>
                  <span className="text-red-600">-{formatCurrency(calculations.smeneh.bankShare)}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-700">
                  <span>{renderLabel('Step 6: Insurance Payment Share', 'ደረጃ 6: የኢንሹራንስ ክፍያ ድርሻ')} ({SHAREHOLDERS.smeneh.sharePercent}%)</span>
                  <span className="text-red-600">-{formatCurrency(calculations.smeneh.insuranceShare)}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-700">
                  <span>{renderLabel('Step 7: Previous Balance', 'ደረጃ 7: የቀደመ ሂሳብ')}</span>
                  <span className={calculations.smeneh.prevBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {calculations.smeneh.prevBalance >= 0 ? '+' : ''}{formatCurrency(calculations.smeneh.prevBalance)}
                  </span>
                </div>
                {calculations.overtimeDistribution.total > 0 && (
                  <div className="flex justify-between bg-green-100 p-2 rounded font-medium text-gray-700">
                    <span>{renderLabel('Step 8: Overtime Income (70% of 50%)', 'ደረጃ 8: የኦቨርታይም ገቢ (70% ከ50%)')}</span>
                    <span className="text-green-600">+{formatCurrency(calculations.smeneh.overtimeShare)}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-400 pt-2 mt-2 flex justify-between text-lg">
                  <span className="font-bold">{renderLabel('FINAL NET PAYOUT', 'የመጨረሻ ንጹህ ክፍያ')}:</span>
                  <span className={`font-bold ${calculations.smeneh.netPayout >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculations.smeneh.netPayout)}
                  </span>
                </div>
              </div>
            </div>

            {/* Amsalu Breakdown - SHOWN THIRD - 7 STEPS (with Overtime) */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {renderLabel(SHAREHOLDERS.amsalu.name, SHAREHOLDERS.amsalu.nameAm)} {renderLabel('- Calculation Steps', '- የሂሳብ ደረጃዎች')}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-medium text-gray-700">
                  <span>{renderLabel('Step 1: Gross Income Share', 'ደረጃ 1: ጠቅላላ ገቢ ድርሻ')} ({SHAREHOLDERS.amsalu.sharePercent}%)</span>
                  <span className="text-green-600">+{formatCurrency(calculations.amsalu.grossShare)}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-700">
                  <span>{renderLabel('Step 2: Assistant Salary Received', 'ደረጃ 2: የተቀበለው ደሞዝ')}</span>
                  <span className="text-green-600">+{formatCurrency(calculations.amsalu.salary)}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-700">
                  <span>{renderLabel('Step 3: Shared Salary Expense', 'ደረጃ 3: የጋራ ደሞዝ ወጪ')} ({SHAREHOLDERS.amsalu.sharePercent}% of {formatCurrency(calculations.totalSalaries)})</span>
                  <span className="text-red-600">-{formatCurrency(calculations.amsalu.salaryShare)}</span>
                </div>
                <div className="flex justify-between bg-yellow-50 p-2 rounded font-medium text-gray-700">
                  <span>{renderLabel('Step 4: Personal Equb (Not Shared)', 'ደረጃ 4: የግል እቁብ (ያልተጋራ)')}</span>
                  <span className="text-red-600">-{formatCurrency(calculations.amsalu.equb)}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-700">
                  <span>{renderLabel('Step 5: Bank Loan Share', 'ደረጃ 5: የባንክ እዳ ድርሻ')} ({SHAREHOLDERS.amsalu.sharePercent}%)</span>
                  <span className="text-red-600">-{formatCurrency(calculations.amsalu.bankShare)}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-700">
                  <span>{renderLabel('Step 6: Insurance Payment Share', 'ደረጃ 6: የኢንሹራንስ ክፍያ ድርሻ')} ({SHAREHOLDERS.amsalu.sharePercent}%)</span>
                  <span className="text-red-600">-{formatCurrency(calculations.amsalu.insuranceShare)}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-700">
                  <span>{renderLabel('Step 7: Previous Balance', 'ደረጃ 7: የቀደመ ሂሳብ')}</span>
                  <span className={calculations.amsalu.prevBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {calculations.amsalu.prevBalance >= 0 ? '+' : ''}{formatCurrency(calculations.amsalu.prevBalance)}
                  </span>
                </div>
                {calculations.overtimeDistribution.total > 0 && (
                  <div className="flex justify-between bg-green-100 p-2 rounded font-medium text-gray-700">
                    <span>{renderLabel('Step 8: Overtime Income (30% of 50%)', 'ደረጃ 8: የኦቨርታይም ገቢ (30% ከ50%)')}</span>
                    <span className="text-green-600">+{formatCurrency(calculations.amsalu.overtimeShare)}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-400 pt-2 mt-2 flex justify-between text-lg">
                  <span className="font-bold">{renderLabel('FINAL NET PAYOUT', 'የመጨረሻ ንጹህ ክፍያ')}:</span>
                  <span className={`font-bold ${calculations.amsalu.netPayout >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculations.amsalu.netPayout)}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {renderLabel('Summary & Verification', 'ማጠቃለያ እና ማረጋገጫ')}
              </h3>
              
              {/* Expense Classification Info - UPDATED TO CLARIFY MISC IS KES YESHALEM ONLY */}
              <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-sm">
                <p className="font-semibold mb-2">{renderLabel('Income & Expense Classification', 'የገቢ እና ወጪ ምደባ')}:</p>
                <p className="text-gray-700">
                  <span className="font-medium text-green-700">{renderLabel('Overtime Income Distribution', 'የኦቨርታይም ገቢ ክፍፍል')}:</span> {renderLabel('50% to Owner, 50% split 70% Driver / 30% Assistant', '50% ለባለቤት፣ 50% 70% ለሾፌር / 30% ለእረዳት')}
                </p>
                <p className="text-gray-700 mt-1">
                  <span className="font-medium">{renderLabel('Shared by ALL (% based)', 'በሁሉም የሚጋራ (በ% የሚሰላ)')}:</span> {renderLabel('Bank Loan, Total Salaries, Insurance', 'የባንክ እዳ፣ ጠቅላላ ደሞዞች፣ ኢንሹራንስ')}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">{renderLabel('Kes Yeshalem ONLY (71.8%)', 'ቄስ የሻለም ብቻ (71.8%)')}:</span> {renderLabel('Misc Expenses', 'ልዩ ወጪዎች')}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">{renderLabel('Personal (Direct)', 'የግል (ቀጥታ)')}:</span> {renderLabel('Equb - Never shared', 'እቁብ - በጭራሽ አይጋራም')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-semibold">{renderLabel('Total Gross Income', 'ጠቅላላ ገቢ')}:</span> {formatCurrency(calculations.income)}</p>
                  {calculations.overtime > 0 && (
                    <p className="bg-green-50 p-2 rounded"><span className="font-semibold text-green-700">{renderLabel('Total Overtime Income', 'ጠቅላላ ኦቨርታይም ገቢ')}:</span> {formatCurrency(calculations.overtime)}</p>
                  )}
                  <p><span className="font-semibold">{renderLabel('Bank Loan Payment', 'የባንክ እዳ ክፍያ')}:</span> {formatCurrency(calculations.bankPayment)}</p>
                  {calculations.insurance > 0 && (
                    <p className="bg-purple-50 p-2 rounded"><span className="font-semibold text-purple-700">{renderLabel('Insurance Payment (Shared)', 'የኢንሹራንስ ክፍያ (የጋራ)')}:</span> {formatCurrency(calculations.insurance)}</p>
                  )}
                  <p><span className="font-semibold">{renderLabel('Misc Expenses', 'ልዩ ወጪዎች')}:</span> {formatCurrency(calculations.miscExpenses)}</p>
                  <p className="border-t pt-2 mt-2"><span className="font-semibold">{renderLabel('Total Salaries (Shared)', 'ጠቅላላ ደሞዞች (የጋራ)')}:</span> {formatCurrency(calculations.totalSalaries)}</p>
                </div>
                <div>
                  <p><span className="font-semibold">{renderLabel('Total Net Payouts', 'ጠቅላላ ንጹህ ክፍያዎች')}:</span> {formatCurrency(calculations.verification.totalNetPayout)}</p>
                  <p><span className="font-semibold">{renderLabel('Expected Total', 'የሚጠበቀው ጠቅላላ')}:</span> {formatCurrency(calculations.verification.expectedTotal)}</p>
                  <p className={`font-semibold ${calculations.verification.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                    {calculations.verification.isBalanced 
                      ? renderLabel('✓ Calculations Balanced', '✓ ሂሳቦች ተመጣጠኑ') 
                      : renderLabel('✗ Not Balanced', '✗ ሚዛናዊ አይደለም')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - Admin Only */}
        {hasPermission('canModifyInputs') && (
        <div className="bg-white rounded-lg shadow-lg p-6 no-print">
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleSaveMonth}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 font-semibold text-lg shadow-lg"
            >
              <Save size={24} />
              {renderLabel('Save Month & Carry Over', 'ወሩን መዝግብ እና አስተላልፍ')}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            {renderLabel(
              'Saving will record this month and carry forward net balances to next month\'s previous balance fields.',
              'ማስቀመጥ ይህን ወር ይመዘግባል እና ንጹህ ሂሳቦችን ወደ ቀጣዩ ወር የቀደመ ሂሳብ መስክ ያስተላልፋል።'
            )}
          </p>
        </div>
        )}

        {/* Monthly History Archive Table (የወርሃዊ ታሪክ ማህደር) */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <History className="text-indigo-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">
                {renderLabel('Monthly History Archive', 'የወርሃዊ ታሪክ ማህደር')}
              </h2>
            </div>
            {monthlyHistory.length > 0 && hasPermission('canDelete') && (
              <button
                onClick={handleClearAllHistory}
                className="no-print px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold flex items-center gap-2"
              >
                <Trash2 size={16} />
                {renderLabel('Clear All History', 'ሁሉንም ታሪክ ያጽዱ')}
              </button>
            )}
          </div>

          {monthlyHistory.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <History className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500 text-lg">
                {renderLabel('No monthly records saved yet', 'ገና የተቀመጡ የወር መዝገቦች የሉም')}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {renderLabel(
                  'Enter monthly data and click "Save Month & Carry Over" to create your first record',
                  'የወር መረጃ ያስገቡ እና የመጀመሪያውን መዝገብ ለመፍጠር "ወሩን መዝግብ እና አስተላልፍ" ን ይጫኑ'
                )}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                    <th className="px-4 py-3 text-left text-sm font-semibold border border-indigo-700">
                      {renderLabel('Month', 'ወር')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold border border-indigo-700">
                      {renderLabel('Gross Income', 'ጠቅላላ ገቢ')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold border border-indigo-700">
                      {renderLabel('Bank + Expenses', 'ባንክ + ወጪዎች')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold border border-indigo-700 bg-blue-700">
                      {renderLabel('Amsalu Net', 'አምሳሉ ንጹህ')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold border border-indigo-700 bg-purple-700">
                      {renderLabel('Smeneh Net', 'ስመኔህ ንጹህ')}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold border border-indigo-700 bg-green-700">
                      {renderLabel('Kes Yeshalem Net', 'ቄስ የሻለም ንጹህ')}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold border border-indigo-700 bg-yellow-600">
                      {renderLabel('Comment / Notes', 'አስተያየት / ማስታወሻ')}
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold border border-indigo-700 no-print">
                      {renderLabel('Actions', 'ድርጊቶች')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyHistory.map((record, index) => (
                    <tr
                      key={index}
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                    >
                      {/* Month */}
                      <td className="px-4 py-3 border border-gray-300 font-semibold text-gray-800">
                        {record.month}
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </td>

                      {/* Gross Income */}
                      <td className="px-4 py-3 border border-gray-300 text-right font-medium text-gray-700">
                        {formatCurrency(record.inputs.grossIncome)}
                      </td>

                      {/* Total Common Expenses */}
                      <td className="px-4 py-3 border border-gray-300 text-right font-medium text-gray-700">
                        {formatCurrency(
                          record.inputs.bankInstallment + record.inputs.miscExpenses
                        )}
                      </td>

                      {/* Amsalu Net Payout */}
                      <td className={`px-4 py-3 border border-gray-300 text-right font-bold ${
                        record.results.amsalu.netPayout >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(record.results.amsalu.netPayout)}
                      </td>

                      {/* Smeneh Net Payout */}
                      <td className={`px-4 py-3 border border-gray-300 text-right font-bold ${
                        record.results.smeneh.netPayout >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(record.results.smeneh.netPayout)}
                      </td>

                      {/* Kes Yeshalem Net Payout */}
                      <td className={`px-4 py-3 border border-gray-300 text-right font-bold ${
                        record.results.kesYeshalem.netPayout >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(record.results.kesYeshalem.netPayout)}
                      </td>

                      {/* Comment/Notes Column - Visible to ALL users */}
                      <td className="px-4 py-3 border border-gray-300 text-left">
                        {record.comment ? (
                          <div className="flex items-start gap-2">
                            <MessageSquare size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-gray-700 break-words">
                              <p className="line-clamp-2 hover:line-clamp-none transition-all">
                                {record.comment}
                              </p>
                              {record.commentedBy && (
                                <p className="text-xs text-gray-500 mt-1">
                                  - {record.commentedBy}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            {renderLabel('No comment', 'ምንም አስተያየት የለም')}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 border border-gray-300 text-center no-print">
                        <div className="flex gap-2 justify-center">
                          {/* Edit Button - Admin Only */}
                          {hasPermission('canEdit') && (
                            <button
                              onClick={() => handleEditMonth(index)}
                              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors font-semibold flex items-center gap-1"
                              title={renderLabel('Edit this month', 'ይህን ወር ያስተካክሉ')}
                            >
                              <Edit size={12} />
                            </button>
                          )}
                          
                          {/* Comment Button - Admin Only */}
                          {hasPermission('canComment') && (
                            <button
                              onClick={() => handleAddComment(index)}
                              className={`px-2 py-1 ${record.comment ? 'bg-green-500' : 'bg-gray-500'} text-white text-xs rounded hover:bg-green-600 transition-colors font-semibold flex items-center gap-1`}
                              title={renderLabel(record.comment ? 'View/Edit comment' : 'Add comment', record.comment ? 'አስተያየት ይመልከቱ/ያስተካክሉ' : 'አስተያየት ይጨምሩ')}
                            >
                              <MessageSquare size={12} />
                            </button>
                          )}
                          
                          {/* Delete Button - Admin Only */}
                          {hasPermission('canDelete') && (
                            <button
                              onClick={() => handleDeleteMonth(index)}
                              className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors font-semibold flex items-center gap-1"
                              title={renderLabel('Delete this month', 'ይህን ወር ይሰርዙ')}
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

                {/* Table Footer with Totals */}
                <tfoot>
                  <tr className="bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold">
                    <td className="px-4 py-3 border border-gray-600" colSpan="1">
                      {renderLabel('TOTAL', 'ድምር')} ({monthlyHistory.length} {renderLabel('months', 'ወራት')})
                    </td>
                    <td className="px-4 py-3 border border-gray-600 text-right">
                      {formatCurrency(
                        monthlyHistory.reduce((sum, r) => sum + r.inputs.grossIncome, 0)
                      )}
                    </td>
                    <td className="px-4 py-3 border border-gray-600 text-right">
                      {formatCurrency(
                        monthlyHistory.reduce(
                          (sum, r) => sum + r.inputs.bankInstallment + r.inputs.miscExpenses,
                          0
                        )
                      )}
                    </td>
                    <td className="px-4 py-3 border border-gray-600 text-right">
                      {formatCurrency(
                        monthlyHistory.reduce((sum, r) => sum + r.results.amsalu.netPayout, 0)
                      )}
                    </td>
                    <td className="px-4 py-3 border border-gray-600 text-right">
                      {formatCurrency(
                        monthlyHistory.reduce((sum, r) => sum + r.results.smeneh.netPayout, 0)
                      )}
                    </td>
                    <td className="px-4 py-3 border border-gray-600 text-right">
                      {formatCurrency(
                        monthlyHistory.reduce((sum, r) => sum + r.results.kesYeshalem.netPayout, 0)
                      )}
                    </td>
                    <td className="px-4 py-3 border border-gray-600 text-center text-xs">
                      {renderLabel('---', '---')}
                    </td>
                    <td className="px-4 py-3 border border-gray-600 no-print"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Historical Statistics */}
          {monthlyHistory.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600 mb-1">{renderLabel('Total Months Recorded', 'የተመዘገቡ ጠቅላላ ወራት')}</p>
                <p className="text-2xl font-bold text-blue-700">{monthlyHistory.length}</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <p className="text-xs text-gray-600 mb-1">{renderLabel('Average Monthly Income', 'አማካይ የወር ገቢ')}</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(
                    monthlyHistory.reduce((sum, r) => sum + r.inputs.grossIncome, 0) /
                      monthlyHistory.length
                  )}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <p className="text-xs text-gray-600 mb-1">{renderLabel('Highest Income Month', 'ከፍተኛ ገቢ ያለው ወር')}</p>
                <p className="text-sm font-bold text-purple-700">
                  {monthlyHistory.reduce((max, r) => 
                    r.inputs.grossIncome > (max?.inputs?.grossIncome || 0) ? r : max, 
                    monthlyHistory[0]
                  )?.month}
                </p>
                <p className="text-lg font-bold text-purple-700">
                  {formatCurrency(
                    Math.max(...monthlyHistory.map(r => r.inputs.grossIncome))
                  )}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                <p className="text-xs text-gray-600 mb-1">{renderLabel('Latest Balance', 'የቅርብ ጊዜ ሂሳብ')}</p>
                <p className="text-xs text-gray-500">
                  {renderLabel('Amsalu', 'አምሳሉ')}: {formatCurrency(monthlyHistory[0]?.results.amsalu.netPayout)}
                </p>
                <p className="text-xs text-gray-500">
                  {renderLabel('Smeneh', 'ስመኔህ')}: {formatCurrency(monthlyHistory[0]?.results.smeneh.netPayout)}
                </p>
                <p className="text-xs text-gray-500">
                  {renderLabel('Kes Y.', 'ቄስ የ.')}: {formatCurrency(monthlyHistory[0]?.results.kesYeshalem.netPayout)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pending Deletions Section (3-Day Recovery Period) - Admin Only */}
        {hasPermission('canDelete') && pendingDeletions.length > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="text-yellow-600" size={24} />
              <h2 className="text-xl font-bold text-gray-800">
                {renderLabel('Pending Deletions (3-Day Recovery)', 'በመሰረዝ ላይ (3-ቀን መልሶ ማግኛ)')}
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {renderLabel(
                'These records will be permanently deleted after 3 days. You can restore them before then.',
                'እነዚህ መዝገቦች ከ3 ቀናት በኋላ ለዘለዓለም ይሰረዛሉ። ከዚያ በፊት መመለስ ይችላሉ።'
              )}
            </p>
            <div className="space-y-3">
              {pendingDeletions.map((deletion, index) => {
                const hoursLeft = 72 - ((Date.now() - deletion.deletedAt) / (1000 * 60 * 60));
                const daysLeft = Math.floor(hoursLeft / 24);
                const hoursLeftInDay = Math.floor(hoursLeft % 24);
                
                return (
                  <div key={index} className="bg-white p-4 rounded-lg border border-yellow-300 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{deletion.month}</p>
                      <p className="text-sm text-gray-600">
                        {renderLabel('Deleted by', 'የሰረዘው')}: {deletion.deletedBy}
                      </p>
                      <p className="text-sm text-gray-600">
                        {renderLabel('Reason', 'ምክንያት')}: {deletion.deletionReason}
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        {renderLabel(`Time left: ${daysLeft}d ${hoursLeftInDay}h`, `የቀረው ጊዜ: ${daysLeft}ቀ ${hoursLeftInDay}ሰ`)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestoreMonth(index)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
                    >
                      <RotateCcw size={18} />
                      {renderLabel('Restore', 'መልስ')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modals */}
        <ReasonModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, index: null, monthName: '' })}
          onConfirm={confirmDeleteMonth}
          action="delete"
          monthName={deleteModal.monthName}
          language={language}
        />
        
        <CommentModal
          isOpen={commentModal.isOpen}
          onClose={() => setCommentModal({ isOpen: false, index: null, monthName: '', comment: '' })}
          onSave={saveComment}
          monthName={commentModal.monthName}
          existingComment={commentModal.comment}
          language={language}
        />
        
        <EditMonthModal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, data: null, index: null })}
          onSave={confirmEditMonth}
          monthData={editModal.data}
          language={language}
        />

        <ClearHistoryModal
          isOpen={clearHistoryModal.isOpen}
          onClose={() => setClearHistoryModal({ isOpen: false, totalRecords: 0 })}
          onConfirm={confirmClearAllHistory}
          totalRecords={clearHistoryModal.totalRecords}
          language={language}
        />

        {/* Recycle Bin Modal */}
        {showRecycleBin && hasPermission('canDelete') && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 no-print">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 bg-orange-50 sticky top-0 z-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Trash className="text-orange-600" size={32} />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        {renderLabel('Recycle Bin', 'ቆሻሻ መጣያ')}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {renderLabel(
                          `${recycleBin.length} deleted records - Auto-cleanup after 3 days`,
                          `${recycleBin.length} የተሰረዙ መዝገቦች - ከ3 ቀናት በኋላ ራስ-ሰር ይጸዳል`
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRecycleBin(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                {recycleBin.length === 0 ? (
                  <div className="text-center py-12">
                    <Trash className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500 text-lg">
                      {renderLabel('Recycle bin is empty', 'ቆሻሻ መጣያ ባዶ ነው')}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        {renderLabel(
                          'Deleted records are kept for 3 days before permanent deletion',
                          'የተሰረዙ መዝገቦች ከዘለዓለም መሰረዝ በፊት ለ3 ቀናት ይቀመጣሉ'
                        )}
                      </p>
                      <button
                        onClick={handleEmptyRecycleBin}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        {renderLabel('Empty Recycle Bin', 'ቆሻሻ መጣያ ባዶ አድርግ')}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {recycleBin.map((record, index) => {
                        const hoursLeft = 72 - ((Date.now() - record.deletedAt) / (1000 * 60 * 60));
                        const daysLeft = Math.floor(hoursLeft / 24);
                        const hoursLeftInDay = Math.floor(hoursLeft % 24);
                        
                        return (
                          <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-bold text-lg text-gray-800">{record.month}</h3>
                                  {record.deletionType === 'CLEAR_ALL' && (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-semibold">
                                      {renderLabel('Bulk Delete', 'ጅምላ ሰርዝ')}
                                    </span>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                                  <div>
                                    <span className="text-gray-600">{renderLabel('Income', 'ገቢ')}:</span>
                                    <span className="font-semibold ml-2">{formatCurrency(record.inputs.grossIncome)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">{renderLabel('Amsalu', 'አምሳሉ')}:</span>
                                    <span className="font-semibold ml-2">{formatCurrency(record.results.amsalu.netPayout)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">{renderLabel('Smeneh', 'ስመኔህ')}:</span>
                                    <span className="font-semibold ml-2">{formatCurrency(record.results.smeneh.netPayout)}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">{renderLabel('Kes Y.', 'ቄስ የ.')}:</span>
                                    <span className="font-semibold ml-2">{formatCurrency(record.results.kesYeshalem.netPayout)}</span>
                                  </div>
                                </div>

                                <div className="text-sm text-gray-600 space-y-1">
                                  <p>
                                    <span className="font-medium">{renderLabel('Deleted by', 'የሰረዘው')}:</span> {record.deletedBy}
                                    {' '}<span className="text-gray-400">•</span>{' '}
                                    <span className="font-medium">{renderLabel('Date', 'ቀን')}:</span> {new Date(record.deletedAt).toLocaleString()}
                                  </p>
                                  <p>
                                    <span className="font-medium">{renderLabel('Reason', 'ምክንያት')}:</span> {record.deletionReason}
                                  </p>
                                  <p className="text-red-600 font-semibold">
                                    ⏰ {renderLabel(`Time left: ${daysLeft}d ${hoursLeftInDay}h`, `የቀረው ጊዜ: ${daysLeft}ቀ ${hoursLeftInDay}ሰ`)}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 ml-4">
                                <button
                                  onClick={() => handleRestoreFromRecycleBin(index)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2 whitespace-nowrap"
                                >
                                  <RotateCcw size={18} />
                                  {renderLabel('Restore', 'መልስ')}
                                </button>
                                <button
                                  onClick={() => handlePermanentDelete(index)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2 whitespace-nowrap"
                                >
                                  <Trash2 size={18} />
                                  {renderLabel('Delete Forever', 'ለዘለዓለም ሰርዝ')}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>{renderLabel('Vehicle Accounting Dashboard', 'የተሽከርካሪ የሂሳብ ማስተዳደሪያ')} © 2026</p>
          <p className="mt-1">
            {renderLabel(
              'Total Vehicle Capitalization',
              'ጠቅላላ የተሽከርካሪ ካፒታላይዜሽን'
            )}: {formatCurrency(TOTAL_CAPITAL)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
