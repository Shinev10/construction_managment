import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import authService from '../api/authService';

// Data for the 3 options per category
const categoryData = {
  houses: [
    { type: 'Standard House', price: '₹20 Lakh', desc: 'Essential residential home with quality finishes.' },
    { type: 'Premium House', price: '₹50 Lakh', desc: 'Spacious home with luxury fittings and smart features.' },
    { type: 'Luxury Villa', price: '₹1 Crore+', desc: 'Fully customized luxury estate with premium materials.' },
  ],
  buildings: [
    { type: 'Small Office', price: '₹40 Lakh', desc: 'Compact office space for startups and small teams.' },
    { type: 'Retail Store', price: '₹80 Lakh', desc: 'High-visibility retail spaces designed for foot traffic.' },
    { type: 'Corporate Tower', price: '₹5 Crore+', desc: 'Multi-story commercial complex with modern amenities.' },
  ],
  renovations: [
    { type: 'Basic Remodel', price: '₹5 Lakh', desc: 'Kitchen or bathroom refresh with modern fixtures.' },
    { type: 'Full Floor', price: '₹15 Lakh', desc: 'Complete renovation of flooring, walls, and lighting.' },
    { type: 'Structural Extension', price: '₹30 Lakh', desc: 'Adding new rooms or floors to your existing property.' },
  ]
};

const styles = {
  pageContainer: { padding: '3rem 5%', backgroundColor: '#f7fafc', minHeight: '100vh' },
  title: { fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center', color: '#1a202c', fontWeight: 'bold' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' },
  card: { backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', border: '1px solid #e2e8f0' },
  cardTitle: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1a202c' },
  price: { color: '#f0b900', margin: '1rem 0', fontSize: '1.8rem', fontWeight: 'bold' },
  desc: { color: '#4a5568', marginBottom: '1.5rem', lineHeight: '1.6' },
  button: { backgroundColor: '#f0b900', border: 'none', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', color: '#1a202c', transition: 'background 0.2s' }
};

const CategoryDetails = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);
  
  const items = categoryData[category] || [];

  const handleSelect = async (item) => {
    setLoading(item.type);
    try {
      // 1. Submit Inquiry to Admin (using existing API)
      await authService.submitInquiry(item.type);
      
      // 2. Redirect to the "Smart Chat" page
      navigate('/support-chat', { state: { context: item.type } });
    } catch (error) {
      alert("Failed to submit request. Please try again.");
      setLoading(null);
    }
  };

  if (items.length === 0) return <div>Category not found</div>;

  return (
    <div style={styles.pageContainer}>
      <h1 style={styles.title}>Select Your {category.charAt(0).toUpperCase() + category.slice(1)} Plan</h1>
      <div style={styles.grid}>
        {items.map((item, index) => (
          <div key={index} style={styles.card}>
            <h2 style={styles.cardTitle}>{item.type}</h2>
            <div style={styles.price}>{item.price}</div>
            <p style={styles.desc}>{item.desc}</p>
            <button 
              style={styles.button} 
              onClick={() => handleSelect(item)}
              disabled={loading !== null}
            >
              {loading === item.type ? 'Processing...' : 'Select & Chat'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryDetails;