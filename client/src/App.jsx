import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import Sidebar from './components/shared/Sidebar';
import Dashboard from './pages/dashboard';
import Simulation from './pages/simulation';
import Analytics from './pages/analytics';
import Logs from './pages/logs';
import Settings from './pages/settings';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-background text-text">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/simulation" element={<Simulation />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;

