import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavLink = ({ to, children, onClick }) => {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`nav__link ${active ? 'is-active' : ''}`}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="nav">
      <div className="nav__inner">
        {/* Left: Brand */}
        <Link to="/" className="nav__brand" onClick={closeMenu} aria-label="Home">
          <span className="nav__brandText">Recipe Manager</span>
        </Link>

        {/* Mobile toggle */}
        <button
          className="nav__menuBtn"
          aria-expanded={open}
          aria-controls="nav-menu"
          onClick={() => setOpen(v => !v)}
        >
          {open ? '✕' : '☰'}
        </button>

        {/* Center + Right */}
        <nav id="nav-menu" className={`nav__panel ${open ? 'open' : ''}`} aria-label="Main">
          <div className="nav__main">
            <NavLink to="/recipes" onClick={closeMenu}>Recipes</NavLink>
            <NavLink to="/grocery" onClick={closeMenu}>Grocery</NavLink>
            <NavLink to="/planner" onClick={closeMenu}>Planner</NavLink>
            <NavLink to="/chatbot" onClick={closeMenu}>Chat</NavLink>
          </div>

          <div className="nav__actions">
            {user ? (
              <>
                <NavLink to="/profile" onClick={closeMenu}>Profile</NavLink>
                <button className="nav__btn" onClick={() => { logout(); closeMenu(); }}>Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" onClick={closeMenu}>Login</NavLink>
                <Link to="/register" onClick={closeMenu} className="nav__btn nav__btn--primary">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
