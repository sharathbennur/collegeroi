import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './Home.css';
import screenshot from './assets/collegeroi-screenshot.png';
import CookiePolicy from './CookiePolicy';
import { useTheme } from './context/ThemeContext';

const Home = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    document.title = 'CollegeROI - Home';
  }, []);

  const handleEnter = () => {
    // Navigate to your main dashboard or login route
    navigate('/calculator');
  };

  return (
    <div className="home-container">
      {/* Background decoration circles */}
      <div className="circle circle-1"></div>
      <div className="circle circle-2"></div>

      <div style={{ position: 'absolute', top: '1.5rem', right: '2rem', zIndex: 10 }}>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          )}
        </button>
      </div>

      <div className="content-wrapper">
        <div className="split-layout">
          <div className="left-panel">
            <header className="hero-section">
              <h1 className="title">
                Welcome to <span className="brand-name">CollegeROI 🚀</span>
              </h1>
              <p className="tagline">
                Empowering Students, Parents & Guardians - make data-driven &nbsp;
                <span
                  title="Return on Investment: A measure of the profitability of an investment relative to its cost."
                  className="roi-term"
                  tabIndex={0}
                >
                  ROI
                </span>-based college decisions.
              </p>
            </header>

            <div className="features-section">
              <div className="feature-block">
                <div className="feature-icon">🎓</div>
                <div className="feature-content">
                  <h2>For Students</h2>
                  <p>
                    Is college worth it? Answer that simple but critical question with our
                    interactive tools that take into consideration your selected college and
                    your situation, and provides a custom ROI just for you.
                  </p>
                </div>
              </div>

              <div className="feature-block">
                <div className="feature-icon">🛡️</div>
                <div className="feature-content">
                  <h2>For Guardians</h2>
                  <p>
                    Is your college investment worth it? Guide your student through this major
                    financial decision with clear ROI projections based on your family's situation.
                    Plan with data, not just happy thoughts.
                  </p>
                </div>
              </div>
            </div>

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

          <div className="right-panel">
            <img src={screenshot} alt="CollegeROI Calculator Dashboard" className="hero-image" />
          </div>
        </div>
      </div>

      <footer className="home-footer">
        <p>
          <strong>Disclaimer:</strong> The financial projections, college costs, and tax estimates provided by this tool are calculations based on user inputs and assumptions. They are for informational purposes only and do not constitute professional financial, tax, or legal advice. Please consult with a qualified professional before making any financial decisions.
        </p>
      </footer>
      <CookiePolicy />
    </div>
  );
};

export default Home;