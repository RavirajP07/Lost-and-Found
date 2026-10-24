import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  return (
    <header className="header">
      <div>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1>🕵️‍♂️ Lost & Found</h1>
        </Link>
      </div>

      <nav className="nav-links">
        {user ? (
          <>
            {user.role === 'student' && (
              <>
                <NavLink to="/dashboard">📊 Dashboard</NavLink>
                <NavLink to="/search">🔍 Search</NavLink>
                <NavLink to="/report">📝 Report Item</NavLink>
                <NavLink to="/profile">👤 Profile</NavLink>
              </>
            )}

            {user.role === 'admin' && (
              <>
                <NavLink to="/admin">⚡ Admin Panel</NavLink>
                <NavLink to="/search">🔍 All Items</NavLink>
                <NavLink to="/report">📝 Report Item</NavLink>
              </>
            )}

            <span className="user-badge">
              {user.role === 'admin' ? '👑' : '🎒'} {user.username}
            </span>
            
            <button onClick={onLogout} className="btn-logout">
              🚪 Logout
            </button>
          </>
        ) : (
          <NavLink to="/login">🔑 Sign In / Register</NavLink>
        )}
      </nav>
    </header>
  );
};

export default Header;
