import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Ensure useNavigate is imported
import { jwtDecode } from 'jwt-decode';
import Chat from '../components/Chat';
import projectService from '../api/projectService';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Helper function
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Styles (remain the same as the corrected version)
const styles = {
  // Styles REVISED for Correct Full-Screen Layout
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr', // Default to 1 column
    gap: '2.5rem',
    width: '100%',
     '@media (min-width: 900px)': { // Simulate media query for 2 columns
      gridTemplateColumns: '1.5fr 1fr', // Give chat slightly more space
    },
  },
  detailsSection: {
     backgroundColor: '#fff', padding: '2rem', borderRadius: '12px',
     border: '1px solid #e2e8f0', boxSizing: 'border-box',
     boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', marginBottom: '3rem',
  },
  projectTitle: {
     fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1a202c',
  },
  projectMeta: { fontSize: '1rem', color: '#4a5568', marginBottom: '0.5rem', lineHeight: '1.5' },
  sidebarSection: {
      display: 'flex', flexDirection: 'column', gap: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem', fontWeight: '600', borderBottom: '2px solid #eee',
    paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#1a202c',
  },
  card: {
     backgroundColor: '#fff', padding: '2rem', borderRadius: '12px',
     border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
  list: { listStyle: 'none', padding: 0, margin: 0, maxHeight: '250px', overflowY: 'auto' },
  listItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.8rem 0.5rem', borderBottom: '1px solid #f0f0f0',
  },
   listItemInfo: { display: 'flex', flexDirection: 'column', marginRight: '1rem' },
  itemName: { fontWeight: '500', color: '#1a202c' },
  itemEmail: { fontSize: '0.85rem', color: '#6b7280' },
  addButton: {
    padding: '0.4rem 0.9rem', fontSize: '0.8rem', backgroundColor: '#f0b900',
    color: '#1a202c', border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap', flexShrink: 0,
  },
  loading: { textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: '#6b7280' },
  error: {
      textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: 'red',
      backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px',
  }
};

