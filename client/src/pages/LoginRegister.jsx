import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const LoginRegister = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  // Show only ONE card at a time based on user intent
  const [isRegistering, setIsRegistering] = useState(false);
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
      setLoginError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
      // Smoothly flip to the login card with success message
      setIsRegistering(false);
    } catch (err) {
      setRegError(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '20px auto', padding: '0 12px' }}>
      {!isRegistering ? (
        /* ==================== SIGN IN CARD ==================== */
        <div className="card" style={{ width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '2rem' }}>🔐</span>
            <h2 style={{ margin: 0 }}>Portal Sign In</h2>
          </div>
          <p style={{ color: '#52525B', fontWeight: 600, fontSize: '0.9rem', marginBottom: '22px' }}>
            Welcome back! Enter your campus credentials to access your dashboard.
          </p>

          {loginError && <div className="alert-banner alert-error">⚠️ {loginError}</div>}
          {regSuccess && <div className="alert-banner alert-success">{regSuccess}</div>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="e.g. 2024103581@student.annauniv.edu" 
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

            <button type="submit" disabled={loginLoading} className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px', fontSize: '1rem' }}>
              {loginLoading ? 'Signing In...' : 'Sign In 🚀'}
            </button>
          </form>

          {/* Clean "Don't have an account? Sign up here" prompt */}
          <div style={{ marginTop: '24px', textAlign: 'center', paddingTop: '16px', borderTop: '2px solid #000' }}>
            <p style={{ margin: 0, fontWeight: 700, color: '#374151', fontSize: '0.95rem' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(true);
                  setLoginError('');
                  setRegSuccess('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontWeight: 800,
                  textDecoration: 'underline',
                  padding: 0,
                  boxShadow: 'none',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  display: 'inline'
                }}
              >
                Sign up here ➔
              </button>
            </p>
          </div>
        </div>
      ) : (
        /* ==================== REGISTER CARD ==================== */
        <div className="card" style={{ width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '2rem' }}>📝</span>
            <h2 style={{ margin: 0 }}>Student Registration</h2>
          </div>
          <p style={{ color: '#52525B', fontWeight: 600, fontSize: '0.9rem', marginBottom: '18px' }}>
            Sign up with your campus student details to report and claim items.
          </p>

          {regError && <div className="alert-banner alert-error">⚠️ {regError}</div>}

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Student Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Raviraj" 
                value={regUsername} 
                onChange={e => setRegUsername(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Student Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="e.g. 2024103581@student.annauniv.edu" 
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
                placeholder="e.g. 2024103581" 
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

          {/* Clean "Already have an account? Sign In here" prompt */}
          <div style={{ marginTop: '24px', textAlign: 'center', paddingTop: '16px', borderTop: '2px solid #000' }}>
            <p style={{ margin: 0, fontWeight: 700, color: '#374151', fontSize: '0.95rem' }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setRegError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontWeight: 800,
                  textDecoration: 'underline',
                  padding: 0,
                  boxShadow: 'none',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  display: 'inline'
                }}
              >
                Sign In here ➔
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginRegister;
