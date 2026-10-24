import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import LoginRegister from './pages/LoginRegister';
import StudentDashboard from './pages/StudentDashboard';
import ReportItem from './pages/ReportItem';
import ItemDetails from './pages/ItemDetails';
import SearchFilter from './pages/SearchFilter';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import './css/index.css';
import './css/App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('cc_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (token, loggedInUser) => {
    localStorage.setItem('cc_token', token);
    localStorage.setItem('cc_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    setUser(null);
  };

  return (
    <Router>
      <div className="app-container">
        <Header user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<LoginRegister onLoginSuccess={handleLoginSuccess} />} />
            
            <Route path="/dashboard" element={<StudentDashboard user={user} />} />
            <Route path="/report" element={<ReportItem />} />
            <Route path="/search" element={<SearchFilter />} />
            <Route path="/items/:id" element={<ItemDetails user={user} />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route path="/admin" element={<AdminDashboard />} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
