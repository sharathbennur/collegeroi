import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import './Calculator.css';

const Calculator = () => {
  const [formData, setFormData] = useState({
    collegeName: '',
    tuition: '',
    familyContribution: '',
    loanInterest: '',
    salary: ''
  });

  const handleChange = (e: FormEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
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
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="tuition">Tuition ($)</label>
              <input
                type="number"
                id="tuition"
                name="tuition"
                placeholder="e.g. 80,000"
                value={formData.tuition}
                onChange={handleChange}
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
              />
            </div>

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
              />
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
              />
            </div>
            <button type="submit" className="calculate-button">
              Calculate Payment Table
            </button>
          </form>
        </div>
        <div className="column center-col">
          <h3>Results & Tables</h3>
        </div>
        <div className="column right-col">
          <h3>Chat</h3>
        </div>
      </div>
    </div>
  );
};

export default Calculator;