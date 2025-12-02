import React from 'react';

const About = () => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#f7fafc',
      color: '#1a202c',
      fontFamily: 'system-ui, sans-serif',
    },
    heading: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
    },
    paragraph: {
      maxWidth: '700px',
      fontSize: '1.1rem',
      lineHeight: '1.7',
      color: '#4a5568',
    },
    highlight: {
      color: '#2b6cb0',
      fontWeight: '600',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>About Our Construction Management System</h1>
      <p style={styles.paragraph}>
        Our platform is designed to <span style={styles.highlight}>streamline construction workflows</span> 
        by connecting <span style={styles.highlight}>contractors, customers, and workers</span> in one place. 
        With tools for project tracking, real-time communication, and AI-powered insights, 
        we aim to make construction management <span style={styles.highlight}>simpler, smarter, and more efficient.</span>
      </p>
      <p style={{ ...styles.paragraph, marginTop: '1.5rem' }}>
        Whether you're managing multiple projects or collaborating with clients, 
        our system helps ensure <span style={styles.highlight}>transparency, productivity,</span> 
        and <span style={styles.highlight}>better decision-making.</span>
      </p>
    </div>
  );
};

export default About;
