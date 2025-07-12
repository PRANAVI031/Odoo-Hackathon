import React from 'react';
import './Navbar.css';

type NavbarProps = {
  onOpenAuth: (mode: 'login' | 'signup') => void;
};

const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        {/* Logo */}
        <div className="navbar-logo">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="2" />
              <path d="M12 12h8M12 16h8M12 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="logo-text">SkillSwap</span>
        </div>

        <div className="spacer" />

        {/* Auth Buttons */}
        <div className="navbar-auth">
          <button className="btn btn-login" onClick={() => onOpenAuth('login')}>
            Login
          </button>
          <button className="btn btn-signup" onClick={() => onOpenAuth('signup')}>
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
