import React from 'react';
import { Link } from 'react-router-dom';

// --- Category Data ---
const categories = [
  { 
    name: 'Residential Homes',
    slug: 'residential', // This will be used in the URL
    description: 'View our range of modern and traditional home designs.',
    imageUrl: 'https://placehold.co/600x400/f0b900/1a202c?text=Houses'
  },
  { 
    name: 'Commercial Projects', 
    slug: 'commercial',
    description: 'Explore solutions for offices, retail, and other commercial properties.',
    imageUrl: 'https://placehold.co/600x400/1a202c/f0b900?text=Buildings'
  },
  { 
    name: 'Renovation Services', 
    slug: 'renovations',
    description: 'Modernize your existing space. We handle remodels, extensions, and interior upgrades.',
    imageUrl: 'https://placehold.co/600x400/4a5568/ffffff?text=Renovations'
  },
];

// --- STYLES ---
const styles = {
  pageContainer: { 
    width: '100%', 
    padding: '2rem 5%', 
    fontFamily: 'system-ui, sans-serif' 
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
  categoryGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
    gap: '2rem' 
  },
  categoryCard: {
    backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    textDecoration: 'none',
    color: 'inherit',
    overflow: 'hidden', // To contain image
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  categoryImage: {
    width: '100%',
    height: '220px',
    objectFit: 'cover',
    borderBottom: '1px solid #e2e8f0',
  },
  categoryContent: {
    padding: '1.5rem',
  },
  categoryName: { 
    fontSize: '1.5rem', 
    fontWeight: '600', 
    color: '#1a202c', 
    marginBottom: '0.5rem' 
  },
  categoryDescription: { 
    color: '#4a5568', 
    marginBottom: '1.5rem',
  },
  categoryLink: {
    fontWeight: 'bold',
    color: '#1a202c',
    textDecoration: 'none',
  },
};

const OfferingsCategoryPage = () => {
  return (
    <div style={styles.pageContainer}>
      <header style={styles.header}>
        <h1 style={styles.title}>Browse Our Offerings</h1>
      </header>
      <div style={styles.categoryGrid}>
        {categories.map((category, index) => (
          <Link
            key={index}
            to={`/offerings/${category.slug}`} // Use the new route
            style={styles.categoryCard}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; }}
          >
            <img 
              src={category.imageUrl} 
              alt={category.name} 
              style={styles.categoryImage} 
              onError={(e) => e.target.src = 'https://placehold.co/600x400/e2e8f0/4a5568?text=Image+Not+Found'}
            />
            <div style={styles.categoryContent}>
              <h3 style={styles.categoryName}>{category.name}</h3>
              <p style={styles.categoryDescription}>{category.description}</p>
              <span style={styles.categoryLink}>View Products →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OfferingsCategoryPage;

