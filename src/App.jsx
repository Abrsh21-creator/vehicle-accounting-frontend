import React, { useState, useEffect } from 'react';
import { Save, FileText, Calculator, Info, History, Printer, Trash2 } from 'lucide-react';

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
 * Safely parse input value to float, defaulting to 0
 * @param {string|number} value - Input value
 * @returns {number} Parsed float value
 */
const safeParseFloat = (value) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

function App() {
  // Language toggle state
  const [language, setLanguage] = useState('both'); // 'english', 'amharic', 'both'

  // Month and Year Selection States
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  // Monthly Input States
  const [grossIncome, setGrossIncome] = useState('');
  const [bankInstallment, setBankInstallment] = useState('');
  const [miscExpenses, setMiscExpenses] = useState('');
  
  // Personnel Salaries & Equb
  const [amsaluSalary, setAmsaluSalary] = useState('');
  const [amsaluEqub, setAmsaluEqub] = useState('');
  const [smenehSalary, setSmenehSalary] = useState('');
  const [smenehEqub, setSmenehEqub] = useState('');
  
  // Previous Balances (Carryovers)
  const [amsaluPrevBalance, setAmsaluPrevBalance] = useState('');
  const [smenehPrevBalance, setSmenehPrevBalance] = useState('');
  const [kesYeshalemPrevBalance, setKesYeshalemPrevBalance] = useState('');
  
  // UI States
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  
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

  // ============================================================================
  // FINANCIAL CALCULATION ENGINE - DIRECT PERCENTAGE DEDUCTION WITH SHARED SALARIES
  // ============================================================================

  /**
   * Calculate all financial distributions and net payouts
   * - Bank Loan & Misc Expenses: Direct percentage deduction per shareholder
   * - Salaries (Amsalu + Smeneh): Treated as shared vehicle expense, ALL shareholders contribute by percentage
   * @returns {Object} Complete calculation breakdown for all shareholders
   */
  const calculateFinancials = () => {
    // Parse all inputs safely
    const income = safeParseFloat(grossIncome);
    const bankPayment = safeParseFloat(bankInstallment);
    const misc = safeParseFloat(miscExpenses);
    const amsaluSal = safeParseFloat(amsaluSalary);
    const amsaluEq = safeParseFloat(amsaluEqub);
    const smenehSal = safeParseFloat(smenehSalary);
    const smenehEq = safeParseFloat(smenehEqub);
    const amsaluPrev = safeParseFloat(amsaluPrevBalance);
    const smenehPrev = safeParseFloat(smenehPrevBalance);
    const kesYeshalemPrev = safeParseFloat(kesYeshalemPrevBalance);

    // ========================================================================
    // SHARED SALARY POOL - ALL shareholders contribute to total salaries
    // ========================================================================
    const totalSalaries = amsaluSal + smenehSal;
    
    // ========================================================================
    // AMSALU (15.6% Shareholder / Assistant)
    // Formula: (Income × 15.6%) + Salary - Equb - (Bank × 15.6%) - (Misc × 15.6%) - (Total Salaries × 15.6%) + Previous Balance
    // ========================================================================
    const amsaluGrossShare = (income * SHAREHOLDERS.amsalu.sharePercent) / 100;
    const amsaluBankShare = (bankPayment * SHAREHOLDERS.amsalu.sharePercent) / 100;
    const amsaluMiscShare = (misc * SHAREHOLDERS.amsalu.sharePercent) / 100;
    const amsaluSalaryShare = (totalSalaries * SHAREHOLDERS.amsalu.sharePercent) / 100; // Shared salary contribution
    const amsaluNet = amsaluGrossShare + amsaluSal - amsaluEq - amsaluBankShare - amsaluMiscShare - amsaluSalaryShare + amsaluPrev;

    // ========================================================================
    // SMENEH (12.6% Shareholder / Driver)
    // Formula: (Income × 12.6%) + Salary - Equb - (Bank × 12.6%) - (Misc × 12.6%) - (Total Salaries × 12.6%) + Previous Balance
    // ========================================================================
    const smenehGrossShare = (income * SHAREHOLDERS.smeneh.sharePercent) / 100;
    const smenehBankShare = (bankPayment * SHAREHOLDERS.smeneh.sharePercent) / 100;
    const smenehMiscShare = (misc * SHAREHOLDERS.smeneh.sharePercent) / 100;
    const smenehSalaryShare = (totalSalaries * SHAREHOLDERS.smeneh.sharePercent) / 100; // Shared salary contribution
    const smenehNet = smenehGrossShare + smenehSal - smenehEq - smenehBankShare - smenehMiscShare - smenehSalaryShare + smenehPrev;

    // ========================================================================
    // KES YESHALEM (71.8% Shareholder / Main Owner)
    // Formula: (Income × 71.8%) - (Bank × 71.8%) - (Misc × 71.8%) - (Total Salaries × 71.8%) + Previous Balance
    // ========================================================================
    const kesYeshalemGrossShare = (income * SHAREHOLDERS.kesYeshalem.sharePercent) / 100;
    const kesYeshalemBankShare = (bankPayment * SHAREHOLDERS.kesYeshalem.sharePercent) / 100;
    const kesYeshalemMiscShare = (misc * SHAREHOLDERS.kesYeshalem.sharePercent) / 100;
    const kesYeshalemSalaryShare = (totalSalaries * SHAREHOLDERS.kesYeshalem.sharePercent) / 100; // Shared salary contribution
    const kesYeshalemNet = kesYeshalemGrossShare - kesYeshalemBankShare - kesYeshalemMiscShare - kesYeshalemSalaryShare + kesYeshalemPrev;

    // ========================================================================
    // VERIFICATION: Total net should equal income minus actual expenses
    // ========================================================================
    const totalNetPayout = amsaluNet + smenehNet + kesYeshalemNet;
    const actualTotalExpenses = bankPayment + misc + amsaluEq + smenehEq;
    const expectedTotal = income - actualTotalExpenses;

    return {
      income,
      bankPayment,
      miscExpenses: misc,
      totalSalaries,
      amsalu: {
        grossShare: amsaluGrossShare,
        salary: amsaluSal,
        equb: amsaluEq,
        bankShare: amsaluBankShare,
        miscShare: amsaluMiscShare,
        salaryShare: amsaluSalaryShare,
        prevBalance: amsaluPrev,
        netPayout: amsaluNet,
      },
      smeneh: {
        grossShare: smenehGrossShare,
        salary: smenehSal,
        equb: smenehEq,
        bankShare: smenehBankShare,
        miscShare: smenehMiscShare,
        salaryShare: smenehSalaryShare,
        prevBalance: smenehPrev,
        netPayout: smenehNet,
      },
      kesYeshalem: {
        grossShare: kesYeshalemGrossShare,
        bankShare: kesYeshalemBankShare,
        miscShare: kesYeshalemMiscShare,
        salaryShare: kesYeshalemSalaryShare,
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
        bankInstallment: safeParseFloat(bankInstallment),
        miscExpenses: safeParseFloat(miscExpenses),
        amsaluSalary: safeParseFloat(amsaluSalary),
        amsaluEqub: safeParseFloat(amsaluEqub),
        smenehSalary: safeParseFloat(smenehSalary),
        smenehEqub: safeParseFloat(smenehEqub),
        amsaluPrevBalance: safeParseFloat(amsaluPrevBalance),
        smenehPrevBalance: safeParseFloat(smenehPrevBalance),
        kesYeshalemPrevBalance: safeParseFloat(kesYeshalemPrevBalance),
      },
      results: calculations,
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
    setBankInstallment('');
    setMiscExpenses('');
    setAmsaluSalary('');
    setAmsaluEqub('');
    setSmenehSalary('');
    setSmenehEqub('');

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
   * Delete a specific month from history
   */
  const handleDeleteMonth = (index) => {
    if (window.confirm('Are you sure you want to delete this month record? This action cannot be undone.')) {
      const newHistory = monthlyHistory.filter((_, idx) => idx !== index);
      setMonthlyHistory(newHistory);
      localStorage.setItem('vehicleAccountingHistory', JSON.stringify(newHistory));
    }
  };

  /**
   * Clear all history
   */
  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to delete ALL history? This action cannot be undone.')) {
      setMonthlyHistory([]);
      localStorage.removeItem('vehicleAccountingHistory');
      alert('All history cleared successfully.');
    }
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
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Printer size={18} />
                {renderLabel('Print', 'አትም')}
              </button>
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

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="text-indigo-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">
              {renderLabel('Monthly Inputs', 'የወር ግብዓቶች')}
            </h2>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* General Vehicle Financials */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">
                {renderLabel('General Financials', 'አጠቃላይ ፋይናንስ')}
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Monthly Gross Income', 'የወሩ አጠቃላይ ገቢ')}
                </label>
                <input
                  type="number"
                  value={grossIncome}
                  onChange={(e) => setGrossIncome(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Bank Loan Installment', 'የባንክ እዳ ክፍያ')}
                </label>
                <input
                  type="number"
                  value={bankInstallment}
                  onChange={(e) => setBankInstallment(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Misc. Vehicle Expenses', 'የመኪና ወጪዎች')}
                </label>
                <input
                  type="number"
                  value={miscExpenses}
                  onChange={(e) => setMiscExpenses(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Kes Yeshalem Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">
                {renderLabel(`${SHAREHOLDERS.kesYeshalem.name} (${SHAREHOLDERS.kesYeshalem.role})`, `${SHAREHOLDERS.kesYeshalem.nameAm} (${SHAREHOLDERS.kesYeshalem.roleAm})`)}
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Previous Balance', 'የቀደመ ሂሳብ')}
                </label>
                <input
                  type="number"
                  value={kesYeshalemPrevBalance}
                  onChange={(e) => setKesYeshalemPrevBalance(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Smeneh Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">
                {renderLabel(`${SHAREHOLDERS.smeneh.name} (${SHAREHOLDERS.smeneh.role})`, `${SHAREHOLDERS.smeneh.nameAm} (${SHAREHOLDERS.smeneh.roleAm})`)}
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Monthly Salary', 'የወር ደሞዝ')}
                </label>
                <input
                  type="number"
                  value={smenehSalary}
                  onChange={(e) => setSmenehSalary(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Monthly Equb', 'የወር እቁብ')}
                </label>
                <input
                  type="number"
                  value={smenehEqub}
                  onChange={(e) => setSmenehEqub(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Previous Balance', 'የቀደመ ሂሳብ')}
                </label>
                <input
                  type="number"
                  value={smenehPrevBalance}
                  onChange={(e) => setSmenehPrevBalance(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Amsalu Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 border-b pb-2">
                {renderLabel(`${SHAREHOLDERS.amsalu.name} (${SHAREHOLDERS.amsalu.role})`, `${SHAREHOLDERS.amsalu.nameAm} (${SHAREHOLDERS.amsalu.roleAm})`)}
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Monthly Salary', 'የወር ደሞዝ')}
                </label>
                <input
                  type="number"
                  value={amsaluSalary}
                  onChange={(e) => setAmsaluSalary(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Monthly Equb', 'የወር እቁብ')}
                </label>
                <input
                  type="number"
                  value={amsaluEqub}
                  onChange={(e) => setAmsaluEqub(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {renderLabel('Previous Balance', 'የቀደመ ሂሳብ')}
                </label>
                <input
                  type="number"
                  value={amsaluPrevBalance}
                  onChange={(e) => setAmsaluPrevBalance(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

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
                  <span>{renderLabel('3. Misc Expenses Direct Share', '3. ልዩ ወጪዎች ቀጥታ ድርሻ')} ({SHAREHOLDERS.kesYeshalem.sharePercent}%):</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(calculations.kesYeshalem.miscShare)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-2">
                  <span className="font-medium">{renderLabel('4. Shared Salary Expense', '4. የጋራ ደሞዝ ወጪ')} ({SHAREHOLDERS.kesYeshalem.sharePercent}% of {formatCurrency(calculations.totalSalaries)}):</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(calculations.kesYeshalem.salaryShare)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{renderLabel('5. Previous Balance', '5. የቀደመ ሂሳብ')}:</span>
                  <span className={`font-semibold ${calculations.kesYeshalem.prevBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculations.kesYeshalem.prevBalance >= 0 ? '+' : ''}{formatCurrency(calculations.kesYeshalem.prevBalance)}
                  </span>
                </div>
                <div className="border-t-2 border-gray-400 pt-2 mt-2 flex justify-between text-lg">
                  <span className="font-bold">{renderLabel('FINAL NET PAYOUT', 'የመጨረሻ ንጹህ ክፍያ')}:</span>
                  <span className={`font-bold ${calculations.kesYeshalem.netPayout >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculations.kesYeshalem.netPayout)}
                  </span>
                </div>
              </div>
            </div>

            {/* Smeneh Breakdown - SHOWN SECOND */}
            <div className="mb-6 p-4 bg-purple-50 rounded-lg border-2 border-purple-300">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {renderLabel(SHAREHOLDERS.smeneh.name, SHAREHOLDERS.smeneh.nameAm)} {renderLabel('- Calculation Steps', '- የሂሳብ ደረጃዎች')}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{renderLabel('1. Gross Income Share', '1. ጠቅላላ ገቢ ድርሻ')} ({SHAREHOLDERS.smeneh.sharePercent}%):</span>
                  <span className="font-semibold text-green-600">+{formatCurrency(calculations.smeneh.grossShare)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{renderLabel('2. Salary Received', '2. የተቀበለው ደሞዝ')}:</span>
                  <span className="font-semibold text-green-600">+{formatCurrency(calculations.smeneh.salary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{renderLabel('3. Equb Deduction', '3. እቁብ ቅናሽ')}:</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(calculations.smeneh.equb)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{renderLabel('4. Bank Loan Direct Share', '4. የባንክ እዳ ቀጥታ ድርሻ')} ({SHAREHOLDERS.smeneh.sharePercent}%):</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(calculations.smeneh.bankShare)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{renderLabel('5. Misc Expenses Direct Share', '5. ልዩ ወጪዎች ቀጥታ ድርሻ')} ({SHAREHOLDERS.smeneh.sharePercent}%):</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(calculations.smeneh.miscShare)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-2">
                  <span className="font-medium">{renderLabel('6. Shared Salary Expense', '6. የጋራ ደሞዝ ወጪ')} ({SHAREHOLDERS.smeneh.sharePercent}% of {formatCurrency(calculations.totalSalaries)}):</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(calculations.smeneh.salaryShare)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{renderLabel('7. Previous Balance', '7. የቀደመ ሂሳብ')}:</span>
                  <span className={`font-semibold ${calculations.smeneh.prevBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculations.smeneh.prevBalance >= 0 ? '+' : ''}{formatCurrency(calculations.smeneh.prevBalance)}
                  </span>
                </div>
                <div className="border-t-2 border-gray-400 pt-2 mt-2 flex justify-between text-lg">
                  <span className="font-bold">{renderLabel('FINAL NET PAYOUT', 'የመጨረሻ ንጹህ ክፍያ')}:</span>
                  <span className={`font-bold ${calculations.smeneh.netPayout >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(calculations.smeneh.netPayout)}
                  </span>
                </div>
              </div>
            </div>

            {/* Amsalu Breakdown - SHOWN THIRD */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {renderLabel(SHAREHOLDERS.amsalu.name, SHAREHOLDERS.amsalu.nameAm)} {renderLabel('- Calculation Steps', '- የሂሳብ ደረጃዎች')}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{renderLabel('1. Gross Income Share', '1. ጠቅላላ ገቢ ድርሻ')} ({SHAREHOLDERS.amsalu.sharePercent}%):</span>
                  <span className="font-semibold text-green-600">+{formatCurrency(calculations.amsalu.grossShare)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{renderLabel('2. Salary Received', '2. የተቀበለው ደሞዝ')}:</span>
                  <span className="font-semibold text-green-600">+{formatCurrency(calculations.amsalu.salary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{renderLabel('3. Equb Deduction', '3. እቁብ ቅናሽ')}:</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(calculations.amsalu.equb)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{renderLabel('4. Bank Loan Direct Share', '4. የባንክ እዳ ቀጥታ ድርሻ')} ({SHAREHOLDERS.amsalu.sharePercent}%):</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(calculations.amsalu.bankShare)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{renderLabel('5. Misc Expenses Direct Share', '5. ልዩ ወጪዎች ቀጥታ ድርሻ')} ({SHAREHOLDERS.amsalu.sharePercent}%):</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(calculations.amsalu.miscShare)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-2">
                  <span className="font-medium">{renderLabel('6. Shared Salary Expense', '6. የጋራ ደሞዝ ወጪ')} ({SHAREHOLDERS.amsalu.sharePercent}% of {formatCurrency(calculations.totalSalaries)}):</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(calculations.amsalu.salaryShare)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{renderLabel('7. Previous Balance', '7. የቀደመ ሂሳብ')}:</span>
                  <span className={`font-semibold ${calculations.amsalu.prevBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {calculations.amsalu.prevBalance >= 0 ? '+' : ''}{formatCurrency(calculations.amsalu.prevBalance)}
                  </span>
                </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><span className="font-semibold">{renderLabel('Total Gross Income', 'ጠቅላላ ገቢ')}:</span> {formatCurrency(calculations.income)}</p>
                  <p><span className="font-semibold">{renderLabel('Bank Loan Payment', 'የባንክ እዳ ክፍያ')}:</span> {formatCurrency(calculations.bankPayment)}</p>
                  <p><span className="font-semibold">{renderLabel('Misc Expenses', 'ልዩ ወጪዎች')}:</span> {formatCurrency(calculations.miscExpenses)}</p>
                  <p className="border-t pt-2 mt-2"><span className="font-semibold">{renderLabel('Total Salaries (Shared)', 'ጠቅላላ ደሞዞች (የጋራ)')}:</span> {formatCurrency(calculations.totalSalaries)}</p>
                  <p><span className="font-semibold">{renderLabel('Total Equb Deductions', 'ጠቅላላ እቁብ ቅናሾች')}:</span> {formatCurrency(calculations.actualTotalExpenses)}</p>
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

        {/* Action Buttons */}
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

        {/* Monthly History Archive Table (የወርሃዊ ታሪክ ማህደር) */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <History className="text-indigo-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">
                {renderLabel('Monthly History Archive', 'የወርሃዊ ታሪክ ማህደር')}
              </h2>
            </div>
            {monthlyHistory.length > 0 && (
              <button
                onClick={handleClearAllHistory}
                className="no-print px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
              >
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

                      {/* Actions */}
                      <td className="px-4 py-3 border border-gray-300 text-center no-print">
                        <button
                          onClick={() => handleDeleteMonth(index)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors font-semibold flex items-center gap-1 mx-auto"
                          title={renderLabel('Delete this month', 'ይህን ወር ይሰርዙ')}
                        >
                          <Trash2 size={14} />
                          {renderLabel('Delete', 'ሰርዝ')}
                        </button>
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
