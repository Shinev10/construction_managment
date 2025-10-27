import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  pageContainer: {
    width: '100vw',           // ✅ Full viewport width
    minHeight: '100vh',       // ✅ Full viewport height
    overflowX: 'hidden',      // ✅ Prevent horizontal scroll
    backgroundColor: '#f7fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, sans-serif',
  },
  mainContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4rem 8%',
    width: '100%',             // ✅ Stretches to full width
    maxWidth: '1400px',        // ✅ Optional max width for large screens
    boxSizing: 'border-box',
    flexWrap: 'wrap',          // ✅ Makes it responsive for smaller screens
  },
  leftSection: {
    flex: 1.5,
    minWidth: '300px',
    maxWidth: '650px',
    paddingRight: '4rem',
  },
  headline: {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    lineHeight: '1.2',
    color: '#1a202c',
  },
  description: {
    fontSize: '1.2rem',
    color: '#4a5568',
    marginBottom: '2.5rem',
    lineHeight: '1.6',
  },
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#f0b900',
    color: '#1a202c',
    padding: '1rem 2.5rem',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#1a202c',
    padding: '1rem 2rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'background-color 0.2s, color 0.2s',
  },
  rightSection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '500px',
    minWidth: '280px',
    marginTop: '2rem',
  },
  illustration: {
    width: '100%',
    height: 'auto',
  },
};

const LandingPage = () => {
  return (
    <div style={styles.pageContainer}>
      <main style={styles.mainContent}>
        <div style={styles.leftSection}>
          <h1 style={styles.headline}>
            Construction Project Management Software
          </h1>
          <p style={styles.description}>
            A building under construction demands extraordinary coordination of people, plans, and resources. Use our comprehensive project management software to streamline operations and build projects that stand the test of time.
          </p>
          <div style={styles.buttonContainer}>
            <Link
              to="/register"
              style={styles.primaryButton}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#d6a300'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f0b900'}
            >
              SIGN UP NOW
            </Link>
          </div>
        </div>
        <div style={styles.rightSection}>
          <svg
            style={styles.illustration}
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#F0B900"
              d="M62.7,-64.1C79.4,-50,89.8,-25,87.8,-1.7C85.8,21.6,71.4,43.2,53,56.7C34.6,70.2,12.2,75.6,-10.8,74.1C-33.8,72.7,-57.4,64.4,-70.1,48.8C-82.8,33.2,-84.6,10.3,-79.1,-10.6C-73.6,-31.5,-60.8,-50.4,-45.5,-63.8C-30.2,-77.2,-12.4,-85.1,6.5,-86.2C25.4,-87.3,51.1,-81.5,62.7,-64.1Z"
              transform="translate(100 100)"
              opacity="0.2"
            />
          </svg>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
