import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import Components (to be created next)
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import Workflows from './components/Workflows';
import YamlTools from './components/YamlTools';
import InfraGuides from './components/InfraGuides';
import Monitoring from './components/Monitoring';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="app-container"><div className="main-content">Loading...</div></div>;
  if (!token) return <Navigate to="/login" />;
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/workflows/*" element={<ProtectedRoute><Workflows /></ProtectedRoute>} />
        <Route path="/yaml-tools" element={<ProtectedRoute><YamlTools /></ProtectedRoute>} />
        <Route path="/infra-guides" element={<ProtectedRoute><InfraGuides /></ProtectedRoute>} />
        <Route path="/monitoring" element={<ProtectedRoute><Monitoring /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
