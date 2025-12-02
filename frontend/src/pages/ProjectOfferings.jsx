import React from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  pageContainer: {
    backgroundColor: '#f7fafc', 
    minHeight: 'calc(100vh - 80px)', 
    width: '100%',
    padding: '3rem 0', 
    fontFamily: 'system-ui, sans-serif',
  },
  contentWrapper: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: '0 2rem' 
  },
  header: { 
    textAlign: 'center', 
    marginBottom: '3rem' 
  },
  title: { 
    fontSize: '2.5rem', 
    fontWeight: 'bold', 
    color: '#1a202c' 
  },
  grid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
    gap: '2rem' 
  },
  card: {
    backgroundColor: 'white', 
    borderRadius: '12px', 
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', 
    cursor: 'pointer',
    transition: 'transform 0.2s', 
    border: '1px solid #e2e8f0',
    display: 'flex', 
    flexDirection: 'column', 
    height: '400px' 
  },
  cardHeader: {
    height: '200px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    fontSize: '2.5rem', 
    fontWeight: 'bold', 
    color: '#1a202c'
  },
  cardBody: { 
    padding: '1.5rem', 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column' 
  },
  cardTitle: { 
    fontSize: '1.5rem', 
    fontWeight: 'bold', 
    marginBottom: '0.5rem' 
  },
  cardText: { 
    color: '#4a5568', 
    lineHeight: '1.5' 
  },
  viewLink: { 
    marginTop: 'auto', 
    color: '#1a202c', 
    fontWeight: 'bold', 
    fontSize: '0.9rem' 
  }
};

const categories = [
  { 
    id: 'houses', 
    title: 'Houses', 
    color: '#f0b900', 
    desc: 'Residential Homes. View our range of modern and traditional home designs.' 
  },
  { 
    id: 'buildings', 
    title: 'Buildings', 
    color: '#1a202c', 
    textColor: 'white', 
    desc: 'Commercial Projects. Explore solutions for offices, retail, and commercial properties.' 
  },
  { 
    id: 'renovations', 
    title: 'Renovations', 
    color: '#4a5568', 
    textColor: 'white', 
    desc: 'Renovation Services. Modernize your existing space with remodels and extensions.' 
  },
];

const ProjectOfferings = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        <header style={styles.header}>
          <h1 style={styles.title}>Browse Our Offerings</h1>
        </header>
        <div style={styles.grid}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={styles.card}
              onClick={() => navigate(`/offerings/${cat.id}`)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                ...styles.cardHeader, 
                backgroundColor: cat.color, 
                color: cat.textColor || '#1a202c'
              }}>
                {cat.title}
              </div>
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{cat.desc.split('.')[0]}</h3>
                <p style={styles.cardText}>{cat.desc.split('.').slice(1).join('.')}</p>
                <span style={styles.viewLink}>View Products →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectOfferings;