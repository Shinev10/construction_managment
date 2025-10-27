import React from 'react';

// Inline styles for a professional and modern look, adapted for full-screen
const styles = {
  container: {
    minHeight: 'calc(100vh - 80px)', 
    padding: '3rem 5%', 
    fontFamily: 'system-ui, sans-serif',
    color: '#2d3748',
    backgroundColor: '#f7fafc',
  },
  header: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  title: {
    fontSize: '2.8rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#718096',
    maxWidth: '700px',
    margin: '0 auto',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
    gap: '2.5rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  featureCard: {
    backgroundColor: 'white',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
  },
  featureIcon: {
    height: '50px',
    width: '50px',
    marginBottom: '1.5rem',
    color: '#f0b900',
  },
  featureTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '0.8rem',
  },
  featureDescription: {
    fontSize: '1rem',
    color: '#4a5568',
    lineHeight: '1.7',
  },
};

// SVG icons for visual appeal (reusing existing ones)
const CentralizedPlatformIcon = () => (
  <svg style={styles.featureIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6" /></svg>
);
const RealTimeCommunicationIcon = () => (
  <svg style={styles.featureIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
);
const SecureAuthenticationIcon = () => (
  <svg style={styles.featureIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);

const Solutions = () => {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>A Modern Solution for Construction Management</h1>
        <p style={styles.subtitle}>
          Our platform is designed to tackle the biggest challenges in the industry, from fragmented communication to a lack of project visibility.
        </p>
      </header>

      <div style={styles.featuresGrid}>
        <div style={styles.featureCard}>
          <CentralizedPlatformIcon />
          <h3 style={styles.featureTitle}>Centralized Project Hub</h3>
          <p style={styles.featureDescription}>
            Bring all your project information, from plans and tasks to team communication, into a single, easy-to-access platform. Eliminate scattered documents and emails forever.
          </p>
        </div>
        <div style={styles.featureCard}>
          <RealTimeCommunicationIcon />
          <h3 style={styles.featureTitle}>Real-Time Communication</h3>
          <p style={styles.featureDescription}>
            Our integrated chat allows admins and clients to communicate directly within the context of a project, ensuring everyone is on the same page and decisions are made quickly.
          </p>
        </div>
        <div style={styles.featureCard}>
          <SecureAuthenticationIcon />
          <h3 style={styles.featureTitle}>Secure & Role-Based Access</h3>
          <p style={styles.featureDescription}>
            With robust JWT authentication and role-based dashboards, you can be sure that admins see everything they need to manage, while clients only see the details relevant to them.
          </p>
        </div>
      </div>
    </div>
  );
};

// --- CRITICAL FIX: Add the missing default export ---
export default Solutions;
