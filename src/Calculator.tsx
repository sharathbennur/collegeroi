import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent, type ChangeEvent, Fragment } from 'react';
import { Link } from 'react-router-dom';
import './Calculator.css';
import { colleges } from './assets/colleges.ts';

interface PaymentScheduleRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

interface SavedCollege {
  id: string;
  name: string;
  data: {
    formData: any;
    tuitionBreakdown: any;
    expensesBreakdown: any;
    taxRates: any;
    inflationRate: string;
  };
}

const helpTopics = [
  {
    id: 'data-guide',
    title: 'How to search for college specific data',
    content: 'Unsure what numbers to enter? Try these Google searches:\n\n• For College Costs: Search "[College Name] cost of attendance". Look for the official .edu financial aid page. Use the "Total Cost" or "Sticker Price" which includes tuition, fees, room, and board.\n\n• For Salary: Search "[Major] entry level salary" or "[College Name] [Major] starting salary". Websites like Glassdoor, Payscale, or the US Bureau of Labor Statistics are good sources.'
  },
  {
    id: 'ai-guide',
    title: 'Using AI for Research',
    content: (
      <>
        You can use AI tools to quickly gather estimates:
        <br /><br />
        • <strong>Prompt:</strong> "What is the total cost of attendance for [College Name] for the 2024-2025 academic year including tuition, room, and board?"
        <br /><br />
        • <strong>Prompt:</strong> "What is the median entry-level salary for a [Major] graduate from [College Name]?"
        <br /><br />
        Try these tools:
        <br />
        • <a href="https://chatgpt.com" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>ChatGPT</a>
        <br />
        • <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>Gemini</a>
      </>
    )
  },
  {
    id: 'tuition',
    title: 'Tuition Breakdown',
    content: 'Helps you enter the yearly tuition and room & board costs for each of the 4 years. You can also use the "Auto-fill" feature on the main form to populate these values for popular colleges. Use the Inflation % feature at the top to automatically calculate future year costs based on the first year values and inflation rates.'
  },
  {
    id: 'cost',
    title: '4-Year Cost',
    content: 'The total estimated cost of tuition, room, and board for 4 years. This assumes the values entered in the "Costs" section.'
  },
  {
    id: 'contribution',
    title: 'Family Contribution',
    content: 'The amount your family contributes towards your education, reducing the principal amount you need to borrow.'
  },
  {
    id: 'loan',
    title: 'Loan Amount',
    content: 'The total principal amount borrowed. Calculated as (4-Year Cost) - (4-Year Family Contribution).'
  },
  {
    id: 'payment',
    title: 'Monthly Loan Payment',
    content: 'The amount you must pay each month to repay your loan over the specified term. Includes both principal and interest.'
  },
  {
    id: 'interest',
    title: 'Total Interest Paid',
    content: 'The total amount of interest paid over the life of the loan. A longer term or higher rate increases this amount.'
  },
  {
    id: 'taxes',
    title: 'Estimated Taxes',
    content: 'Estimated monthly federal, state, and local taxes based on your starting salary. Includes Social Security and Medicare.'
  },
  {
    id: 'cashflow',
    title: 'Net Monthly Cash Flow',
    content: 'Your remaining money each month after taxes, loan payments, and living expenses. (Take-home Pay - Loan Payment - Expenses).'
  },
  {
    id: 'savings',
    title: 'Projected Savings',
    content: 'The total estimated savings over 10 years, including your 401k contributions and accumulated net cash flow.'
  },
];

