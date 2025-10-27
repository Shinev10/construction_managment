import React from 'react';

const styles = {
  // --- EDITED: Container now fills width and has direct padding ---
  container: {
    minHeight: 'calc(100vh - 80px)', // Fill vertical space below navbar
    margin: '0 auto',
    padding: '3rem 5%', // Direct padding on the main container
    fontFamily: 'system-ui, sans-serif',
    color: '#2d3748',
    backgroundColor: '#f7fafc', // Light background
  },
  // Removed contentWrapper style
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#718096',
    maxWidth: '850px', // Allow subtitle to be wider
    margin: '0 auto',
  },
  contentSection: {
    lineHeight: '1.7',
    fontSize: '1.1rem',
    backgroundColor: 'white', // Give content a white card background
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    maxWidth: '1400px', // Add a max-width to prevent text becoming too wide on huge screens
    margin: '2rem auto 0 auto', // Center the content section
  }
};

const GeneralContractors = () => {
  return (
    // Removed the inner contentWrapper div
    <div style={styles.container}> 
        <header style={styles.header}>
          <h1 style={styles.title}>Solutions for General Contractors</h1>
          <p style={styles.subtitle}>
            Manage your entire project lifecycle, from bidding to closeout, with a single, integrated platform designed for the needs of general contractors.
          </p>
        </header>

        <section style={styles.contentSection}>
          <p>
            As a general contractor, you juggle countless moving parts—subcontractors, schedules, budgets, and client expectations. Our Construction Management System provides the tools you need to stay in control.
          </p>
          <br />
          <p>
            With real-time progress tracking, centralized document management, and seamless communication channels, you can reduce delays, minimize rework, and ensure your projects are delivered on time and on budget. Empower your team with a solution that brings clarity and efficiency to every job site.
          </p>
        </section>
    </div>
  );
};

export default GeneralContractors;

