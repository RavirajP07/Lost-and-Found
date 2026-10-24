import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const LoginRegister = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
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
  const [regOtp, setRegOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

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

  const handleSendOtp = async () => {
    if (!regEmail || !regEmail.includes('@')) {
      setRegError('Please enter a valid email address first.');
      return;
    }
    setOtpLoading(true);
    setRegError('');
    setOtpMessage('');
    try {
      const res = await authAPI.sendOtp({ email: regEmail.trim() });
      setOtpSent(true);
      setOtpTimer(60);
      if (res.data.devOtp) {
        setOtpMessage(`🔑 Code: ${res.data.devOtp} (Valid for 5 mins)`);
      } else {
        setOtpMessage(`📧 Verification code sent to ${regEmail}`);
      }
    } catch (err) {
      setRegError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!otpSent) {
      setRegError('Please click "Send OTP" to verify your email first.');
      return;
    }

    if (!regOtp || regOtp.trim().length !== 6) {
      setRegError('Please enter the 6-digit verification code.');
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
        otp: regOtp.trim()
      });
      setRegSuccess('🎉 Email verified and account registered! You can now sign in.');
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setRegRoll('');
      setRegPhone('');
      setRegOtp('');
      setOtpSent(false);
      setOtpMessage('');
    } catch (err) {
      setRegError(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap', padding: '10px 0' }}>
      {/* Login Card */}
      <div className="card" style={{ flex: '1 1 340px', maxWidth: '440px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '2rem' }}>🔐</span>
          <h2 style={{ margin: 0 }}>Portal Sign In</h2>
        </div>
        <p style={{ color: '#52525B', fontWeight: 600, fontSize: '0.9rem', marginBottom: '20px' }}>
          Welcome back! Access your student or admin dashboard.
        </p>

        {loginError && <div className="alert-banner alert-error">⚠️ {loginError}</div>}

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

        <div style={{ marginTop: '20px', padding: '12px', background: '#FFFDF5', border: '2px dashed #18181B', borderRadius: '10px', fontSize: '0.85rem' }}>
          <strong>💡 Admin Demo Credentials:</strong><br />
          Email: <code>admin@lostandfound.com</code><br />
          Password: <code>admin123</code>
        </div>
      </div>

      {/* Register Card */}
      <div className="card" style={{ flex: '1 1 380px', maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '2rem' }}>📝</span>
          <h2 style={{ margin: 0 }}>New Student Registration</h2>
        </div>
        <p style={{ color: '#52525B', fontWeight: 600, fontSize: '0.9rem', marginBottom: '16px' }}>
          Sign up with your campus email & 2-step OTP verification.
        </p>

        {regError && <div className="alert-banner alert-error">⚠️ {regError}</div>}
        {regSuccess && <div className="alert-banner alert-success">{regSuccess}</div>}

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
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="email" 
                required 
                placeholder="student@college.edu" 
                value={regEmail} 
                onChange={e => {
                  setRegEmail(e.target.value);
                  if (otpSent) setOtpSent(false);
                }} 
                style={{ flex: 1 }}
              />
              <button 
                type="button" 
                onClick={handleSendOtp} 
                disabled={otpLoading || otpTimer > 0 || !regEmail}
                style={{ 
                  background: otpTimer > 0 ? '#E4E4E7' : '#FFDE59', 
                  color: '#18181B', 
                  padding: '8px 14px', 
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {otpLoading ? 'Sending...' : otpTimer > 0 ? `Resend (${otpTimer}s)` : 'Send OTP 🔑'}
              </button>
            </div>
            {otpMessage && (
              <div style={{ fontSize: '0.85rem', color: '#166534', marginTop: '6px', fontWeight: 800 }}>
                {otpMessage}
              </div>
            )}
          </div>

          {/* OTP Verification Input Box */}
          {otpSent && (
            <div className="form-group" style={{ background: '#FFF3B0', padding: '14px', borderRadius: '12px', border: 'var(--ink-border)' }}>
              <label style={{ color: '#18181B', fontWeight: 800 }}>Enter 6-Digit Code</label>
              <input 
                type="text" 
                required 
                maxLength={6} 
                placeholder="123456" 
                value={regOtp} 
                onChange={e => setRegOtp(e.target.value.replace(/[^0-9]/g, ''))} 
                style={{ 
                  fontSize: '22px', 
                  letterSpacing: '8px', 
                  textAlign: 'center', 
                  fontWeight: 800,
                  background: '#FFFFFF'
                }} 
              />
              <span style={{ fontSize: '0.8rem', color: '#52525B', fontWeight: 700 }}>Valid for 5 minutes</span>
            </div>
          )}

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
            {regLoading ? 'Verifying...' : 'Verify OTP & Register 🎉'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginRegister;
