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
      setRegSuccess('🎉 Email verified and account registered successfully! You can now log in.');
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
    <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap', padding: '20px 0' }}>
      {/* Login Card */}
      <div className="card" style={{ flex: 1, minWidth: '320px', maxWidth: '420px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginBottom: '20px', color: '#1a365d' }}>🔐 Portal Login</h2>
        {loginError && <div style={{ color: '#e53e3e', background: '#fff5f5', border: '1px solid #fed7d7', padding: '10px', borderRadius: '6px', marginBottom: '16px' }}>⚠️ {loginError}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="e.g. student@college.edu" 
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
          <button type="submit" disabled={loginLoading} style={{ width: '100%', marginTop: '10px' }}>
            {loginLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Register Card */}
      <div className="card" style={{ flex: 1, minWidth: '320px', maxWidth: '450px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginBottom: '8px', color: '#1a365d' }}>📝 Student Registration</h2>
        <p style={{ color: '#718096', fontSize: '13px', marginBottom: '16px' }}>With 2-step OTP email verification</p>

        {regError && <div style={{ color: '#e53e3e', background: '#fff5f5', border: '1px solid #fed7d7', padding: '10px', borderRadius: '6px', marginBottom: '16px' }}>⚠️ {regError}</div>}
        {regSuccess && <div style={{ color: '#2f855a', background: '#f0fff4', border: '1px solid #c6f6d5', padding: '10px', borderRadius: '6px', marginBottom: '16px' }}>{regSuccess}</div>}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Full Name / Username</label>
            <input 
              type="text" 
              required 
              placeholder="e.g. Alex Smith" 
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
                  if (otpSent) setOtpSent(false); // Reset OTP if email changed
                }} 
                style={{ flex: 1 }}
              />
              <button 
                type="button" 
                onClick={handleSendOtp} 
                disabled={otpLoading || otpTimer > 0 || !regEmail}
                style={{ 
                  backgroundColor: otpTimer > 0 ? '#718096' : '#3182ce', 
                  color: 'white', 
                  padding: '8px 14px', 
                  fontSize: '13px',
                  whiteSpace: 'nowrap'
                }}
              >
                {otpLoading ? 'Sending...' : otpTimer > 0 ? `Resend (${otpTimer}s)` : 'Send OTP'}
              </button>
            </div>
            {otpMessage && (
              <div style={{ fontSize: '12px', color: '#2b6cb0', marginTop: '6px', fontWeight: '500' }}>
                {otpMessage}
              </div>
            )}
          </div>

          {/* OTP Verification Input */}
          {otpSent && (
            <div className="form-group" style={{ background: '#ebf8ff', padding: '12px', borderRadius: '6px', border: '1px dashed #bee3f8' }}>
              <label style={{ color: '#2c5282', fontWeight: 'bold' }}>Enter 6-Digit Verification Code</label>
              <input 
                type="text" 
                required 
                maxLength={6} 
                placeholder="123456" 
                value={regOtp} 
                onChange={e => setRegOtp(e.target.value.replace(/[^0-9]/g, ''))} 
                style={{ 
                  fontSize: '20px', 
                  letterSpacing: '6px', 
                  textAlign: 'center', 
                  fontWeight: 'bold',
                  borderColor: '#3182ce' 
                }} 
              />
              <span style={{ fontSize: '11px', color: '#4a5568' }}>Code expires in 5 minutes</span>
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
              placeholder="e.g. CS2024001" 
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
            style={{ width: '100%', backgroundColor: '#2f855a', padding: '12px', fontSize: '15px' }}
          >
            {regLoading ? 'Verifying...' : 'Verify OTP & Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginRegister;
