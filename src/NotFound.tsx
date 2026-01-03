import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#334155' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>404 - Page Not Found</h1>
      <p style={{ marginBottom: '2rem' }}>The page you are looking for does not exist.</p>
      <Link to="/" className="calculate-button" style={{ textDecoration: 'none' }}>Return Home</Link>
    </div>
  );
};

export default NotFound;