// --- START OF COMPONENT ---
const ProjectDetails = () => {
  // State variables
  const { projectId } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate hook HERE
  const [project, setProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [availableClients, setAvailableClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > 900);

   // Effect for screen resize
   useEffect(() => {
    const handleResize = () => setIsWideScreen(window.innerWidth > 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Effect for fetching user info
  useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setCurrentUser(decoded.user);
        } catch (err) {
          console.error("Token decode error:", err);
          localStorage.removeItem('token');
          navigate('/login'); // Use navigate here
        }
      } else {
        navigate('/login'); // Use navigate here
      }
  }, [navigate]); // Add navigate to dependency array

  // Effect for fetching data and WebSocket listener
  useEffect(() => {
    if (!projectId || !currentUser) return;
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true); setError('');
      try {
        const projectResponse = await projectService.getProjectById(projectId);
        if (!projectResponse?.data) throw new Error("Project not found or access denied.");
        if (isMounted) {
            setProject(projectResponse.data);
            if (currentUser.role === 'admin' || currentUser.role === 'manager') {
              const clientsResponse = await projectService.getClients();
               if(clientsResponse?.data){
                    const currentTeamIds = new Set((projectResponse.data.team || []).map(member => member._id));
                    const clientsToAdd = clientsResponse.data.filter(client => !currentTeamIds.has(client._id));
                    setAvailableClients(clientsToAdd);
               } else { setAvailableClients([]); }
            }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        if (isMounted) {
            if (err.response && err.response.status === 403) { setError('Access Denied: You do not have permission.'); }
            else if (err.response && err.response.status === 404) { setError('Project not found.'); }
            else { setError(err.message || 'Failed to load details.'); }
        }
      } finally { if (isMounted) setIsLoading(false); }
    };
    fetchData();
    socket.on('project_updated', (updatedProject) => {
       if (updatedProject._id === projectId && isMounted) {
            console.log("Real-time update received:", updatedProject);
            setProject(updatedProject);
            if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager')) {
                 const currentTeamIds = new Set((updatedProject.team || []).map(member => member._id));
                  projectService.getClients().then(clientsResponse => {
                     const clientsToAdd = (clientsResponse?.data || []).filter(client => !currentTeamIds.has(client._id));
                     if (isMounted) setAvailableClients(clientsToAdd);
                  }).catch(err => console.error("Error refetching clients:", err));
            }
        }
    });
     return () => { isMounted = false; socket.off('project_updated'); };
  }, [projectId, currentUser, navigate]); // Add navigate here as well

  // Handler function for adding team member
  const handleAddTeamMember = async (userIdToAdd) => {
     if (!project) return;
    try {
      await projectService.addTeamMember(project._id, userIdToAdd);
      // Let WebSocket handle UI update
    } catch (error) {
      console.error('Failed to add team member:', error);
      alert('Error: ' + (error.response?.data?.msg || 'Could not add member.'));
    }
  };


  // --- Render Logic ---
  if (isLoading) return <div style={styles.loading}>Loading project details...</div>;
  if (error) return <div style={styles.error}>Error: {error}</div>;
  if (!project || !currentUser) return <div style={styles.loading}>Could not load project data.</div>;

  const canManageTeam = currentUser.role === 'admin' || project.manager?._id === currentUser.id;

  // Apply responsive grid layout style
  const layoutStyle = {
      ...styles.layoutGrid,
      ...(isWideScreen && { gridTemplateColumns: '1.5fr 1fr' })
  };


  return (
    <>
      {/* Project Details Section */}
      <div style={styles.detailsSection}>
        <h1 style={styles.projectTitle}>{project.name}</h1>
        <p style={{...styles.projectMeta, fontSize: '1rem', lineHeight: '1.6'}}>{project.description}</p>
        <p style={styles.projectMeta}><strong>Status:</strong> {project.status}</p>
        <p style={styles.projectMeta}><strong>Manager:</strong> {project.manager?.name || 'N/A'}</p>
        <p style={styles.projectMeta}><strong>Dates:</strong> {formatDate(project.startDate)} - {formatDate(project.endDate)}</p>
      </div>

      {/* Layout Grid for sections below details */}
      <div style={layoutStyle}>
        {/* Column 1: Chat Component */}
        <div style={{...styles.card, ...styles.chatColumn}}>
          <h2 style={styles.sectionTitle}>Project Communication</h2>
          <Chat projectId={projectId} userId={currentUser.id} />
        </div>

        {/* Column 2: Team Management */}
        <div style={styles.teamColumn}>
          {/* Current Team Card */}
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Project Team</h2>
            <ul style={styles.list}>
              {project.team && project.team.length > 0 ? (
                project.team.map(member => (
                  <li key={member._id} style={styles.listItem}>
                    <div style={styles.listItemInfo}>
                        <span style={styles.itemName}>{member.name}</span>
                        <span style={styles.itemEmail}>{member.email}</span>
                    </div>
                  </li>
                ))
              ) : (
                <li style={{padding: '0.5rem 0'}}>No team members assigned yet.</li>
              )}
            </ul>
          </div>

          {/* Team Management Controls Card (Conditional) */}
          {canManageTeam && (
            <div style={styles.card}>
              <h3 style={{...styles.sectionTitle, marginTop: 0}}>Add Client to Team</h3>
              <ul style={styles.list}>
                {availableClients.length > 0 ? (
                  availableClients.map(client => (
                    <li key={client._id} style={styles.listItem}>
                       <div style={styles.listItemInfo}>
                           <span style={styles.itemName}>{client.name}</span>
                           <span style={styles.itemEmail}>{client.email}</span>
                       </div>
                      <button
                        style={styles.addButton}
                        onClick={() => handleAddTeamMember(client._id)}
                      >
                        Add
                      </button>
                    </li>
                  ))
                ) : (
                  <li style={{padding: '0.5rem 0'}}>No available clients to add.</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}; // --- END OF COMPONENT ---

// Ensure NO code exists outside the component definition below this line

export default ProjectDetails;

