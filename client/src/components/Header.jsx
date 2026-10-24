import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  React.useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="header">
      <div className="header-top">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1>🕵️‍♂️ Lost & Found</h1>
        </Link>

        {/* Mobile Hamburger Button */}
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          {menuOpen ? '✖ CLOSE' : '☰ MENU'}
        </button>
      </div>

      <nav className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
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
