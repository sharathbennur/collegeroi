import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home/>} />
        {/* Placeholder for the dashboard route */}
        <Route path="/dashboard" element={<div>Dashboard Coming Soon!</div>} />
      </Routes>
    </Router>
  )
}

export default App
