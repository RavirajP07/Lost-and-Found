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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('cc_user');
    const savedToken = localStorage.getItem('cc_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
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

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '5rem' }}><h2>Bootstrapping App...</h2></div>;
  }

  return (
    <Router>
      <div className="app-container">
        <Header user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            {/* Guest/Auth routes */}
            <Route
              path="/login"
              element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <LoginRegister onLoginSuccess={handleLoginSuccess} />}
            />

            {/* Student Protected Routes */}
            <Route
              path="/dashboard"
              element={user && user.role === 'student' ? <StudentDashboard user={user} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/report"
              element={user && user.role === 'student' ? <ReportItem /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/search"
              element={user && user.role === 'student' ? <SearchFilter /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/items/:id"
              element={user ? <ItemDetails user={user} /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/profile"
              element={user && user.role === 'student' ? <Profile user={user} /> : <Navigate to="/login" replace />}
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />}
            />

            {/* Default Redirection */}
            <Route
              path="*"
              element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} replace />}
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
