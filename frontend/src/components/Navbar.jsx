import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 5%',
    borderBottom: '1px solid #e2e8f0',
    fontFamily: 'system-ui, sans-serif',
    backgroundColor: 'white',
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
    color: '#2d3748',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '2.5rem',
  },
  link: {
    textDecoration: 'none',
    color: '#4a5568',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  signUpButton: {
    backgroundColor: '#f0b900',
    color: '#1a202c',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    textDecoration: 'none',
    fontWeight: 'bold',
    border: 'none',
  },
};

const Navbar = () => {
  return (
    <nav style={styles.nav}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <div style={styles.logoContainer}>
          <svg style={styles.logo} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="20" fill="#f0b900"/>
            <path d="M20 80 L50 20 L80 80 Z" fill="white" />
          </svg>
          <span style={styles.logoText}>Construct</span>
        </div>
      </Link>
      <div style={styles.navLinks}>
        {/* Only Services remains */}
        <Link to="/services" style={styles.link}>Services</Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/login" style={styles.link}>LOGIN</Link>
          <Link to="/register" style={styles.signUpButton}>
            SIGN UP
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;