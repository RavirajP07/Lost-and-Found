import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          <h1>🎓 Lost and Found</h1>
        </Link>
      </div>

      <div className="nav-links">
        {user ? (
          <>
            {user.role === 'student' && (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/search">Search</NavLink>
                <NavLink to="/report">Report Item</NavLink>
                <NavLink to="/profile">Profile</NavLink>
              </>
            )}

            {user.role === 'admin' && (
              <NavLink to="/admin">Admin Panel</NavLink>
            )}

            <span style={{ marginLeft: '20px', fontWeight: 'bold' }}>
              {user.username} ({user.role})
            </span>
            
            <button onClick={onLogout} style={{ marginLeft: '20px' }}>
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login">Login / Register</NavLink>
        )}
      </div>
    </header>
  );
};

export default Header;