const Calculator = () => {
  const [formData, setFormData] = useState({
    collegeName: '',
    tuition: '',
    financialAid: '',
    familyContribution: '',
    loanInterest: '',
    loanTerm: '',
    salary: '',
    expenses: ''
  });
  const [error, setError] = useState('');
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [showTuitionModal, setShowTuitionModal] = useState(false);
  const [showFinancialAidModal, setShowFinancialAidModal] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof colleges>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tuitionBreakdown, setTuitionBreakdown] = useState({
    tuition1: '',
    roomBoard1: '',
    financialAid1: '',
    tuition2: '',
    roomBoard2: '',
    financialAid2: '',
    tuition3: '',
    roomBoard3: '',
    financialAid3: '',
    tuition4: '',
    roomBoard4: '',
    financialAid4: ''
  });
  const [inflationRate, setInflationRate] = useState('');
  const [sections, setSections] = useState({
    costs: true,
    loans: false,
    payments: false
  });
  const [paymentSchedule, setPaymentSchedule] = useState<PaymentScheduleRow[]>([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(true);
  const [expandedYears, setExpandedYears] = useState<number[]>([]);
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [expensesBreakdown, setExpensesBreakdown] = useState({
    rent: '2000',
    groceries: '500',
    eatingOut: '300',
    utilities: '150',
    transportation: '200',
    healthCare: '150',
    miscellaneous: '200',
    contribution401k: '500'
  });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [taxRates, setTaxRates] = useState({
    federal: '12.0',
    state: '5.0',
    medicare: '1.45',
    socialSecurity: '6.2',
    city: '0.0'
  });
  const scheduleRef = useRef<HTMLDivElement>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);
  const [guidanceSearch, setGuidanceSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<typeof helpTopics[0] | null>(null);
  const [comparedColleges, setComparedColleges] = useState<SavedCollege[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [showFloatingMetrics, setShowFloatingMetrics] = useState(true);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [showGuidanceMenu, setShowGuidanceMenu] = useState(false);

  useEffect(() => {
    document.title = 'CollegeROI - Calculator';
    
    const savedState = localStorage.getItem('collegeRoiCalcState');
    let parsedState: any = null;
    if (savedState) {
      try {
        parsedState = JSON.parse(savedState);
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }

    const params = new URLSearchParams(window.location.search);
    const sharedData = params.get('data');
    let loadedFromShare = false;

    if (sharedData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(sharedData)));
        if (decoded.formData) setFormData(decoded.formData);
        if (decoded.tuitionBreakdown) setTuitionBreakdown(decoded.tuitionBreakdown);
        if (decoded.expensesBreakdown) setExpensesBreakdown(decoded.expensesBreakdown);
        if (decoded.taxRates) setTaxRates(decoded.taxRates);
        if (decoded.inflationRate) setInflationRate(decoded.inflationRate);
        loadedFromShare = true;
      } catch (error) {
        console.error('Error loading shared state:', error);
      }
    }

    if (parsedState) {
      if (parsedState.sections) setSections(parsedState.sections);
      if (parsedState.showSchedule !== undefined) setShowSchedule(parsedState.showSchedule);
      if (parsedState.scheduleOpen !== undefined) setScheduleOpen(parsedState.scheduleOpen);
      if (parsedState.expandedYears) setExpandedYears(parsedState.expandedYears);
      if (parsedState.showInstructions !== undefined) setShowInstructions(parsedState.showInstructions);
      if (parsedState.comparedColleges) setComparedColleges(parsedState.comparedColleges);
      if (parsedState.showFloatingMetrics !== undefined) setShowFloatingMetrics(parsedState.showFloatingMetrics);

      if (!loadedFromShare) {
        if (parsedState.formData) setFormData(parsedState.formData);
        if (parsedState.tuitionBreakdown) setTuitionBreakdown(parsedState.tuitionBreakdown);
        if (parsedState.expensesBreakdown) setExpensesBreakdown(parsedState.expensesBreakdown);
        if (parsedState.taxRates) setTaxRates(parsedState.taxRates);
        if (parsedState.inflationRate) setInflationRate(parsedState.inflationRate);
        if (parsedState.paymentSchedule) setPaymentSchedule(parsedState.paymentSchedule);
      }
    }
  }, []);

  const toggleSection = (section: keyof typeof sections) => {
    setSections(prev => ({
      costs: section === 'costs' ? !prev.costs : false,
      loans: section === 'loans' ? !prev.loans : false,
      payments: section === 'payments' ? !prev.payments : false
    }));
  };

  const toggleYear = (year: number) => {
    setExpandedYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (invalidFields.includes(name)) {
      setInvalidFields(prev => prev.filter(field => field !== name));
    }
  };

  const handleCollegeNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, collegeName: value }));
    
    if (value.length > 0) {
      const filtered = colleges.filter(c => 
        c.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    if (error) setError('');
    if (invalidFields.includes('collegeName')) {
      setInvalidFields(prev => prev.filter(field => field !== 'collegeName'));
    }
  };

  const handleSuggestionClick = (college: typeof colleges[0]) => {
      const rate = 0.03;
      const t1 = college.annualTuition;
      const rb1 = college.annualRoomBoard;

      const calculateYear = (val: number, yearIndex: number) => Math.round(val * Math.pow(1 + rate, yearIndex));

      const t2 = calculateYear(t1, 1);
      const rb2 = calculateYear(rb1, 1);
      const t3 = calculateYear(t1, 2);
      const rb3 = calculateYear(rb1, 2);
      const t4 = calculateYear(t1, 3);
      const rb4 = calculateYear(rb1, 3);

      const totalTuition = (t1 + rb1) + (t2 + rb2) + (t3 + rb3) + (t4 + rb4);

      setFormData(prev => ({
        ...prev,
        collegeName: college.name,
        salary: college.medianSalary.toString(),
        tuition: totalTuition.toString()
      }));

      setTuitionBreakdown({
        tuition1: t1.toString(), roomBoard1: rb1.toString(),
        financialAid1: '',
        tuition2: t2.toString(), roomBoard2: rb2.toString(),
        financialAid2: '',
        tuition3: t3.toString(), roomBoard3: rb3.toString(),
        financialAid3: '',
        tuition4: t4.toString(), roomBoard4: rb4.toString(),
        financialAid4: '',
      });
      
      setInflationRate('3');

      setSuggestions([]);
      setShowSuggestions(false);

      // Clear errors for these fields
      setInvalidFields(prev => prev.filter(f => !['collegeName', 'salary', 'tuition'].includes(f)));
      if (error) setError('');
  };

  const handleTuitionChange = (e: FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    if (parseFloat(value) < 0) return;
    setTuitionBreakdown(prev => ({ ...prev, [name]: value }));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleTuitionDone = () => {
    let totalCost = 0;
    for (let i = 1; i <= 4; i++) {
      totalCost += (parseFloat(tuitionBreakdown[`tuition${i}` as keyof typeof tuitionBreakdown] as string) || 0);
      totalCost += (parseFloat(tuitionBreakdown[`roomBoard${i}` as keyof typeof tuitionBreakdown] as string) || 0);
    }
    setFormData(prev => ({ ...prev, tuition: totalCost.toString() }));
    setShowTuitionModal(false);
    
    if (invalidFields.includes('tuition')) {
      setInvalidFields(prev => prev.filter(field => field !== 'tuition'));
    }
    
    if (error) setError('');
  };

  const handleTuitionClear = () => {
    setTuitionBreakdown(prev => ({
      ...prev,
      tuition1: '',
      roomBoard1: '',
      tuition2: '',
      roomBoard2: '',
      tuition3: '',
      roomBoard3: '',
      tuition4: '',
      roomBoard4: ''
    }));
  };

  const handleFinancialAidDone = () => {
    let totalAid = 0;
    for (let i = 1; i <= 4; i++) {
      totalAid += (parseFloat(tuitionBreakdown[`financialAid${i}` as keyof typeof tuitionBreakdown] as string) || 0);
    }
    setFormData(prev => ({ ...prev, financialAid: totalAid.toString() }));
    setShowFinancialAidModal(false);
  };

  const handleFinancialAidClear = () => {
    setTuitionBreakdown(prev => ({
      ...prev,
      financialAid1: '', financialAid2: '', financialAid3: '', financialAid4: ''
    }));
  };

  const handleCopyYear1 = () => {
    const rate = parseFloat(inflationRate) / 100 || 0;

    const calculateNext = (value: string, years: number) => {
      const num = parseFloat(value);
      if (isNaN(num)) return '';
      return Math.round(num * Math.pow(1 + rate, years)).toString();
    };

    setTuitionBreakdown(prev => ({
      ...prev,
      tuition2: calculateNext(prev.tuition1, 1),
      roomBoard2: calculateNext(prev.roomBoard1, 1),
      tuition3: calculateNext(prev.tuition1, 2),
      roomBoard3: calculateNext(prev.roomBoard1, 2),
      tuition4: calculateNext(prev.tuition1, 3),
      roomBoard4: calculateNext(prev.roomBoard1, 3),
    }));
  };

  const handleCopyFinancialAidYear1 = () => {
    setTuitionBreakdown(prev => ({
      ...prev,
      financialAid2: prev.financialAid1,
      financialAid3: prev.financialAid1,
      financialAid4: prev.financialAid1,
    }));
  };

  const handleExpensesChange = (e: FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    if (parseFloat(value) < 0) return;
    setExpensesBreakdown(prev => ({ ...prev, [name]: value }));
  };

  const handleTaxChange = (e: FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    if (parseFloat(value) < 0) return;
    setTaxRates(prev => ({ ...prev, [name]: value }));
  };

  const handleTaxClear = () => {
    setTaxRates({
      federal: '',
      state: '',
      medicare: '',
      socialSecurity: '',
      city: ''
    });
  };

  const handleExpensesDone = () => {
    const total = Object.values(expensesBreakdown).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
    setFormData(prev => ({ ...prev, expenses: total.toString() }));
    setShowExpensesModal(false);
  };

  const handleExpensesClear = () => {
    setExpensesBreakdown({
      rent: '',
      groceries: '',
      eatingOut: '',
      utilities: '',
      transportation: '',
      healthCare: '',
      miscellaneous: '',
      contribution401k: ''
    });
  };

  const handleAddToCompare = (e: FormEvent<HTMLFormElement> | React.MouseEvent) => {
    e.preventDefault();

    if (!formData.collegeName) {
      setError('Please enter a college name to add to comparison');
      setInvalidFields(['collegeName']);
      return;
    }

    if (comparedColleges.length >= 5) {
      alert('You can only compare up to 5 colleges. Please remove one to add another.');
      return;
    }

    const newCollege: SavedCollege = {
      id: Date.now().toString(),
      name: formData.collegeName,
      data: {
        formData: { ...formData },
        tuitionBreakdown: { ...tuitionBreakdown },
        expensesBreakdown: { ...expensesBreakdown },
        taxRates: { ...taxRates },
        inflationRate
      }
    };

    // Check if college already exists (by name) and update it, or add new
    let updatedColleges;
    const existingIndex = comparedColleges.findIndex(c => c.name.toLowerCase() === newCollege.name.toLowerCase());
    
    if (existingIndex >= 0) {
      if (!window.confirm(`${newCollege.name} is already in your comparison list. Do you want to update it with current data?`)) {
        return;
      }
      updatedColleges = [...comparedColleges];
      updatedColleges[existingIndex] = newCollege;
    } else {
      updatedColleges = [...comparedColleges, newCollege];
    }

    setComparedColleges(updatedColleges);
    saveStateToLocalStorage(updatedColleges);
    alert(`${newCollege.name} added to comparison!`);
  };

  const handleLoadComparison = (college: SavedCollege) => {
    setFormData(college.data.formData);
    setTuitionBreakdown(college.data.tuitionBreakdown);
    setExpensesBreakdown(college.data.expensesBreakdown);
    setTaxRates(college.data.taxRates);
    setInflationRate(college.data.inflationRate);
  };

  const handleRemoveComparison = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updatedColleges = comparedColleges.filter(c => c.id !== id);
    setComparedColleges(updatedColleges);
    saveStateToLocalStorage(updatedColleges);
  };

  const handleShowSchedule = () => {
    const principal = calculateLoanAmount();
    const annualInterest = parseFloat(formData.loanInterest) || 0;
    const years = parseFloat(formData.loanTerm) || 0;

    if (principal <= 0 || years <= 0) {
      setPaymentSchedule([]);
    } else {
      const monthlyRate = annualInterest / 100 / 12;
      const numberOfPayments = years * 12;
      const monthlyPayment = calculateMonthlyPayment();

      const schedule: PaymentScheduleRow[] = [];
      let balance = principal;

      for (let i = 1; i <= numberOfPayments; i++) {
        const interest = balance * monthlyRate;
        const principalPayment = monthlyPayment - interest;
        balance = Math.max(0, balance - principalPayment);

        schedule.push({
          month: i,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interest,
          balance: balance
        });
      }
      setPaymentSchedule(schedule);
      setExpandedYears([]);
    }

    setShowSchedule(true);
    setScheduleOpen(true);
    
    setTimeout(() => {
      scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const saveStateToLocalStorage = (collegesToSave = comparedColleges) => {
    const state = {
      formData,
      tuitionBreakdown,
      expensesBreakdown,
      taxRates,
      inflationRate,
      sections,
      paymentSchedule,
      showSchedule,
      scheduleOpen,
      expandedYears,
      showInstructions,
      comparedColleges: collegesToSave,
      showFloatingMetrics
    };
    localStorage.setItem('collegeRoiCalcState', JSON.stringify(state));
  };

  const handleSave = () => {
    saveStateToLocalStorage();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleShare = () => {
    const stateToShare = {
      formData,
      tuitionBreakdown,
      expensesBreakdown,
      taxRates,
      inflationRate
    };
    try {
      const encoded = btoa(encodeURIComponent(JSON.stringify(stateToShare)));
      const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
      navigator.clipboard.writeText(url).then(() => {
        alert('Shareable link copied to clipboard!');
      });
      setShowMainMenu(false);
    } catch (e) {
      console.error('Error generating share link', e);
      alert('Failed to generate share link.');
    }
  };

  const handleClearSave = () => {
    if (window.confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
      localStorage.removeItem('collegeRoiCalcState');
      alert('Saved data cleared from local storage');
    }
  };

  const handleClearForm = () => {
    setShowClearConfirmation(true);
  };

  const confirmClearForm = () => {
      setFormData({
        collegeName: '',
        tuition: '',
        financialAid: '',
        familyContribution: '',
        loanInterest: '',
        loanTerm: '',
        salary: '',
        expenses: ''
      });
      setTuitionBreakdown({
        tuition1: '', roomBoard1: '', financialAid1: '',
        tuition2: '', roomBoard2: '', financialAid2: '',
        tuition3: '', roomBoard3: '', financialAid3: '',
        tuition4: '', roomBoard4: '', financialAid4: ''
      });
      setExpensesBreakdown({
        rent: '2000',
        groceries: '500',
        eatingOut: '300',
        utilities: '150',
        transportation: '200',
        healthCare: '150',
        miscellaneous: '200',
        contribution401k: '500'
      });
      setTaxRates({
        federal: '12.0',
        state: '5.0',
        medicare: '1.45',
        socialSecurity: '6.2',
        city: '0.0'
      });
      setInflationRate('');
      setPaymentSchedule([]);
      setExpandedYears([]);
      setInvalidFields([]);
      setError('');
      setShowClearConfirmation(false);
  };

  const handleExport = () => {
    window.print();
  };

  const calculateFourYearCost = () => {
    return parseFloat(formData.tuition) || 0;
  };

  const calculateFourYearFamilyContribution = () => {
    return (parseFloat(formData.familyContribution) || 0) * 4;
  };

  const calculateLoanAmount = () => {
    const cost = calculateFourYearCost();
    const aid = parseFloat(formData.financialAid) || 0;
    const contribution = calculateFourYearFamilyContribution();
    return Math.max(0, cost - aid - contribution);
  };

  const calculateMonthlyPayment = () => {
    const principal = calculateLoanAmount();
    const annualInterest = parseFloat(formData.loanInterest) || 0;
    const years = parseFloat(formData.loanTerm) || 0;

    if (principal <= 0 || years <= 0) return 0;

    const numberOfPayments = years * 12;

    if (annualInterest === 0) {
      return principal / numberOfPayments;
    }

    const monthlyRate = annualInterest / 100 / 12;
    const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return payment;
  };

  const calculateTotalInterest = () => {
    const monthlyPayment = calculateMonthlyPayment();
    const years = parseFloat(formData.loanTerm) || 0;
    const principal = calculateLoanAmount();

    if (monthlyPayment <= 0 || years <= 0) return 0;

    return Math.max(0, (monthlyPayment * years * 12) - principal);
  };

  const calculateTotalCostOfCollege = () => {
    return calculateFourYearCost() + calculateTotalInterest();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getYearlyData = () => {
    const yearlyData = [];
    let currentYear = 1;
    
    for (let i = 0; i < paymentSchedule.length; i += 12) {
      const yearMonths = paymentSchedule.slice(i, i + 12);
      if (yearMonths.length === 0) continue;

      const totalPayment = yearMonths.reduce((sum, m) => sum + m.payment, 0);
      const totalPrincipal = yearMonths.reduce((sum, m) => sum + m.principal, 0);
      const totalInterest = yearMonths.reduce((sum, m) => sum + m.interest, 0);
      const endBalance = yearMonths[yearMonths.length - 1].balance;
      
      yearlyData.push({
        year: currentYear,
        payment: totalPayment,
        principal: totalPrincipal,
        interest: totalInterest,
        balance: endBalance,
        months: yearMonths
      });
      currentYear++;
    }
    return yearlyData;
  };

  const getMonthlyGross = () => (parseFloat(formData.salary) || 0) / 12;
  
  const getMonthlyTax = () => {
    const gross = getMonthlyGross();
    const totalRate = Object.values(taxRates).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
    return gross * (totalRate / 100);
  };
  
  const getMonthlyTakeHome = () => getMonthlyGross() - getMonthlyTax();

  const calculateEffectiveFederalTaxRate = (annualSalary: number) => {
    const standardDeduction = 14600;
    const taxableIncome = Math.max(0, annualSalary - standardDeduction);
    
    // 2024 Tax Brackets for Single Filers
    const brackets = [
      { limit: 11600, rate: 0.10 },
      { limit: 47150, rate: 0.12 },
      { limit: 100525, rate: 0.22 },
      { limit: 191950, rate: 0.24 },
      { limit: 243725, rate: 0.32 },
      { limit: 609350, rate: 0.35 },
      { limit: Infinity, rate: 0.37 }
    ];

    let tax = 0;
    let previousLimit = 0;

    for (const bracket of brackets) {
      if (taxableIncome > bracket.limit) {
        tax += (bracket.limit - previousLimit) * bracket.rate;
        previousLimit = bracket.limit;
      } else {
        tax += (taxableIncome - previousLimit) * bracket.rate;
        break;
      }
    }

    return annualSalary > 0 ? ((tax / annualSalary) * 100).toFixed(1) : '0.0';
  };

  const calculateTakeHomeAfterLoan = () => {
    return getMonthlyTakeHome() - calculateMonthlyPayment();
  };

  const calculateNetMonthlyCashFlow = () => {
    const takeHome = getMonthlyTakeHome();
    const expenses = parseFloat(formData.expenses) || 0;
    const loanPayment = calculateMonthlyPayment();
    return takeHome - expenses - loanPayment;
  };

  const calculateTenYear401k = () => {
    const monthly = parseFloat(expensesBreakdown.contribution401k) || 0;
    return monthly * 12 * 10;
  };

  const calculateTenYearNetFlow = () => {
    return calculateNetMonthlyCashFlow() * 12 * 10;
  };

  const calculateTotalTenYearSavings = () => {
    return calculateTenYear401k() + calculateTenYearNetFlow();
  };

  const calculateMetrics = (data: SavedCollege['data']) => {
    const { formData, expensesBreakdown, taxRates } = data;
    
    const fourYearCost = parseFloat(formData.tuition) || 0;
    const fourYearAid = parseFloat(formData.financialAid) || 0;
    const fourYearFamily = (parseFloat(formData.familyContribution) || 0) * 4;
    const loanAmount = Math.max(0, fourYearCost - fourYearAid - fourYearFamily);
    
    const annualInterest = parseFloat(formData.loanInterest) || 0;
    const years = parseFloat(formData.loanTerm) || 0;
    
    let monthlyPayment = 0;
    if (loanAmount > 0 && years > 0) {
      if (annualInterest === 0) {
        monthlyPayment = loanAmount / (years * 12);
      } else {
        const monthlyRate = annualInterest / 100 / 12;
        const numberOfPayments = years * 12;
        monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
      }
    }
    
    const totalInterest = Math.max(0, (monthlyPayment * years * 12) - loanAmount);
    const totalCost = fourYearCost + totalInterest;
    
    const monthlyGross = (parseFloat(formData.salary) || 0) / 12;
    const totalTaxRate = Object.values(taxRates).reduce((acc: number, val: any) => acc + (parseFloat(val) || 0), 0);
    const monthlyTax = monthlyGross * (totalTaxRate / 100);
    const monthlyTakeHome = monthlyGross - monthlyTax;
    
    const monthlyExpenses = parseFloat(formData.expenses) || 0;
    const netMonthlyCashFlow = monthlyTakeHome - monthlyExpenses - monthlyPayment;
    
    const monthly401k = parseFloat(expensesBreakdown.contribution401k) || 0;
    const tenYear401k = monthly401k * 12 * 10;
    const tenYearNetFlow = netMonthlyCashFlow * 12 * 10;
    const totalSavings = tenYear401k + tenYearNetFlow;

    return {
        fourYearCost,
        fourYearAid,
        fourYearFamily,
        totalCost,
        loanAmount,
        monthlyPayment,
        totalInterest,
        monthlyTakeHome,
        netMonthlyCashFlow,
        totalSavings
    };
  };

  const getGridTemplateColumns = () => {
    if (showLeftPanel && showRightPanel) return '1fr 2fr 1fr';
    if (showLeftPanel && !showRightPanel) return '1fr 3fr';
    if (!showLeftPanel && showRightPanel) return '3fr 1fr';
    return '1fr';
  };

  const filteredTopics = helpTopics.filter(topic => 
    topic.title.toLowerCase().includes(guidanceSearch.toLowerCase()) ||
    (typeof topic.content === 'string' && topic.content.toLowerCase().includes(guidanceSearch.toLowerCase()))
  );

  return (
    <div className="calculator-container">
      <nav className="navbar">
        <Link to="/" className="brand-name">CollegeROI 🚀</Link>
        {showFloatingMetrics && (
          <div className="navbar-metrics">
            {formData.collegeName && (
              <div className="metric">
                <span className="label">College</span>
                <span className="value" style={{ color: '#334155' }}>{formData.collegeName}</span>
              </div>
            )}
            <div className="metric">
              <span className="label">Net Monthly Cash Flow</span>
              <span className={`value ${calculateNetMonthlyCashFlow() >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(calculateNetMonthlyCashFlow())}
              </span>
            </div>
            <div className="metric">
              <span className="label">10-Year Projected Savings</span>
              <span className={`value ${calculateTotalTenYearSavings() >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(calculateTotalTenYearSavings())}
              </span>
            </div>
          </div>
        )}
        
        <div className="settings-container">
          <button
            className="secondary-button toggle-button"
            onClick={() => setShowMainMenu(!showMainMenu)}
            title="Menu"
            style={{ padding: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>

          {showGuidanceMenu && (
            <div className="guidance-menu">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Guidance</h3>
                <button onClick={() => setShowGuidanceMenu(false)} className="toggle-button" title="Close Guidance">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              {!selectedTopic ? (
                <>
                  <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <input
                      type="text"
                      placeholder="Search help topics..."
                      value={guidanceSearch}
                      onChange={(e) => setGuidanceSearch(e.target.value)}
                      className="guidance-search"
                      style={{ marginBottom: 0, paddingRight: '2.5rem' }}
                    />
                    {guidanceSearch && (
                      <button
                        onClick={() => setGuidanceSearch('')}
                        className="clear-search-button"
                        aria-label="Clear search"
                        title="Clear search"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    )}
                  </div>
                  <ul className="topic-list">
                    {filteredTopics.map(topic => (
                      <li key={topic.id} className="topic-item" onClick={() => setSelectedTopic(topic)}>
                        {topic.title}
                      </li>
                    ))}
                    {filteredTopics.length === 0 && (
                      <li style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem' }}>No topics found.</li>
                    )}
                  </ul>
                </>
              ) : (
                <div className="topic-detail">
                  <button className="back-link" onClick={() => setSelectedTopic(null)}>← Back to topics</button>
                  <h4>{selectedTopic.title}</h4>
                  <p>{selectedTopic.content}</p>
                </div>
              )}
            </div>
          )}

          {showMainMenu && (
            <div className="settings-menu">
              <div className="settings-option action-item" onClick={handleShare}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                Share Scenario
              </div>
              <div className="settings-option action-item" onClick={() => { setShowGuidanceMenu(true); setShowMainMenu(false); }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                Open Guidance
              </div>
              <hr />
              <label className="settings-option">
                <input
                  type="checkbox"
                  checked={showFloatingMetrics}
                  onChange={(e) => setShowFloatingMetrics(e.target.checked)}
                />
                Show Floating Metrics
              </label>
              <label className="settings-option">
                <input
                  type="checkbox"
                  checked={showInstructions}
                  onChange={(e) => setShowInstructions(e.target.checked)}
                />
                Show Instructions
              </label>
            </div>
          )}
        </div>
      </nav>

      <div className={`instructions-panel ${showInstructions ? 'expanded' : 'collapsed'}`}>
        <div className="top-section" style={{ position: 'relative' }}>
          <button
            onClick={() => setShowInstructions(false)}
            className="toggle-button"
            style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '50%', width: '24px', height: '24px', padding: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 10 }}
            title="Hide Instructions"
            aria-label="Hide Instructions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div className="instructions">
            <h4>Why use CollegeROI ?</h4>
            <p>
              College is a significant investment. This calculator helps you evaluate the financial Return on Investment (<span className="info-icon" style={{ margin: 0, color: 'inherit', borderBottom: '1px dotted currentColor' }}>
                ROI
                <span className="tooltip-text" style={{ width: '200px' }}>
                  Return on Investment: A measure of the profitability of an investment relative to its cost.
                </span>
              </span>) of your degree 
              by connecting tuition costs, loan interest, and future earnings. Visualize your monthly cash flow and savings to make informed decisions.
            </p>
          </div>
          <div className="instructions">
            <h4>How to use</h4>
            <ol>
              <li>
                <strong>Inputs:</strong> Search for a college or enter data manually from your research. Click on Tuition, Financial Aid, Taxes, and Expenses fields to enter detailed breakdowns.
              </li>
              <li>
                <strong>Analyze:</strong> Review the estimated cost, loan, and cash flow projections in the center column.
              </li>
              <li>
                <strong>Compare:</strong> Click "Add to Comparison" to save up to 5 colleges and view them side-by-side using the "Detailed Comparison" button.
              </li>
            </ol>
          </div>
        </div>
      </div>
      
      <div className="content-grid" style={{ gridTemplateColumns: getGridTemplateColumns() }}>
        {showLeftPanel && (
          <div className="column left-col">
            <div className="section-header">
              <h3>Your Data </h3>
              <button 
                type="button" 
                className="secondary-button" 
                onClick={handleClearForm}
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                title="Reset all inputs to default"
              >
                Clear
              </button>
            </div>
          <form className="input-form" onSubmit={handleAddToCompare}>
            <div className="collapsible-section">
              <button type="button" className={`section-toggle ${!sections.costs ? 'closed' : ''}`} onClick={() => toggleSection('costs')}>
                <span>Select College</span>
                <span>{sections.costs ? '−' : '+'}</span>
              </button>
              {sections.costs && (
                <div className="section-content">
                  <div className="input-group" style={{ position: 'relative' }}>
                    <label htmlFor="collegeName">College Name</label>
                    <input
                      type="text"
                      id="collegeName"
                      name="collegeName"
                      placeholder="Type to search colleges..."
                      value={formData.collegeName}
                      onChange={handleCollegeNameChange}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      autoComplete="off"
                      className={invalidFields.includes('collegeName') ? 'error-input' : ''}
                    />
                    {showSuggestions && suggestions.length > 0 && (
                      <ul className="suggestions-list">
                        {suggestions.map(college => (
                          <li key={college.rank} onMouseDown={() => handleSuggestionClick(college)}>
                            {college.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  
                  <div className="input-group">
                    <label htmlFor="tuition">Estimated 4-Year Tuition ($)</label>
                    <input
                      type="number"
                      id="tuition"
                      name="tuition"
                      placeholder="Click to enter tuition breakdown"
                      value={formData.tuition}
                      readOnly
                      onClick={() => setShowTuitionModal(true)}
                      className={invalidFields.includes('tuition') ? 'error-input' : ''}
                    />
                  </div>
                  <button type="button" className="secondary-button" style={{ width: '100%' }} onClick={() => toggleSection('loans')}>
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="collapsible-section">
              <button type="button" className={`section-toggle ${!sections.loans ? 'closed' : ''}`} onClick={() => toggleSection('loans')}>
                <span>Paying for college</span>
                <span>{sections.loans ? '−' : '+'}</span>
              </button>
              {sections.loans && (
                <div className="section-content">
                  <div className="input-row">
                    <div className="input-group">
                      <label htmlFor="financialAid">Expected 4-Year Financial Aid ($)</label>
                      <input
                        type="number"
                        id="financialAid"
                        name="financialAid"
                        placeholder="Click to enter financial aid"
                        value={formData.financialAid}
                        readOnly
                        onClick={() => setShowFinancialAidModal(true)}
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="familyContribution">Est. Family Contribution ($/yr)</label>
                      <input
                        type="number"
                        id="familyContribution"
                        name="familyContribution"
                        placeholder="e.g. 40,000"
                        value={formData.familyContribution}
                        onChange={handleChange}
                        className={invalidFields.includes('familyContribution') ? 'error-input' : ''}
                      />
                    </div>
                  </div>
                  <div className="input-row">
                    <div className="input-group">
                      <label htmlFor="loanInterest">Loan Interest (%)</label>
                      <input
                        type="number"
                        id="loanInterest"
                        name="loanInterest"
                        step="0.1"
                        placeholder="e.g. 5.5"
                        value={formData.loanInterest}
                        onChange={handleChange}
                        className={invalidFields.includes('loanInterest') ? 'error-input' : ''}
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="loanTerm">Expected Loan Term (yrs)</label>
                      <input
                        type="number"
                        id="loanTerm"
                        name="loanTerm"
                        placeholder="e.g. 10"
                        value={formData.loanTerm}
                        onChange={handleChange}
                        className={invalidFields.includes('loanTerm') ? 'error-input' : ''}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" className="schedule-button" style={{ flex: 1 }} onClick={handleShowSchedule}>
                      Show Estimated Payment Schedule
                    </button>
                    <button type="button" className="secondary-button" style={{ flex: 1 }} onClick={() => toggleSection('payments')}>
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="collapsible-section">
              <button type="button" className={`section-toggle ${!sections.payments ? 'closed' : ''}`} onClick={() => toggleSection('payments')}>
                <span>ROI</span>
                <span>{sections.payments ? '−' : '+'}</span>
              </button>
              {sections.payments && (
                <div className="section-content">
                  <div className="input-group">
                    <label htmlFor="salary">Expected Annual Starting Salary ($)</label>
                    <input
                      type="number"
                      id="salary"
                      name="salary"
                      placeholder="e.g. 60000"
                      value={formData.salary}
                      onChange={handleChange}
                      className={invalidFields.includes('salary') ? 'error-input' : ''}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="takeHomePay">Estimated takehome after taxes (Monthly $)</label>
                    <input
                      type="number"
                      id="takeHomePay"
                      placeholder="Click to calculate taxes"
                      value={Math.round(getMonthlyTakeHome()) || ''}
                      readOnly
                      onClick={() => {
                        const salary = parseFloat(formData.salary) || 0;
                        if (salary > 0) {
                          const estimatedFedRate = calculateEffectiveFederalTaxRate(salary);
                          setTaxRates(prev => ({ ...prev, federal: estimatedFedRate }));
                        }
                        setShowTaxModal(true);
                      }}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="expenses">Estimated Monthly Expenses ($)</label>
                    <input
                      type="number"
                      id="expenses"
                      name="expenses"
                      placeholder="Click to enter expenses breakdown"
                      value={formData.expenses}
                      readOnly
                      onClick={() => setShowExpensesModal(true)}
                    />
                  </div>
                  {error && <div className="error-message">{error}</div>}
                  <button type="submit" className="add-to-compare-button" style={{ width: '100%' }} onClick={handleAddToCompare}>
                    Add to Comparison
                  </button>
                </div>
              )}
            </div>
          </form>
          </div>
        )}

        <div className="column center-col">
          <div className="section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                type="button" 
                className="toggle-button" 
                onClick={() => setShowLeftPanel(!showLeftPanel)}
                title={showLeftPanel ? "Collapse Inputs" : "Expand Inputs"}
              >
                {showLeftPanel ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>}
              </button>
              <h3>Estimates & Summaries</h3>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="schedule-button" onClick={handleSave} aria-label="Save" title="Save">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                {saveSuccess && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.5rem' }}><polyline points="20 6 9 17 4 12"></polyline></svg>
                )}
              </button>
              <button type="button" className="schedule-button" onClick={handleClearSave} aria-label="Clear Saved Data" title="Clear Saved Data">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
              <button type="button" className="schedule-button" onClick={handleExport} aria-label="Export" title="Export">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </button>
              <button 
                type="button" 
                className="toggle-button" 
                onClick={() => setShowRightPanel(!showRightPanel)}
                title={showRightPanel ? "Collapse Compare" : "Expand Compare"}
              >
                {showRightPanel ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>}
              </button>
            </div>
          </div>
          <div className="result-card">
            <h4 style={{ margin: 0, color: '#334155' }}>
              Estimated Cost Summary
              <span className="info-icon" style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <span className="tooltip-text" style={{ width: '250px', fontWeight: 'normal', textTransform: 'none' }}>
                  These figures are projections based on the data you entered. Actual cost to attend college will vary based on actuals.
                </span>
              </span>
            </h4>
            <div className="result-item">
              <h4>4-Year Cost</h4>
              <div className="value">{formatCurrency(calculateFourYearCost())}</div>
            </div>
            <div className="result-item">
              <h4>4-Year Financial Aid</h4>
              <div className="value" style={{ color: '#10b981' }}>{formatCurrency(parseFloat(formData.financialAid) || 0)}</div>
            </div>
            <div className="result-item">
              <h4>4-Year Family Contribution</h4>
              <div className="value">{formatCurrency(calculateFourYearFamilyContribution())}</div>
            </div>
            <div className="result-item">
              <h4>Total Cost of College</h4>
              <div className="value">{formatCurrency(calculateTotalCostOfCollege())}</div>
            </div>
          </div>
          <div className="result-card">
            <h4 style={{ margin: 0, color: '#334155' }}>
              Estimated Loan Summary
              <span className="info-icon" style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <span className="tooltip-text" style={{ width: '250px', fontWeight: 'normal', textTransform: 'none' }}>
                  This shows the estimated breakdown of your loan principal, monthly payments, and total interest paid over the loan term, based on the data you entered. Actual loan principal, monthly payments, and total interest paid to attend college will vary based on actuals.
                </span>
              </span>
            </h4>
            <div className="result-item">
              <h4>Loan Amount</h4>
              <div className="value">{formatCurrency(calculateLoanAmount())}</div>
            </div>
            <div className="result-item">
              <h4>Monthly Payment</h4>
              <div className="value">{formatCurrency(calculateMonthlyPayment())}</div>
            </div>
            <div className="result-item">
              <h4>Total Interest Paid</h4>
              <div className="value">{formatCurrency(calculateTotalInterest())}</div>
            </div>
          </div>
          <div className="result-card">
            <h4 style={{ margin: 0, color: '#334155' }}>
              Estimated Cash Flow
              <span className="info-icon" style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <span className="tooltip-text" style={{ width: '250px', fontWeight: 'normal', textTransform: 'none' }}>
                  Estimated of the breakdown of your monthly income, taxes, loan payments, and expenses to show your expected net monthly cash flow. Actual net monthly cash flow will vary based on your specific circumstances.
                </span>
              </span>
            </h4>
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'right' }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Estimated Monthly Salary</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{formatCurrency(getMonthlyGross())}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(getMonthlyGross())}</td>
                </tr>
                <tr>
                  <td>Estimated Taxes</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>-{formatCurrency(getMonthlyTax())}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(getMonthlyTakeHome())}</td>
                </tr>
                <tr>
                  <td>Loan Payment</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>-{formatCurrency(calculateMonthlyPayment())}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(calculateTakeHomeAfterLoan())}</td>
                </tr>
                <tr>
                  <td>Monthly Expenses</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>-{formatCurrency(parseFloat(formData.expenses) || 0)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: calculateNetMonthlyCashFlow() >= 0 ? '#10b981' : '#ef4444' }}>
                    {formatCurrency(calculateNetMonthlyCashFlow())}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '2px solid #cbd5e1' }}>
                  <td style={{ fontWeight: '800', paddingTop: '0.75rem', color: '#1e293b' }}>Net Monthly Cash Flow</td>
                  <td></td>
                  <td style={{ textAlign: 'right', fontWeight: '800', paddingTop: '0.75rem', fontSize: '1.1rem', color: calculateNetMonthlyCashFlow() >= 0 ? '#10b981' : '#ef4444' }}>
                    {formatCurrency(calculateNetMonthlyCashFlow())}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="result-card">
            <h4 style={{ margin: 0, color: '#334155' }}>
              10-Year Return On Investment (ROI)
              <span className="info-icon" style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <span className="tooltip-text" style={{ width: '250px', fontWeight: 'normal', textTransform: 'none' }}>
                  Potential savings accumulated over 10 years based on your estimated net cash flow and 401k contributions.
                </span>
              </span>
            </h4>
            <div className="result-item">
              <h4>Accumulated Net Cash Flow</h4>
              <div className="value" style={{ color: calculateTenYearNetFlow() >= 0 ? '#10b981' : '#ef4444' }}>
                {formatCurrency(calculateTenYearNetFlow())}
              </div>
            </div>
            <div className="result-item">
              <h4>Total 401k Contribution</h4>
              <div className="value">{formatCurrency(calculateTenYear401k())}</div>
            </div>
            <div className="result-item">
              <h4>Total Projected Savings</h4>
              <div className="value" style={{ color: calculateTotalTenYearSavings() >= 0 ? '#10b981' : '#ef4444' }}>
                {formatCurrency(calculateTotalTenYearSavings())}
              </div>
            </div>
          </div>

          {showSchedule && (
            <div ref={scheduleRef} className="result-card" style={{ padding: 0, overflow: 'hidden' }}>
              <button 
                type="button" 
                className={`section-toggle ${!scheduleOpen ? 'closed' : ''}`} 
                onClick={() => setScheduleOpen(!scheduleOpen)}
                style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}
              >
                <span>Estimated Payment Schedule</span>
                <span>{scheduleOpen ? '−' : '+'}</span>
              </button>
              {scheduleOpen && (
                <div className="schedule-container">
                  <table className="schedule-table">
                    <thead>
                      <tr>
                        <th>Year / Month</th>
                        <th>Payment</th>
                        <th>Principal</th>
                        <th>Interest</th>
                        <th>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentSchedule.length > 0 ? (
                        getYearlyData().map((yearData) => (
                          <Fragment key={yearData.year}>
                            <tr 
                              onClick={() => toggleYear(yearData.year)} 
                              style={{ cursor: 'pointer', fontWeight: 'bold', background: 'rgba(255,255,255,0.6)' }}
                            >
                              <td style={{ textAlign: 'left', paddingLeft: '1rem' }}>
                                <span style={{ display: 'inline-block', width: '1.5rem' }}>{expandedYears.includes(yearData.year) ? '−' : '+'}</span>
                                Year {yearData.year}
                              </td>
                              <td>{formatCurrency(yearData.payment)}</td>
                              <td>{formatCurrency(yearData.principal)}</td>
                              <td>{formatCurrency(yearData.interest)}</td>
                              <td>{formatCurrency(yearData.balance)}</td>
                            </tr>
                            {expandedYears.includes(yearData.year) && yearData.months.map((row) => (
                              <tr key={row.month} style={{ background: 'rgba(255,255,255,0.3)' }}>
                                <td style={{ textAlign: 'left', paddingLeft: '3rem' }}>Month {row.month}</td>
                                <td>{formatCurrency(row.payment)}</td>
                                <td>{formatCurrency(row.principal)}</td>
                                <td>{formatCurrency(row.interest)}</td>
                                <td>{formatCurrency(row.balance)}</td>
                              </tr>
                            ))}
                          </Fragment>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '1rem' }}>
                            No loan data available. Please check your inputs.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
        {showRightPanel && (
          <div className="column right-col">
            <div className="section-header">
              <h3>Compare</h3>
              {comparedColleges.length > 0 && (
                <button 
                  className="secondary-button" 
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                  onClick={() => setShowComparisonModal(true)}
                >
                  Detailed Comparison
                </button>
              )}
            </div>
            
            {comparedColleges.length === 0 ? (
              <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem' }}>
                Add colleges to comparison to see them here.
              </p>
            ) : (
              <div className="comparison-list">
                {comparedColleges.map(college => {
                  const metrics = calculateMetrics(college.data);
                  const isSelected = formData.collegeName.toLowerCase() === college.name.toLowerCase();
                  return (
                    <div 
                      key={college.id} 
                      className="comparison-card" 
                      onClick={() => handleLoadComparison(college)} 
                      title={isSelected ? "Currently viewing" : "Click to load data"}
                      style={isSelected ? { border: '2px solid #6366f1', backgroundColor: '#eff6ff' } : undefined}
                    >
                      <div className="comparison-card-header">
                        <span className="college-name">
                          {college.name}
                          {isSelected && (
                            <span style={{ 
                              fontSize: '0.7rem', 
                              marginLeft: '0.5rem', 
                              color: '#4338ca', 
                              backgroundColor: '#e0e7ff', 
                              padding: '0.1rem 0.4rem', 
                              borderRadius: '1rem',
                              verticalAlign: 'middle',
                              fontWeight: 'normal'
                            }}>
                              Active
                            </span>
                          )}
                        </span>
                        <button 
                          className="comparison-remove" 
                          onClick={(e) => handleRemoveComparison(e, college.id)}
                          title="Remove from comparison"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                      <div className="comparison-metric">
                        <span className="label">Net Monthly Flow</span>
                        <span className={`value ${metrics.netMonthlyCashFlow >= 0 ? 'positive' : 'negative'}`}>
                          {formatCurrency(metrics.netMonthlyCashFlow)}
                        </span>
                      </div>
                      <div className="comparison-metric">
                        <span className="label">10-Year ROI</span>
                        <span className={`value ${metrics.totalSavings >= 0 ? 'positive' : 'negative'}`}>
                          {formatCurrency(metrics.totalSavings)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {showTuitionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>4-Year Cost Breakdown</h3>
            <div className="input-form" style={{ maxWidth: '100%', overflowX: 'auto' }}>
              {['1', '2', '3', '4'].map((year) => (
                <div key={year}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, color: '#334155' }}>Year {year}</h4>
                    {year === '1' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#334155' }}>Inflation %</span>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input
                            type="number"
                            placeholder="Inflation"
                            title="Enter annual inflation rate to apply when copying to future years"
                            value={inflationRate}
                            onChange={(e) => setInflationRate(e.target.value)}
                            style={{
                              width: '90px',
                              padding: '0.25rem 0.5rem 0.25rem 0.5rem',
                              fontSize: '0.8rem',
                              border: '1px solid #cbd5e1',
                              borderRadius: '0.25rem',
                              background: 'white',
                              color: 'black'
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyYear1}
                          style={{
                            fontSize: '0.8rem',
                            padding: '0.25rem 0.5rem',
                            background: '#e2e8f0',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            color: '#475569'
                          }}
                        >
                          Copy to all ↓
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="input-row">
                    <div className="input-group">
                      <label htmlFor={`tuition${year}`}>Tuition + Other</label>
                      <input
                        type="number"
                        id={`tuition${year}`}
                        name={`tuition${year}`}
                        min="0"
                        placeholder="e.g. 40000"
                        value={tuitionBreakdown[`tuition${year}` as keyof typeof tuitionBreakdown]}
                        onChange={handleTuitionChange}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor={`roomBoard${year}`}>Room + Board</label>
                      <input
                        type="number"
                        id={`roomBoard${year}`}
                        name={`roomBoard${year}`}
                        min="0"
                        placeholder="e.g. 15000"
                        value={tuitionBreakdown[`roomBoard${year}` as keyof typeof tuitionBreakdown]}
                        onChange={handleTuitionChange}
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="calculate-button" onClick={handleTuitionDone} style={{ flex: 1 }}>
                  Done
                </button>
                <button 
                  type="button" 
                  className="calculate-button" 
                  onClick={handleTuitionClear}
                  style={{ flex: 1, background: '#64748b' }}>
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFinancialAidModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>4-Year Financial Aid Breakdown</h3>
            <div className="input-form" style={{ maxWidth: '100%', overflowX: 'auto' }}>
              {['1', '2', '3', '4'].map((year) => (
                <div key={year}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, color: '#334155' }}>Year {year}</h4>
                    {year === '1' && (
                      <button
                        type="button"
                        onClick={handleCopyFinancialAidYear1}
                        style={{
                          fontSize: '0.8rem',
                          padding: '0.25rem 0.5rem',
                          background: '#e2e8f0',
                          border: 'none',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          color: '#475569'
                        }}
                      >
                        Copy to all ↓
                      </button>
                    )}
                  </div>
                  <div className="input-group">
                    <label htmlFor={`financialAid${year}`}>Financial Aid ($)</label>
                    <input
                      type="number"
                      id={`financialAid${year}`}
                      name={`financialAid${year}`}
                      min="0"
                      placeholder="e.g. 5000"
                      value={tuitionBreakdown[`financialAid${year}` as keyof typeof tuitionBreakdown]}
                      onChange={handleTuitionChange}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="calculate-button" onClick={handleFinancialAidDone} style={{ flex: 1 }}>
                  Done
                </button>
                <button 
                  type="button" 
                  className="calculate-button" 
                  onClick={handleFinancialAidClear}
                  style={{ flex: 1, background: '#64748b' }}>
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showExpensesModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Monthly Expenses Breakdown</h3>
            <div className="input-form">
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="rent">
                    Rent
                    <span className="info-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      <span className="tooltip-text">Monthly rent or mortgage payment</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="rent"
                    name="rent"
                    min="0"
                    placeholder="e.g. 1500"
                    value={expensesBreakdown.rent}
                    onChange={handleExpensesChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="groceries">
                    Groceries
                    <span className="info-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      <span className="tooltip-text">Food and household supplies</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="groceries"
                    name="groceries"
                    min="0"
                    placeholder="e.g. 400"
                    value={expensesBreakdown.groceries}
                    onChange={handleExpensesChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="eatingOut">
                    Eating out
                    <span className="info-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      <span className="tooltip-text">Restaurants, cafes, and takeout</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="eatingOut"
                    name="eatingOut"
                    min="0"
                    placeholder="e.g. 200"
                    value={expensesBreakdown.eatingOut}
                    onChange={handleExpensesChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="utilities">
                    Utilities
                    <span className="info-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      <span className="tooltip-text">Electricity, water, gas, internet, phone</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="utilities"
                    name="utilities"
                    min="0"
                    placeholder="e.g. 150"
                    value={expensesBreakdown.utilities}
                    onChange={handleExpensesChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="transportation">
                    Transportation
                    <span className="info-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      <span className="tooltip-text">Gas, insurance, maintenance, public transit</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="transportation"
                    name="transportation"
                    min="0"
                    placeholder="e.g. 300"
                    value={expensesBreakdown.transportation}
                    onChange={handleExpensesChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="healthCare">
                    HealthCare
                    <span className="info-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      <span className="tooltip-text">Insurance premiums, copays, medications</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="healthCare"
                    name="healthCare"
                    min="0"
                    placeholder="e.g. 100"
                    value={expensesBreakdown.healthCare}
                    onChange={handleExpensesChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="miscellaneous">
                    Miscellaneous
                    <span className="info-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      <span className="tooltip-text">Clothing, entertainment, personal care</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="miscellaneous"
                    name="miscellaneous"
                    min="0"
                    placeholder="e.g. 100"
                    value={expensesBreakdown.miscellaneous}
                    onChange={handleExpensesChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="contribution401k">
                    401k Contribution
                    <span className="info-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      <span className="tooltip-text">Monthly retirement savings contribution</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="contribution401k"
                    name="contribution401k"
                    min="0"
                    placeholder="e.g. 500"
                    value={expensesBreakdown.contribution401k}
                    onChange={handleExpensesChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="calculate-button" onClick={handleExpensesDone} style={{ flex: 1 }}>
                  Done
                </button>
                <button 
                  type="button" 
                  className="calculate-button" 
                  onClick={handleExpensesClear}
                  style={{ flex: 1, background: '#64748b' }}>
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTaxModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Estimated Monthly Tax Breakdown</h3>
            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
              Monthly Gross Income: <strong>{formatCurrency(getMonthlyGross())}</strong>
            </p>
            <div className="input-form">
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="federal">
                    Federal Tax (%)
                    <span className="info-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                      <div className="tooltip-text wide-tooltip">
                        <div style={{ marginBottom: '0.5rem', fontWeight: 'bold', textAlign: 'center' }}>2024 Tax Brackets (Single)</div>
                        <table className="tooltip-table">
                          <thead>
                            <tr><th style={{ textAlign: 'left' }}>Income Range</th><th style={{ textAlign: 'right' }}>Rate</th></tr>
                          </thead>
                          <tbody>
                            <tr><td>$0 - $11,600</td><td style={{ textAlign: 'right' }}>10%</td></tr>
                            <tr><td>$11,601 - $47,150</td><td style={{ textAlign: 'right' }}>12%</td></tr>
                            <tr><td>$47,151 - $100,525</td><td style={{ textAlign: 'right' }}>22%</td></tr>
                            <tr><td>$100,526 - $191,950</td><td style={{ textAlign: 'right' }}>24%</td></tr>
                            <tr><td>$191,951 - $243,725</td><td style={{ textAlign: 'right' }}>32%</td></tr>
                            <tr><td>$243,726 - $609,350</td><td style={{ textAlign: 'right' }}>35%</td></tr>
                            <tr><td>$609,351+</td><td style={{ textAlign: 'right' }}>37%</td></tr>
                          </tbody>
                        </table>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', fontStyle: 'italic', textAlign: 'center' }}>* Standard deduction: $14,600</div>
                      </div>
                    </span>
                  </label>
                  <input
                    type="number"
                    id="federal"
                    name="federal"
                    step="0.1"
                    value={taxRates.federal}
                    onChange={handleTaxChange}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="state">State Tax (%)</label>
                  <input
                    type="number"
                    id="state"
                    name="state"
                    step="0.1"
                    value={taxRates.state}
                    onChange={handleTaxChange}
                  />
                </div>
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="city">City/County Tax (%)</label>
                  <input
                    type="number"
                    id="city"
                    name="city"
                    step="0.1"
                    value={taxRates.city}
                    onChange={handleTaxChange}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="socialSecurity">Social Security (%)</label>
                  <input
                    type="number"
                    id="socialSecurity"
                    name="socialSecurity"
                    step="0.1"
                    value={taxRates.socialSecurity}
                    onChange={handleTaxChange}
                  />
                </div>
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="medicare">Medicare (%)</label>
                  <input
                    type="number"
                    id="medicare"
                    name="medicare"
                    step="0.1"
                    value={taxRates.medicare}
                    onChange={handleTaxChange}
                  />
                </div>
              </div>
              
              <div className="result-card" style={{ marginTop: '1rem', background: '#f8fafc' }}>
                <div className="result-item" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
                  <h4>Total Monthly Tax</h4>
                  <div className="value" style={{ fontSize: '1.1rem', color: '#ef4444' }}>
                    {formatCurrency(getMonthlyTax())}
                  </div>
                </div>
                <div style={{ padding: '0 0 1rem 0', borderBottom: '1px solid #e2e8f0', marginBottom: '1rem', fontSize: '0.85rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Federal ({taxRates.federal}%)</span>
                    <span>{formatCurrency(getMonthlyGross() * (parseFloat(taxRates.federal) || 0) / 100)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>State ({taxRates.state}%)</span>
                    <span>{formatCurrency(getMonthlyGross() * (parseFloat(taxRates.state) || 0) / 100)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>City/County ({taxRates.city}%)</span>
                    <span>{formatCurrency(getMonthlyGross() * (parseFloat(taxRates.city) || 0) / 100)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Social Security ({taxRates.socialSecurity}%)</span>
                    <span>{formatCurrency(getMonthlyGross() * (parseFloat(taxRates.socialSecurity) || 0) / 100)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Medicare ({taxRates.medicare}%)</span>
                    <span>{formatCurrency(getMonthlyGross() * (parseFloat(taxRates.medicare) || 0) / 100)}</span>
                  </div>
                </div>
                <div className="result-item">
                  <h4>Est. Monthly Take-home</h4>
                  <div className="value" style={{ fontSize: '1.1rem', color: '#10b981' }}>
                    {formatCurrency(getMonthlyTakeHome())}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="calculate-button" onClick={() => setShowTaxModal(false)} style={{ flex: 1 }}>
                  Done
                </button>
                <button 
                  type="button" 
                  className="calculate-button" 
                  onClick={handleTaxClear}
                  style={{ flex: 1, background: '#64748b' }}>
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showComparisonModal && (
        <div className="modal-overlay">
          <div className="modal-content comparison-modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>
                College Comparison (Estimates)
                <span className="info-icon" style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  <span className="tooltip-text" style={{ width: '250px', fontWeight: 'normal', textTransform: 'none' }}>
                    Side-by-side comparison of estimated key financial metrics for your saved colleges.
                  </span>
                </span>
              </h3>
              <button onClick={() => setShowComparisonModal(false)} className="secondary-button">Close</button>
            </div>
            <div className="comparison-table-container">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th></th>
                    {comparedColleges.map(c => <th key={c.id}>{c.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>4-Year Cost</td>
                    {comparedColleges.map(c => <td key={c.id}>{formatCurrency(calculateMetrics(c.data).fourYearCost)}</td>)}
                  </tr>
                  <tr>
                    <td>4-Year Financial Aid</td>
                    {comparedColleges.map(c => <td key={c.id} style={{ color: '#10b981' }}>{formatCurrency(calculateMetrics(c.data).fourYearAid)}</td>)}
                  </tr>
                  <tr>
                    <td>Loan Amount</td>
                    {comparedColleges.map(c => <td key={c.id}>{formatCurrency(calculateMetrics(c.data).loanAmount)}</td>)}
                  </tr>
                  <tr>
                    <td>Total Interest Paid</td>
                    {comparedColleges.map(c => <td key={c.id}>{formatCurrency(calculateMetrics(c.data).totalInterest)}</td>)}
                  </tr>
                  <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                    <td>Total Cost of College</td>
                    {comparedColleges.map(c => <td key={c.id}>{formatCurrency(calculateMetrics(c.data).totalCost)}</td>)}
                  </tr>
                  <tr>
                    <td>Monthly Loan Payment</td>
                    {comparedColleges.map(c => <td key={c.id} style={{ color: '#ef4444' }}>{formatCurrency(calculateMetrics(c.data).monthlyPayment)}</td>)}
                  </tr>
                  <tr>
                    <td>Net Monthly Cash Flow</td>
                    {comparedColleges.map(c => {
                      const val = calculateMetrics(c.data).netMonthlyCashFlow;
                      return <td key={c.id} style={{ color: val >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{formatCurrency(val)}</td>;
                    })}
                  </tr>
                  <tr>
                    <td>10-Year Projected Savings</td>
                    {comparedColleges.map(c => {
                      const val = calculateMetrics(c.data).totalSavings;
                      return <td key={c.id} style={{ color: val >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{formatCurrency(val)}</td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showClearConfirmation && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0 }}>Clear Data?</h3>
            <p>Are you sure you want to clear all input fields? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="secondary-button" style={{ flex: 1 }} onClick={() => setShowClearConfirmation(false)}>Cancel</button>
              <button className="secondary-button" style={{ flex: 1, background: '#ef4444', color: 'white', borderColor: '#ef4444' }} onClick={confirmClearForm}>Clear All</button>
            </div>
          </div>
        </div>
      )}

      <footer className="site-footer">
        <p>
          <strong>Disclaimer:</strong> The financial projections, college costs, and tax estimates provided by this tool are calculations based on user inputs and assumptions. 
          They are for informational purposes only and do not constitute professional financial, tax, or legal advice. 
          Please consult with a qualified professional before making any financial decisions.
        </p>
      </footer>

      <div className="print-footer">
        <span>Generated using CollegeROI.app</span>
        <span>{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default Calculator;