import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const LoginRegister = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState('student-login'); // student-login, student-register, admin-login
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Login identifier (username or email)
  const [identifier, setIdentifier] = useState('');

  const resetForm = () => {
    setError('');
    setSuccess('');
    setUsername('');
    setEmail('');
    setPassword('');
    setRollNumber('');
    setPhoneNumber('');
    setIdentifier('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    resetForm();
  };

  const handleStudentRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await authAPI.register({
        username,
        email,
        password,
        roll_number: rollNumber,
        phone_number: phoneNumber,
      });
      setSuccess('Account created successfully! Logging in...');
      
      // Auto login
      setTimeout(() => {
        onLoginSuccess(res.data.token, res.data.user);
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await authAPI.login({
        identifier,
        password,
      });
      setSuccess('Login successful!');
      
      setTimeout(() => {
        onLoginSuccess(res.data.token, res.data.user);
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username/email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await authAPI.adminLogin({
        identifier,
        password,
      });
      setSuccess('Admin login successful!');
      
      setTimeout(() => {
        onLoginSuccess(res.data.token, res.data.user);
        navigate('/admin');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-tabs">
        <button
          className={`auth-tab ${activeTab === 'student-login' ? 'active' : ''}`}
          onClick={() => handleTabChange('student-login')}
        >
          Student Login
        </button>
        <button
          className={`auth-tab ${activeTab === 'student-register' ? 'active' : ''}`}
          onClick={() => handleTabChange('student-register')}
        >
          Student Register
        </button>
        <button
          className={`auth-tab ${activeTab === 'admin-login' ? 'active' : ''}`}
          onClick={() => handleTabChange('admin-login')}
        >
          Admin Login
        </button>
      </div>

      <div className="auth-form">
        {error && <div className="alert alert-danger">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        {activeTab === 'student-login' && (
          <form onSubmit={handleStudentLogin}>
            <h2 className="auth-title">Student Login</h2>
            <p className="auth-subtitle">Access your lost & found dashboard</p>

            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter username or email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {activeTab === 'student-register' && (
          <form onSubmit={handleStudentRegister}>
            <h2 className="auth-title">Register Account</h2>
            <p className="auth-subtitle">Sign up to report and track items</p>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="Choose username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter college email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. CS2023001"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                placeholder="Enter contact number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        )}

        {activeTab === 'admin-login' && (
          <form onSubmit={handleAdminLogin}>
            <h2 className="auth-title">Admin Login</h2>
            <p className="auth-subtitle">Manage campus claims & category configurations</p>

            <div className="form-group">
              <label className="form-label">Admin Username or Email</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter admin identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Authorizing...' : 'Secure Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginRegister;
