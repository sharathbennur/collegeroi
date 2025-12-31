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

const Calculator = () => {
  const [formData, setFormData] = useState({
    collegeName: '',
    tuition: '',
    familyContribution: '',
    loanInterest: '',
    loanTerm: '',
    salary: '',
    expenses: ''
  });
  const [error, setError] = useState('');
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [showTuitionModal, setShowTuitionModal] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof colleges>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tuitionBreakdown, setTuitionBreakdown] = useState({
    tuition1: '',
    roomBoard1: '',
    tuition2: '',
    roomBoard2: '',
    tuition3: '',
    roomBoard3: '',
    tuition4: '',
    roomBoard4: ''
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

  useEffect(() => {
    const savedState = localStorage.getItem('collegeRoiCalcState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.formData) setFormData(parsedState.formData);
        if (parsedState.tuitionBreakdown) setTuitionBreakdown(parsedState.tuitionBreakdown);
        if (parsedState.expensesBreakdown) setExpensesBreakdown(parsedState.expensesBreakdown);
        if (parsedState.taxRates) setTaxRates(parsedState.taxRates);
        if (parsedState.inflationRate) setInflationRate(parsedState.inflationRate);
        if (parsedState.sections) setSections(parsedState.sections);
        if (parsedState.paymentSchedule) setPaymentSchedule(parsedState.paymentSchedule);
        if (parsedState.showSchedule !== undefined) setShowSchedule(parsedState.showSchedule);
        if (parsedState.scheduleOpen !== undefined) setScheduleOpen(parsedState.scheduleOpen);
        if (parsedState.expandedYears) setExpandedYears(parsedState.expandedYears);
        if (parsedState.showInstructions !== undefined) setShowInstructions(parsedState.showInstructions);
      } catch (error) {
        console.error('Error loading saved state:', error);
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
        tuition2: t2.toString(), roomBoard2: rb2.toString(),
        tuition3: t3.toString(), roomBoard3: rb3.toString(),
        tuition4: t4.toString(), roomBoard4: rb4.toString()
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
    const total = Object.values(tuitionBreakdown).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
    setFormData(prev => ({ ...prev, tuition: total.toString() }));
    setShowTuitionModal(false);
    
    if (invalidFields.includes('tuition')) {
      setInvalidFields(prev => prev.filter(field => field !== 'tuition'));
    }
    
    if (error) setError('');
  };

  const handleTuitionClear = () => {
    setTuitionBreakdown({
      tuition1: '',
      roomBoard1: '',
      tuition2: '',
      roomBoard2: '',
      tuition3: '',
      roomBoard3: '',
      tuition4: '',
      roomBoard4: ''
    });
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { collegeName, tuition, familyContribution, loanInterest, loanTerm, salary } = formData;
    const missingFields = [];
    if (!collegeName) missingFields.push('collegeName');
    if (!tuition) missingFields.push('tuition');
    if (!familyContribution) missingFields.push('familyContribution');
    if (!loanInterest) missingFields.push('loanInterest');
    if (!loanTerm) missingFields.push('loanTerm');
    if (!salary) missingFields.push('salary');

    if (missingFields.length > 0) {
      setError('Please fill in all fields with valid data');
      setInvalidFields(missingFields);
      return;
    }

    console.log('Form submitted:', formData);
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

  const handleSave = () => {
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
      showInstructions
    };
    localStorage.setItem('collegeRoiCalcState', JSON.stringify(state));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleClearSave = () => {
    if (window.confirm('Are you sure you want to clear all saved data? This action cannot be undone.')) {
      localStorage.removeItem('collegeRoiCalcState');
      alert('Saved data cleared from local storage');
    }
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
    const contribution = calculateFourYearFamilyContribution();
    return Math.max(0, cost - contribution);
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

  const getGridTemplateColumns = () => {
    if (showLeftPanel && showRightPanel) return '1fr 2fr 1fr';
    if (showLeftPanel && !showRightPanel) return '1fr 3fr';
    if (!showLeftPanel && showRightPanel) return '3fr 1fr';
    return '1fr';
  };

  return (
    <div className="calculator-container">
      <nav className="navbar">
        <Link to="/" className="brand-name">CollegeROI 🚀</Link>
      </nav>

      {showInstructions ? (
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
                <strong>Costs:</strong> Enter a yearly breakdown of college costs or use <strong>Auto-fill</strong> for popular colleges.
              </li>
              <li>
                <strong>Loans:</strong> Input your loan interest rate and term. View details with <strong>Show Payment Schedule</strong>.
              </li>
              <li>
                <strong>Payments:</strong> Input expected salary and expenses to calculate your net monthly cash flow.
              </li>
            </ol>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
          <button 
            onClick={() => setShowInstructions(true)}
            className="secondary-button"
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', opacity: 0.8 }}
          >
            Show Instructions ▾
          </button>
        </div>
      )}
      
      <div className="content-grid" style={{ gridTemplateColumns: getGridTemplateColumns() }}>
        {showLeftPanel && (
          <div className="column left-col">
            <div className="section-header">
              <h3>Inputs</h3>
            </div>
          <form className="input-form" onSubmit={handleSubmit}>
            <div className="collapsible-section">
              <button type="button" className={`section-toggle ${!sections.costs ? 'closed' : ''}`} onClick={() => toggleSection('costs')}>
                <span>Costs</span>
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
                    <label htmlFor="tuition">4-Year Tuition ($)</label>
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

                  <div className="input-group">
                    <label htmlFor="familyContribution">Annual Family Contribution ($)</label>
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
                  <button type="button" className="secondary-button" style={{ width: '100%' }} onClick={() => toggleSection('loans')}>
                    Next
                  </button>
                </div>
              )}
            </div>

            <div className="collapsible-section">
              <button type="button" className={`section-toggle ${!sections.loans ? 'closed' : ''}`} onClick={() => toggleSection('loans')}>
                <span>Loans</span>
                <span>{sections.loans ? '−' : '+'}</span>
              </button>
              {sections.loans && (
                <div className="section-content">
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
                      <label htmlFor="loanTerm">Loan Term (yrs)</label>
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
                      Show Payment Schedule
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
                <span>Payments</span>
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
                    <label htmlFor="takeHomePay">Takehome after taxes (Monthly $)</label>
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
                    <label htmlFor="expenses">Monthly Expenses ($)</label>
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
              <h3>Costs & Interest</h3>
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
                title={showRightPanel ? "Collapse Chat" : "Expand Chat"}
              >
                {showRightPanel ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>}
              </button>
            </div>
          </div>
          <div className="result-card">
            <h4 style={{ margin: 0, color: '#334155' }}>Cost Summary</h4>
            <div className="result-item">
              <h4>4-Year Cost</h4>
              <div className="value">{formatCurrency(calculateFourYearCost())}</div>
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
            <h4 style={{ margin: 0, color: '#334155' }}>Loan Details</h4>
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
            <h4 style={{ margin: 0, color: '#334155' }}>Cash Flow</h4>
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
                  <td>Monthly Salary</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{formatCurrency(getMonthlyGross())}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(getMonthlyGross())}</td>
                </tr>
                <tr>
                  <td>Monthly Taxes</td>
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
            </table>
          </div>
          <div className="result-card">
            <h4 style={{ margin: 0, color: '#334155' }}>10-Year Savings Projection</h4>
            <div className="result-item">
              <h4>Total 401k Contribution</h4>
              <div className="value">{formatCurrency(calculateTenYear401k())}</div>
            </div>
            <div className="result-item">
              <h4>Accumulated Net Cash Flow</h4>
              <div className="value" style={{ color: calculateTenYearNetFlow() >= 0 ? '#10b981' : '#ef4444' }}>
                {formatCurrency(calculateTenYearNetFlow())}
              </div>
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
                <span>Payment Schedule</span>
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
            <h3>Chat</h3>
          </div>
        )}
      </div>

      {showTuitionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>4-Year Cost Breakdown</h3>
            <div className="input-form">
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

              <button className="calculate-button" onClick={() => setShowTaxModal(false)} style={{ marginTop: '1rem' }}>
                Done
              </button>
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