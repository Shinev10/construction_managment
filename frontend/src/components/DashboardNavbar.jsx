import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  nav: {
    width: '100vw',            // ✅ Full viewport width
    boxSizing: 'border-box',   // ✅ Include padding in width
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    fontFamily: 'system-ui, sans-serif',
    position: 'sticky',        // ✅ Keeps navbar on top when scrolling
    top: 0,
    zIndex: 1000,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logo: {
    height: '30px',
    width: '30px',
  },
  logoText: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textDecoration: 'none',
    color: '#1a202c',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  link: {
    textDecoration: 'none',
    color: '#4a5568',
    fontSize: '1rem',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#1a202c',
    color: 'white',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    border: 'none',
    fontWeight: 'bold',
  },
};

const DashboardNavbar = ({ handleLogout }) => {
  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <div style={styles.logoContainer}>
          <svg
            style={styles.logo}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="100" height="100" rx="20" fill="#f0b900" />
            <path d="M20 80 L50 20 L80 80 Z" fill="white" />
          </svg>
          <span style={styles.logoText}>Construct</span>
        </div>
      </Link>
      <div style={styles.navLinks}>
        <Link to="/dashboard" style={styles.link}>
          My Projects
        </Link>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default DashboardNavbar;
