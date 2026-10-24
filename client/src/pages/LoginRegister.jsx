import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const LoginRegister = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [loginError, setLoginError] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register states
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRoll, setRegRoll] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await authAPI.login({ email: loginEmail, password: loginPassword });
      onLoginSuccess(res.data.token, res.data.user);
      if (res.data.user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setLoginError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regUsername || !regEmail || !regPassword || !regRoll) {
      setRegError('Please fill out all required fields.');
      return;
    }

    setRegLoading(true);
    try {
      await authAPI.register({
        username: regUsername.trim(),
        email: regEmail.trim(),
        password: regPassword,
        roll_number: regRoll.trim(),
        phone_number: regPhone.trim(),
      });
      setRegSuccess('🎉 Account registered successfully! You can now sign in.');
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setRegRoll('');
      setRegPhone('');
      setActiveTab('login'); // Switch to login card
    } catch (err) {
      setRegError(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '10px 0' }}>
      {/* Mobile-Friendly Switcher */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('login')}
          style={{
            flex: '1 1 180px',
            maxWidth: '220px',
            padding: '12px 18px',
            background: activeTab === 'login' ? 'var(--pop-yellow)' : '#FFFFFF',
            boxShadow: activeTab === 'login' ? '4px 4px 0px #000' : '2px 2px 0px #000',
            fontWeight: 800
          }}
        >
          🔐 Sign In
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          style={{
            flex: '1 1 180px',
            maxWidth: '220px',
            padding: '12px 18px',
            background: activeTab === 'register' ? 'var(--pop-lime)' : '#FFFFFF',
            boxShadow: activeTab === 'register' ? '4px 4px 0px #000' : '2px 2px 0px #000',
            fontWeight: 800
          }}
        >
          📝 Register
        </button>
      </div>

      <div style={{ display: 'flex', gap: '28px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* Login Card */}
        {(activeTab === 'login' || window.innerWidth > 768) && (
          <div className="card" style={{ flex: '1 1 340px', maxWidth: '440px', display: activeTab === 'login' ? 'block' : (window.innerWidth <= 768 ? 'none' : 'block') }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '2rem' }}>🔐</span>
              <h2 style={{ margin: 0 }}>Portal Sign In</h2>
            </div>
            <p style={{ color: '#52525B', fontWeight: 600, fontSize: '0.9rem', marginBottom: '20px' }}>
              Welcome back! Access your student or admin dashboard.
            </p>

            {loginError && <div className="alert-banner alert-error">⚠️ {loginError}</div>}
            {regSuccess && <div className="alert-banner alert-success">{regSuccess}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  required 
                  placeholder="e.g. admin@lostandfound.com" 
                  value={loginEmail} 
                  onChange={e => setLoginEmail(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••" 
                  value={loginPassword} 
                  onChange={e => setLoginPassword(e.target.value)} 
                />
              </div>

              <button type="submit" disabled={loginLoading} className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>
                {loginLoading ? 'Signing In...' : 'Sign In 🚀'}
              </button>
            </form>

            <div style={{ marginTop: '20px', padding: '12px', background: '#FFFDF5', border: '2px dashed #000000', borderRadius: '0px', fontSize: '0.85rem' }}>
              <strong>💡 Admin Demo Credentials:</strong><br />
              Email: <code>admin@lostandfound.com</code><br />
              Password: <code>admin123</code>
            </div>
          </div>
        )}

        {/* Register Card */}
        {(activeTab === 'register' || window.innerWidth > 768) && (
          <div className="card" style={{ flex: '1 1 380px', maxWidth: '480px', display: activeTab === 'register' ? 'block' : (window.innerWidth <= 768 ? 'none' : 'block') }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '2rem' }}>📝</span>
              <h2 style={{ margin: 0 }}>Student Registration</h2>
            </div>
            <p style={{ color: '#52525B', fontWeight: 600, fontSize: '0.9rem', marginBottom: '16px' }}>
              Sign up with your student details to report and claim items.
            </p>

            {regError && <div className="alert-banner alert-error">⚠️ {regError}</div>}

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Student Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Alex Johnson" 
                  value={regUsername} 
                  onChange={e => setRegUsername(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Student Email Address</label>
                <input 
                  type="email" 
                  required 
                  placeholder="student@college.edu" 
                  value={regEmail} 
                  onChange={e => setRegEmail(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  required 
                  placeholder="Minimum 6 characters" 
                  value={regPassword} 
                  onChange={e => setRegPassword(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Roll Number / Student ID</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. CS2026101" 
                  value={regRoll} 
                  onChange={e => setRegRoll(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label>Phone Number (Optional)</label>
                <input 
                  type="text" 
                  placeholder="+91 9876543210" 
                  value={regPhone} 
                  onChange={e => setRegPhone(e.target.value)} 
                />
              </div>

              <button 
                type="submit" 
                disabled={regLoading}
                className="btn-success"
                style={{ width: '100%', padding: '14px', fontSize: '1.05rem', marginTop: '10px' }}
              >
                {regLoading ? 'Registering...' : 'Create Account 🎉'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginRegister;
