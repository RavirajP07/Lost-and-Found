import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const LoginRegister = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register states
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRoll, setRegRoll] = useState('');
  const [regPhone, setRegPhone] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authAPI.login({ email: loginEmail, password: loginPassword });
      onLoginSuccess(res.data.token, res.data.user);
      if (res.data.user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await authAPI.register({
        username: regUsername,
        email: regEmail,
        password: regPassword,
        roll_number: regRoll,
        phone_number: regPhone
      });
      alert('Registration successful! You can now login.');
      setRegUsername(''); setRegEmail(''); setRegPassword(''); setRegRoll(''); setRegPhone('');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
      {/* Login Card */}
      <div className="card" style={{ flex: 1, minWidth: '300px', maxWidth: '400px' }}>
        <h2>Login</h2>
        {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
          </div>
          <button type="submit" style={{ width: '100%' }}>Login</button>
        </form>
      </div>

      {/* Register Card */}
      <div className="card" style={{ flex: 1, minWidth: '300px', maxWidth: '400px' }}>
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" required value={regUsername} onChange={e => setRegUsername(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={regEmail} onChange={e => setRegEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required value={regPassword} onChange={e => setRegPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Roll Number</label>
            <input type="text" required value={regRoll} onChange={e => setRegRoll(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Phone Number (Optional)</label>
            <input type="text" value={regPhone} onChange={e => setRegPhone(e.target.value)} />
          </div>
          <button type="submit" style={{ width: '100%', backgroundColor: '#28a745' }}>Register</button>
        </form>
      </div>
    </div>
  );
};

export default LoginRegister;
