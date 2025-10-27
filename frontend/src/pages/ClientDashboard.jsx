import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import projectService from '../api/projectService';
import authService from '../api/authService'; // Needed for submitting inquiries
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// --- HELPER FUNCTIONS ---
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return { backgroundColor: '#d1fae5', color: '#065f46' };
    case 'In Progress': return { backgroundColor: '#dbeafe', color: '#1e40af' };
    case 'On Hold': return { backgroundColor: '#fee2e2', color: '#991b1b' };
    default: return { backgroundColor: '#f0b900', color: '#1a202c' };
  }
};

// --- OFFERINGS DATA ---
const offerings = [
  { price: '₹20 Lakh Range', description: 'A standard, high-quality residential home...', type: 'Standard Residential' },
  { price: '₹50 Lakh Range', description: 'A premium, spacious home featuring luxury fittings...', type: 'Premium Residential' },
  { price: '₹1 Crore & Above', description: 'Fully customized luxury villas or commercial buildings...', type: 'Custom Luxury/Commercial' },
];

// --- STYLES OBJECT ---
const styles = {
  contentWrapper: { width: '100%', fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' },
  welcomeMessage: { fontSize: '1.2rem', color: '#4a5568' },
  title: { fontSize: '2rem', fontWeight: 'bold', color: '#1a202c' },
  toggleButton: { padding: '0.7rem 1.5rem', border: 'none', borderRadius: '8px', backgroundColor: '#1a202c', color: 'white', fontWeight: 'bold', cursor: 'pointer' },
  // Project List Styles
  projectListContainer: { marginTop: '2rem' },
  projectsHeader: { fontSize: '1.5rem', fontWeight: '600', color: '#1a202c', marginBottom: '1rem' },
  summaryContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' },
  summaryCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' },
  summaryValue: { fontSize: '2.5rem', fontWeight: 'bold' },
  summaryLabel: { fontSize: '1rem', color: '#6b7280' },
  projectList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginTop: '1rem' },
  projectItem: { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  projectName: { fontSize: '1.5rem', fontWeight: '600', color: '#1a202c', marginBottom: '0.5rem' },
  projectStatus: { display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '600' },
  projectDetails: { marginTop: '1rem', fontSize: '0.9rem', color: '#4a5568' },
  link: { display: 'inline-block', marginTop: '1.5rem', fontWeight: 'bold', color: '#1a202c', textDecoration: 'none' },
  // Offerings View Styles
  offeringsHeader: { textAlign: 'center', marginBottom: '3rem' },
  offeringsTitle: { fontSize: '2.5rem', fontWeight: 'bold', color: '#1a202c' },
  offeringGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' },
  offeringCard: { backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s, box-shadow 0.2s' },
  offeringPrice: { fontSize: '2rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1rem' },
  offeringDescription: { color: '#4a5568', marginBottom: '2rem', flexGrow: 1 },
  inquireButton: { backgroundColor: '#f0b900', color: '#1a202c', padding: '1rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block', border: 'none', cursor: 'pointer'},
  // Styles for feedback message
   feedbackMessage: { marginTop: '2rem', padding: '1rem', borderRadius: '8px', textAlign: 'center', fontWeight: '500', maxWidth: '800px', margin: '2rem auto 0 auto' },
   successMessage: { backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' },
   errorMessage: { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
   buttonDisabled: { backgroundColor: '#e2e8f0', color: '#9ca3af', cursor: 'not-allowed' },
  // No Projects Message Style
  noProjectsContainer: { textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' },
  noProjectsTitle: { fontSize: '1.8rem', fontWeight: '600', marginBottom: '1rem' },
  noProjectsText: { color: '#4a5568', marginBottom: '2rem' },
  browseButton: { backgroundColor: '#f0b900', color: '#1a202c', padding: '1rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', border:'none', cursor:'pointer' },
};

// --- START OF COMPONENT ---
const ClientDashboard = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [currentView, setCurrentView] = useState('offerings');
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [submittingInquiry, setSubmittingInquiry] = useState(null);

  useEffect(() => {
    // Fetch projects when component mounts
    const fetchProjects = async () => {
      try { const res = await projectService.getProjects(); setProjects(res.data); }
      catch (error) { console.error('Failed fetch projects:', error); }
    };
    fetchProjects();

    // Set up WebSocket listener
    socket.on('project_created', (newProject) => {
      const isUserInTeam = newProject.team.some(member => member._id === user.id);
      if (isUserInTeam) setProjects((prev) => [newProject, ...prev]);
    });

    // Clean up listener on unmount
    return () => { socket.off('project_created'); };
  }, [user.id]);

  // Handler for submitting inquiry
  const handleInquiry = async (offeringType) => {
    setSubmittingInquiry(offeringType);
    setFeedback({ message: '', type: '' });
    try {
      const response = await authService.submitInquiry(offeringType);
      setFeedback({ message: response.data.msg || 'Inquiry sent!', type: 'success' });
    } catch (error) {
      console.error("Inquiry submission error:", error);
      setFeedback({ message: error.response?.data?.msg || 'Failed to send inquiry.', type: 'error' });
    } finally {
      setSubmittingInquiry(null);
    }
  };

  // Calculate project summaries
  const activeProjects = projects.filter(p => p.status === 'In Progress').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const totalProjects = projects.length;

  return (
    <div style={styles.contentWrapper}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Client Dashboard</h1>
          <p style={styles.welcomeMessage}>Welcome, {user.name}!</p>
        </div>
        <button
          onClick={() => setCurrentView(currentView === 'offerings' ? 'projects' : 'offerings')}
          style={styles.toggleButton}
        >
          {currentView === 'offerings' ? 'View My Assigned Projects' : 'Browse Project Offerings'}
        </button>
      </div>

      {/* Display Feedback Message */}
      {feedback.message && (
          <div style={{...styles.feedbackMessage, ...(feedback.type === 'success' ? styles.successMessage : styles.errorMessage)}}>
              {feedback.message}
          </div>
      )}

      {currentView === 'offerings' ? (
        // --- Show Project Offerings View ---
        <div>
          <header style={styles.offeringsHeader}>
            <h1 style={styles.offeringsTitle}>Choose Your Construction Plan</h1>
          </header>
          <div style={styles.offeringGrid}>
            {offerings.map((offer, index) => (
              <div
                key={index}
                style={styles.offeringCard}
                 onMouseEnter={(e) => { /* ... hover ... */ }}
                 onMouseLeave={(e) => { /* ... hover ... */ }}
              >
                <div>
                  <div style={styles.offeringPrice}>{offer.price}</div>
                  <p style={styles.offeringDescription}>{offer.description}</p>
                </div>
                 {/* --- CORRECTED: Changed Link to Button with onClick --- */}
                <button
                  onClick={() => handleInquiry(offer.type)} // Call inquiry handler
                  style={{
                      ...styles.inquireButton,
                      ...(submittingInquiry === offer.type ? styles.buttonDisabled : {})
                  }}
                  disabled={submittingInquiry !== null} // Disable all if one submitting
                >
                  {submittingInquiry === offer.type ? 'Submitting...' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // --- Show Assigned Projects View ---
        <div style={styles.projectListContainer}>
          {projects.length > 0 ? (
             <> {/* Project summary and list */}
               <div style={styles.summaryContainer}>
                 <div style={styles.summaryCard}><div style={styles.summaryValue}>{totalProjects}</div><div style={styles.summaryLabel}>Total</div></div>
                 <div style={styles.summaryCard}><div style={styles.summaryValue}>{activeProjects}</div><div style={styles.summaryLabel}>Active</div></div>
                 <div style={styles.summaryCard}><div style={styles.summaryValue}>{completedProjects}</div><div style={styles.summaryLabel}>Completed</div></div>
              </div>
              <h3 style={styles.projectsHeader}>Your Assigned Projects</h3>
              <div style={styles.projectList}>
                {projects.map(project => (
                  <div key={project._id} style={styles.projectItem} /* ... hover ... */ >
                    <div>
                      <h4 style={styles.projectName}>{project.name}</h4>
                      <p style={{color: '#4a5568'}}>{project.description}</p>
                      <div style={styles.projectDetails}>
                        <div><strong>Manager:</strong> {project.manager?.name || 'N/A'}</div>
                        <div><strong>Dates:</strong> {formatDate(project.startDate)} - {formatDate(project.endDate)}</div>
                      </div>
                    </div>
                    <div>
                      <span style={{ ...styles.projectStatus, ...getStatusColor(project.status) }}>
                        {project.status}
                      </span>
                      <Link to={`/project/${project._id}`} style={styles.link}>
                        View Details & Chat →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
             </>
          ) : (
             <div style={styles.noProjectsContainer}>
                <h2 style={styles.noProjectsTitle}>No Projects Yet</h2>
                <p style={styles.noProjectsText}>You have not been assigned to any construction projects.</p>
                <button onClick={() => setCurrentView('offerings')} style={styles.browseButton}>
                    Browse Project Offerings
                </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; // --- END OF COMPONENT ---

export default ClientDashboard;

