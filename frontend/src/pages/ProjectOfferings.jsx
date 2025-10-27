import React, { useState } from 'react'; // Import useState
// Removed Link as buttons are now used differently for inquiry
import authService from '../api/authService'; // Import the service with submitInquiry

const styles = {
  pageContainer: {
    backgroundColor: '#f7fafc', minHeight: 'calc(100vh - 80px)', width: '100%',
    padding: '3rem 0', fontFamily: 'system-ui, sans-serif',
  },
  contentWrapper: { maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' },
  header: { textAlign: 'center', marginBottom: '3rem' },
  title: { fontSize: '2.5rem', fontWeight: 'bold', color: '#1a202c' },
  offeringGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' },
  offeringCard: {
    backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
    padding: '2.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    textAlign: 'center', display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between', transition: 'transform 0.2s, box-shadow 0.2s',
  },
  offeringPrice: { fontSize: '2rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1rem' },
  offeringDescription: { color: '#4a5568', marginBottom: '2rem', flexGrow: 1 },
  inquireButton: {
    backgroundColor: '#f0b900', color: '#1a202c', padding: '1rem 1.5rem',
    borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold',
    display: 'inline-block', border: 'none', cursor: 'pointer', // Make it look like a button
    fontSize: '1rem', // Ensure font size is set
    lineHeight: '1.5', // Ensure line height is normal
  },
   // --- Styles for feedback message ---
   feedbackMessage: {
       marginTop: '2rem', padding: '1rem', borderRadius: '8px',
       textAlign: 'center', fontWeight: '500', maxWidth: '800px', margin: '2rem auto 0 auto',
   },
   successMessage: { backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' },
   errorMessage: { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
   // Style for disabled button
   buttonDisabled: { backgroundColor: '#e2e8f0', color: '#9ca3af', cursor: 'not-allowed' }
};

// Added 'type' for identifying the offering in the API call
const offerings = [
  { price: '₹20 Lakh Range', description: 'A standard, high-quality residential home...', type: 'Standard Residential' },
  { price: '₹50 Lakh Range', description: 'A premium, spacious home featuring luxury fittings...', type: 'Premium Residential' },
  { price: '₹1 Crore & Above', description: 'Fully customized luxury villas or commercial buildings...', type: 'Custom Luxury/Commercial' },
];

const ProjectOfferings = () => {
  const [feedback, setFeedback] = useState({ message: '', type: '' }); // type: 'success' or 'error'
  const [submittingInquiry, setSubmittingInquiry] = useState(null); // Track which offering type is submitting

  // Function to handle the inquiry submission
  const handleInquiry = async (offeringType) => {
    setSubmittingInquiry(offeringType); // Set loading state for this specific button
    setFeedback({ message: '', type: '' }); // Clear previous message
    try {
      const response = await authService.submitInquiry(offeringType); // Call the API service
      setFeedback({ message: response.data.msg || 'Inquiry submitted! An admin will contact you.', type: 'success' });
      // Optionally disable all buttons after one success? Or redirect?
    } catch (error) {
      console.error("Inquiry submission error:", error);
      setFeedback({ message: error.response?.data?.msg || 'Failed to submit inquiry. Please try again.', type: 'error' });
    } finally {
        setSubmittingInquiry(null); // Clear loading state
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        <header style={styles.header}>
          <h1 style={styles.title}>Choose Your Construction Plan</h1>
        </header>

        {/* Display Success/Error Message */}
         {feedback.message && (
             <div style={{...styles.feedbackMessage, ...(feedback.type === 'success' ? styles.successMessage : styles.errorMessage)}}>
                 {feedback.message}
             </div>
         )}

        <div style={styles.offeringGrid}>
          {offerings.map((offer, index) => (
            <div
              key={index}
              style={styles.offeringCard}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'; }}
            >
              <div>
                <div style={styles.offeringPrice}>{offer.price}</div>
                <p style={styles.offeringDescription}>{offer.description}</p>
              </div>
              {/* --- Button text changed here --- */}
              <button
                onClick={() => handleInquiry(offer.type)} // Call handler with offering type
                style={{
                    ...styles.inquireButton,
                    ...(submittingInquiry === offer.type ? styles.buttonDisabled : {}) // Apply disabled style if loading
                }}
                disabled={submittingInquiry !== null} // Disable all buttons if any is submitting
              >
                {submittingInquiry === offer.type ? 'Submitting...' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectOfferings;

