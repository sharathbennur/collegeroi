import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import './Calculator.css';

const Calculator = () => {
  const [formData, setFormData] = useState({
    collegeName: '',
    tuition: '',
    familyContribution: '',
    loanInterest: '',
    loanTerm: '',
    salary: ''
  });
  const [error, setError] = useState('');
  const [invalidFields, setInvalidFields] = useState<string[]>([]);
  const [showTuitionModal, setShowTuitionModal] = useState(false);
  const [tuitionBreakdown, setTuitionBreakdown] = useState({
    year1: '',
    year2: '',
    year3: '',
    year4: ''
  });

  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (invalidFields.includes(name)) {
      setInvalidFields(prev => prev.filter(field => field !== name));
    }
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="calculator-container">
      <nav className="navbar">
        <Link to="/" className="brand-name">CollegeROI 🚀</Link>
      </nav>
      
      <div className="content-grid">
        <div className="column left-col">
          <h3>Inputs</h3>
          <form className="input-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="collegeName">College Name</label>
              <input
                type="text"
                id="collegeName"
                name="collegeName"
                placeholder="e.g. Harvard University"
                value={formData.collegeName}
                onChange={handleChange}
                className={invalidFields.includes('collegeName') ? 'error-input' : ''}
              />
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
                placeholder="40,000"
                value={formData.familyContribution}
                onChange={handleChange}
                className={invalidFields.includes('familyContribution') ? 'error-input' : ''}
              />
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

            <div className="input-group">
              <label htmlFor="salary">Expected Starting Salary ($)</label>
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
            {error && <div className="error-message">{error}</div>}
            <button type="submit" className="calculate-button">
              Calculate Payment Table
            </button>
          </form>
        </div>
        <div className="column center-col">
          <h3>Results & Tables</h3>
          <div className="results-grid">
            <div className="result-card">
              <h4>4-Year Cost</h4>
              <div className="value">{formatCurrency(calculateFourYearCost())}</div>
            </div>
            <div className="result-card">
              <h4>4-Year Family Contribution</h4>
              <div className="value">{formatCurrency(calculateFourYearFamilyContribution())}</div>
            </div>
            <div className="result-card">
              <h4>Loan Amount</h4>
              <div className="value">{formatCurrency(calculateLoanAmount())}</div>
            </div>
          </div>
        </div>
        <div className="column right-col">
          <h3>Chat</h3>
        </div>
      </div>

      {showTuitionModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Tuition Breakdown</h3>
            <div className="input-form">
              {['1', '2', '3', '4'].map((year) => (
                <div className="input-group" key={year}>
                  <label htmlFor={`year${year}`}>Year-{year}</label>
                  <input
                    type="number"
                    id={`year${year}`}
                    name={`year${year}`}
                    min="0"
                    placeholder="e.g. 40000"
                    value={tuitionBreakdown[`year${year}` as keyof typeof tuitionBreakdown]}
                    onChange={handleTuitionChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              ))}
              <button type="button" className="calculate-button" onClick={handleTuitionDone}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;