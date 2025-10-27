import React from 'react';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem 2rem',
    fontFamily: 'system-ui, sans-serif',
    color: '#2d3748',
  },
  header: {
    textAlign: 'center',
    marginBottom: '4rem',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#718096',
    maxWidth: '700px',
    margin: '0 auto',
  },
  section: {
    marginBottom: '4rem',
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '600',
    marginBottom: '1.5rem',
    borderBottom: '3px solid #f0b900',
    paddingBottom: '0.5rem',
    display: 'inline-block',
  },
  storyText: {
    fontSize: '1.1rem',
    lineHeight: '1.8',
    color: '#4a5568',
  },
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    textAlign: 'center',
  },
  teamMemberCard: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  teamImage: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '1rem',
    border: '4px solid #f0b900',
  },
  memberName: {
    fontSize: '1.4rem',
    fontWeight: '600',
    margin: '0',
  },
  memberRole: {
    fontSize: '1rem',
    color: '#718096',
  },
};

const About = () => {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>About Construct</h1>
        <p style={styles.subtitle}>
          We are a team of innovators passionate about revolutionizing the construction industry with technology that simplifies complexity and enhances collaboration.
        </p>
      </header>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Our Story</h2>
        <p style={styles.storyText}>
          Founded in 2024, Construct was born from a simple observation: the construction industry, for all its importance, was lagging in digital adoption. We saw teams struggling with outdated paperwork, fragmented communication, and a lack of real-time visibility into their projects. We knew there had to be a better way. Our mission is to provide an intuitive, powerful, and centralized platform that empowers contractors, clients, and owners to build better, together.
        </p>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Meet the Team</h2>
        <div style={styles.teamGrid}>
          {/* Team Member 1 */}
          <div style={styles.teamMemberCard}>
            <img 
              src="https://placehold.co/150x150/f0b900/1a202c?text=CEO" 
              alt="Team Member 1" 
              style={styles.teamImage} 
            />
            <h3 style={styles.memberName}>Alex Johnson</h3>
            <p style={styles.memberRole}>Founder & CEO</p>
          </div>

          {/* Team Member 2 */}
          <div style={styles.teamMemberCard}>
            <img 
              src="https://placehold.co/150x150/f0b900/1a202c?text=CTO" 
              alt="Team Member 2" 
              style={styles.teamImage} 
            />
            <h3 style={styles.memberName}>Maria Garcia</h3>
            <p style={styles.memberRole}>Chief Technology Officer</p>
          </div>

          {/* Team Member 3 */}
          <div style={styles.teamMemberCard}>
            <img 
              src="https://placehold.co/150x150/f0b900/1a202c?text=Lead" 
              alt="Team Member 3" 
              style={styles.teamImage} 
            />
            <h3 style={styles.memberName}>David Chen</h3>
            <p style={styles.memberRole}>Lead Product Designer</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
