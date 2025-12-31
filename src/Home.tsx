import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleEnter = () => {
    // Navigate to your main dashboard or login route
    navigate('/calculator');
  };

  return (
    <div className="home-container">
      {/* Background decoration circles */}
      <div className="circle circle-1"></div>
      <div className="circle circle-2"></div>

      <div className="content-wrapper">
        <header className="hero-section">
          <h1 className="title">
            Welcome to <span className="brand-name">CollegeROI 🚀</span>
          </h1>
          <p className="tagline">
            Empowering Students, Reassuring Parents & Guardians.
          </p>
        </header>

        <main className="info-section">
          <div className="info-card student">
            <div className="icon">🎓</div>
            <h2>For Students</h2>
            <p>
              Is college worth it? Answer that simple but critical question with our 
              interactive tools that take into consideration your selected college and 
              your situation, and provides a custom ROI just for you.
            </p>
          </div>

          <div className="info-card guardian">
            <div className="icon">🛡️</div>
            <h2>For Guardians</h2>
            <p>
              Is your college investment worth it? Guide your student through this major 
              financial decision with clear ROI projections based on your family's situation, 
              Plan with data, not just happy thoughts.
            </p>
          </div>
        </main>

        <footer className="cta-section">
          <p className="mission-statement">
            Ready to start the journey?
          </p>
          <button 
            className="enter-button" 
            onClick={handleEnter}
            aria-label="Enter the application"
          >
            Enter Calculator <span className="arrow">➔</span>
          </button>
        </footer>
      </div>

      <footer className="home-footer">
        <p>
          <strong>Disclaimer:</strong> The financial projections, college costs, and tax estimates provided by this tool are calculations based on user inputs and assumptions. They are for informational purposes only and do not constitute professional financial, tax, or legal advice. Please consult with a qualified professional before making any financial decisions.
        </p>
      </footer>
    </div>
  );
};

export default Home;