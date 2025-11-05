import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import '../../styles/navbar.css';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
          <span className="logo-text">RKS</span>
          <span className="logo-nexus">Nexus</span>
        </Link>
        
        {/* Mobile Menu Toggle */}
        <div 
          className="mobile-menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
        </div>

        <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          {!isAuthenticated ? (
            <>
              <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
              <Link to="/programs" className="nav-link" onClick={closeMobileMenu}>Programs</Link>
              <Link to="/contact" className="nav-link" onClick={closeMobileMenu}>Contact</Link>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link" onClick={closeMobileMenu}>Home</Link>
              <Link to="/programs" className="nav-link" onClick={closeMobileMenu}>Programs</Link>
              <Link to="/contact" className="nav-link" onClick={closeMobileMenu}>Contact</Link>
              
              {isAdmin ? (
                <Link 
                  to="/admin" 
                  className="nav-link-btn admin-btn"
                  onClick={closeMobileMenu}
                >
                  🛡️ Admin Panel
                </Link>
              ) : (
                <Link 
                  to="/dashboard" 
                  className="nav-link-btn dashboard-btn"
                  onClick={closeMobileMenu}
                >
                  📊 My Dashboard
                </Link>
              )}
              
              <div 
                className="user-menu" 
                onClick={() => {
                  navigate('/profile');
                  closeMobileMenu();
                }}
                title="View Profile"
              >
                <div className="user-avatar-nav">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="user-name-nav">{user?.name}</span>
              </div>
              
              <button className="logout-btn-nav" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div 
            className="mobile-overlay" 
            onClick={closeMobileMenu}
          ></div>
        )}
      </div>
    </nav>
  );
}
