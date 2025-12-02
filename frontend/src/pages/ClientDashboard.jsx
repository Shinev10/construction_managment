import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import projectService from '../api/projectService'; // Removed .js extension
import authService from '../api/authService'; // Removed .js extension
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
// Helper function to format dates nicely
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// --- REMOVED old offerings data ---

// --- STYLES OBJECT ---
const styles = {
  contentWrapper: { width: '100%', fontFamily: 'system-ui, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' },
  welcomeMessage: { fontSize: '1.2rem', color: '#4a5568' },
  title: { fontSize: '2rem', fontWeight: 'bold', color: '#1a202c' },
  
  // --- STYLES FOR TAB BUTTONS ---
  viewToggleContainer: { display: 'flex', gap: '0.5rem', marginBottom: '2rem' },
  toggleButton: { 
    padding: '0.7rem 1.5rem', 
    border: '1px solid #cbd5e0',
    borderRadius: '8px', 
    backgroundColor: '#ffffff', 
    color: '#334155', 
    fontWeight: '600', 
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
    textDecoration: 'none', // For Link component
  },
  toggleButtonActive: {
    backgroundColor: '#1a202c', 
    color: 'white', 
    borderColor: '#1a202c',
  },
  
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
  
  // --- INQUIRY/CONVERSATION LIST STYLES ---
  inquiryListContainer: { marginTop: '2rem' },
  inquiryListHeader: { fontSize: '1.5rem', fontWeight: '600', color: '#1a202c', marginBottom: '1rem' },
  inquiryList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  inquiryItem: { 
    backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', 
    padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  inquiryInfo: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  inquiryType: { fontSize: '1.2rem', fontWeight: '600', color: '#1a202c' },
  inquiryStatus: { fontSize: '0.9rem' },
  inquiryStatusAI: { color: '#1d4ed8', fontWeight: '500' },
  inquiryStatusAdmin: { color: '#166534', fontWeight: '500' },
  inquiryTimestamp: { fontSize: '0.8rem', color: '#6b7280' },
  chatLink: { 
    backgroundColor: '#f0b900', color: '#1a202c', padding: '0.7rem 1.5rem',
    borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold',
    border: 'none', cursor: 'pointer', fontSize: '0.9rem',
  },

  // --- REMOVED Offerings styles ---

  // --- REMOVED Feedback styles (now on product page) ---
  
  // No Projects Message Style
  noProjectsContainer: { textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' },
  noProjectsTitle: { fontSize: '1.8rem', fontWeight: '600', marginBottom: '1rem' },
  noProjectsText: { color: '#4a5568', marginBottom: '2rem' },
  browseButton: { 
    backgroundColor: '#f0b900', color: '#1a202c', padding: '1rem 2rem', 
    borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', 
    border:'none', cursor:'pointer', display: 'inline-block'
  },
};

// --- START OF COMPONENT ---
const ClientDashboard = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [currentView, setCurrentView] = useState('projects');
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);
  
  // --- REMOVED feedback and submittingInquiry states ---

  // --- UPDATED: useEffect to fetch projects AND inquiries ---
  useEffect(() => {
    let isMounted = true;
    
    // Fetch projects
    const fetchProjects = async () => {
      try { 
        const res = await projectService.getProjects(); 
        if(isMounted) setProjects(res.data); 
      }
      catch (error) { console.error('Failed fetch projects:', error); }
    };
    
    // Fetch inquiries (the new "conversations")
    const fetchInquiries = async () => {
        setLoadingInquiries(true);
        try {
            const res = await authService.getMyInquiries(); // Using new authService method
            if (isMounted) setInquiries(res.data);
        } catch (error) {
            console.error('Failed fetch inquiries:', error);
        } finally {
            if (isMounted) setLoadingInquiries(false);
        }
    };

    fetchProjects();
    fetchInquiries();

    // --- UPDATED: Socket listeners ---
    socket.on('project_created', (newProject) => {
      const isUserInTeam = newProject.team.some(member => member._id === user.id);
      if (isUserInTeam) setProjects((prev) => [newProject, ...prev]);
    });
    
    // Listen for updates to inquiries (new message, handoff)
    const handleInquiryUpdate = (updatedInquiry) => {
        // Check if the update is for this client
        if (isMounted && updatedInquiry.client && (updatedInquiry.client._id === user.id || updatedInquiry.client === user.id)) { 
            setInquiries(prev => 
                prev.map(inq => inq._id === updatedInquiry._id ? updatedInquiry : inq)
                   .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) // Re-sort by latest activity
            );
        }
    };
    
    // Listen for any inquiry update (new message, status change, handoff)
    socket.on('inquiry_updated_realtime', handleInquiryUpdate); // Emitted by server on new message
    socket.on('chat_taken_over', handleInquiryUpdate); // Emitted by admin takeover
    socket.on('inquiry_updated', handleInquiryUpdate); // Emitted by admin status change

    socket.on('new_inquiry', (newInquiry) => { // Listen for *our own* new inquiry
        if (isMounted && newInquiry.client?._id === user.id) {
            setInquiries(prev => [newInVquiry, ...prev]
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            );
            // No longer need feedback here, navigation happens on product page
            setCurrentView('inquiries'); // This is still good
        }
    });

    // Clean up listener on unmount
    return () => {
        isMounted = false;
        socket.off('project_created');
        socket.off('inquiry_updated_realtime', handleInquiryUpdate);
        socket.off('chat_taken_over', handleInquiryUpdate);
        socket.off('inquiry_updated', handleInquiryUpdate);
        socket.off('new_inquiry');
    };
  }, [user.id]);

  // --- REMOVED: handleInquiry logic (it's on the product page now) ---

  // Calculate project summaries
  const activeProjects = projects.filter(p => p.status === 'In Progress').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const totalProjects = projects.length;

  // --- RENDER FUNCTION ---
  const renderView = () => {
    switch (currentView) {
      case 'projects':
        return (
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
                    <div key={project._id} style={styles.projectItem}>
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
                  {/* Link changed to /offerings */}
                  <Link to="/offerings" style={styles.browseButton}>
                      Browse Project Offerings
                  </Link>
              </div>
            )}
          </div>
        );

      // --- UPDATED: 'inquiries' view ---
      case 'inquiries':
        return (
          <div style={styles.inquiryListContainer}>
            <h3 style={styles.inquiryListHeader}>Your Inquiries & Conversations</h3>
            {loadingInquiries ? (
                <p>Loading conversations...</p>
            ) : inquiries.length > 0 ? (
                <div style={styles.inquiryList}>
                    {inquiries.map(inq => (
                        <div key={inq._id} style={styles.inquiryItem}>
                            <div style={styles.inquiryInfo}>
                                <span style={styles.inquiryType}>{inq.offeringType}</span>
                                <span style={{
                                    ...styles.inquiryStatus,
                                    ...(inq.chatState === 'ai' ? styles.inquiryStatusAI : styles.inquiryStatusAdmin)
                                }}>
                                    {inq.chatState === 'ai' 
                                        ? "Chatting with AI" 
                                        : `Chatting with ${inq.assignedAdmin?.name || 'Admin'}`
                                    }
                                </span>
                                <span style={styles.inquiryTimestamp}>
                                    Last activity: {formatDateTime(inq.updatedAt)}
                                </span>
                            </div>
                            <Link to={`/inquiry/${inq._id}`} style={styles.chatLink}>
                                Open Chat
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={styles.noProjectsContainer}>
                   <h2 style={styles.noProjectsTitle}>No Inquiries Yet</h2>
                   <p style={styles.noProjectsText}>You have no active inquiries. Browse offerings to start a chat.</p>
                   <Link to="/offerings" style={styles.browseButton}>
                       Browse Project Offerings
                   </Link>
                </div>
            )}
          </div>
        );
      
      // --- REMOVED 'offerings' case ---
      
      default:
        return null;
    }
  };

  return (
    <div style={styles.contentWrapper}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Client Dashboard</h1>
          <p style={styles.welcomeMessage}>Welcome, {user.name}!</p>
        </div>
      </div>
      
      {/* --- REMOVED feedback message --- */}

      {/* --- UPDATED: View Toggle Buttons --- */}
      <div style={styles.viewToggleContainer}>
          <button
            onClick={() => setCurrentView('projects')}
            style={{...styles.toggleButton, ...(currentView === 'projects' ? styles.toggleButtonActive : {})}}
          >
            My Projects
          </button>
          <button
            onClick={() => setCurrentView('inquiries')}
            style={{...styles.toggleButton, ...(currentView === 'inquiries' ? styles.toggleButtonActive : {})}}
          >
            My Inquiries
          </button>
          {/* This is now a Link, not a button */}
          <Link
            to="/offerings"
            style={styles.toggleButton}
          >
            Browse Offerings
          </Link>
      </div>
      
      {/* Render the active view */}
      <div>
        {renderView()}
      </div>

    </div>
  );
}; // --- END OF COMPONENT ---

export default ClientDashboard;