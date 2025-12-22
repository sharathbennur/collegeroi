import './Calculator.css';

const Calculator = () => {
  return (
    <div className="calculator-container">
      <nav className="navbar">
        <div className="brand-name">CollegeROI 🚀</div>
      </nav>
      
      <div className="content-grid">
        <div className="column left-col">
          <h3>Inputs</h3>
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