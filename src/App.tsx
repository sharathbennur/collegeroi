import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import './App.css'
import './Home.css'

const Home = lazy(() => import('./Home'));
const Calculator = lazy(() => import('./Calculator'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calculator" element={<Calculator />} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
