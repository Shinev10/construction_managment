import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import projectService from '../api/projectService'; // Make sure this imports correctly
import authService from '../api/authService'; // Import authService for inquiries
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Helper function to format dates nicely
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Function to fetch managers (remains the same)
const fetchManagers = async () => { /* ... (keep existing fetch function) ... */ 
    const token = localStorage.getItem('token');
    if (!token) { console.error("No token"); return []; }
    try {
        const res = await fetch('http://localhost:5000/api/users/managers', { headers: { 'x-auth-token': token } });
        if (!res.ok) { const errData = await res.json(); throw new Error(errData.msg || `Failed: ${res.status}`); }
        return await res.json();
    } catch (err) { console.error("Fetch managers error:", err); alert(`Error: ${err.message}`); return []; }
};

const styles = {
  // Styles remain the same as the previous corrected version
  pageWrapper: { padding: '0rem 0%', fontFamily: 'system-ui, sans-serif', width: '100%', boxSizing: 'border-box' },
  dashboardLayout: {
    display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', width: '100%',
    marginTop: '2rem', padding: '0 5%', boxSizing: 'border-box',
    // Media query would go in a CSS file or styled-components for proper implementation
    // Simulating effect with logic below for now
  },
   twoColumnLayout: { // Style object for two columns
       gridTemplateColumns: 'minmax(350px, 1.2fr) 2fr',
   },
  mainContentColumn: { display: 'flex', flexDirection: 'column', gap: '3rem' },
  sidebarColumn: {
      position: 'sticky', top: '2rem', alignSelf: 'start', maxWidth: '450px',
      // Media query simulation done via conditional style merge below
  },
  welcomeMessage: { fontSize: '1.2rem', color: '#4a5568', marginBottom: '0.5rem', padding: '0 5%' },
  title: { fontSize: '2rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '2rem', padding: '0 5%' },
  formContainer: { padding: '2rem', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' },
  formTitle: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1a202c' },
  input: { width: '100%', padding: '0.85rem', marginBottom: '1rem', border: '1px solid #cbd5e0', borderRadius: '8px', boxSizing: 'border-box', fontSize: '1rem' },
  select: { width: '100%', padding: '0.85rem', marginBottom: '1rem', border: '1px solid #cbd5e0', borderRadius: '8px', boxSizing: 'border-box', backgroundColor: 'white', appearance: 'none', backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="%239ca3af" class="bi bi-chevron-down" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em', fontSize: '1rem' },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' },
  button: { width: '100%', padding: '0.9rem 1.5rem', border: 'none', borderRadius: '8px', backgroundColor: '#f0b900', color: '#1a202c', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', marginTop: '0.5rem', transition: 'background-color 0.2s' },
  projectListContainer: {},
  projectListTitle: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1a202c' },
  projectList: { maxHeight: 'calc(50vh - 100px)', overflowY: 'auto', paddingRight: '1rem' },
  projectItem: { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', transition: 'transform 0.2s, box-shadow 0.2s' },
  projectItemHover: { transform: 'translateY(-4px)', boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' },
  projectName: { fontSize: '1.3rem', fontWeight: '600', color: '#1a202c', marginBottom: '0.5rem' },
  projectMeta: { color: '#4a5568', fontSize: '0.9rem', marginBottom: '0.3rem' },
  link: { display: 'inline-block', marginTop: '1rem', fontWeight: 'bold', color: '#1a202c', textDecoration: 'none', fontSize: '0.9rem' },
  inquiriesContainer: { padding: '2rem', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' },
  inquiriesTitle: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1a202c' },
  inquiryTable: { width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' },
  tableHeader: { borderBottom: '2px solid #e2e8f0', textAlign: 'left', padding: '0.75rem 0.5rem', color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase' },
  tableRow: { borderBottom: '1px solid #f1f5f9' },
  tableCell: { padding: '1rem 0.5rem', verticalAlign: 'middle', wordBreak: 'break-word' },
  statusSelect: { padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: 'white', fontSize: '0.9rem' }
};


const AdminDashboard = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', description: '', startDate: '', endDate: '' });
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState('');
  const [loadingManagers, setLoadingManagers] = useState(true);
  const [inquiries, setInquiries] = useState([]);
  const [loadingInquiries, setLoadingInquiries] = useState(true);
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > 900);

  useEffect(() => { /* Effect for screen resize */ 
      const handleResize = () => setIsWideScreen(window.innerWidth > 900);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Combined useEffect for data loading and WebSocket
  useEffect(() => {
    let isMounted = true;
    // --- Fetch functions ---
    const fetchProjects = async () => { try { const res = await projectService.getProjects(); if(isMounted) setProjects(res.data); } catch (error) { console.error('Failed fetch projects:', error); } };
    const loadManagers = async () => { setLoadingManagers(true); const fetched = await fetchManagers(); if(isMounted) { setManagers(fetched); if (fetched.length > 0) setSelectedManager(fetched[0]._id); setLoadingManagers(false); } };
    const fetchInquiries = async () => { setLoadingInquiries(true); try { const res = await authService.getInquiries(); if (isMounted) setInquiries(res.data); } catch (error) { console.error('Failed fetch inquiries:', error); if (isMounted && user?.role === 'admin') alert('Could not load inquiries.'); } finally { if (isMounted) setLoadingInquiries(false); } };
    // --- Initial Fetches ---
    fetchProjects(); loadManagers(); fetchInquiries();
    // --- WebSocket Listeners ---
    socket.on('project_created', (p) => { if(isMounted) setProjects((prev) => [p, ...prev]); });
    socket.on('new_inquiry', (i) => { if(isMounted) setInquiries((prev) => [i, ...prev]); });
    socket.on('inquiry_updated', (updInq) => { if(isMounted) setInquiries((prev) => prev.map(inq => inq._id === updInq._id ? updInq : inq)); });
    // --- Cleanup ---
    return () => { isMounted = false; socket.off('project_created'); socket.off('new_inquiry'); socket.off('inquiry_updated'); };
  }, [user]); // Added user dependency

  // --- Handlers ---
  const handleInputChange = (e) => setNewProject({ ...newProject, [e.target.name]: e.target.value });
  const handleManagerChange = (e) => setSelectedManager(e.target.value);
  const handleCreateProject = async (e) => { e.preventDefault(); if (!selectedManager) { alert("Please select manager."); return; } try { const d = { ...newProject, manager: selectedManager, team: [selectedManager] }; await projectService.createProject(d); setNewProject({ name: '', description: '', startDate: '', endDate: '' }); if (managers.length > 0) setSelectedManager(managers[0]._id); alert('Project created!'); } catch (err) { console.error('Create project error:', err); alert('Error: ' + (err.response?.data?.msg || 'Could not create.')); } };
  const handleStatusChange = async (inquiryId, newStatus) => { const current = inquiries.find(i => i._id === inquiryId); if (current?.status === newStatus) return; try { setInquiries((prev) => prev.map(i => i._id === inquiryId ? { ...i, status: newStatus } : i)); await authService.updateInquiryStatus(inquiryId, newStatus); } catch (err) { console.error("Update status error:", err); alert("Update failed."); const fetchAgain = async () => { try { const res = await authService.getInquiries(); setInquiries(res.data); } catch { /* handle */ } }; fetchAgain(); } };

   // --- RENDER LOGIC ---
   // Apply responsive grid layout style conditionally
   const layoutStyle = {
      ...styles.dashboardLayout,
      ...(isWideScreen ? styles.twoColumnLayout : {}), // Apply 2 columns if wide
       ...(!isWideScreen && { padding: '0 2rem'}) // Less padding on mobile?
   };
   // Adjust sidebar style conditionally
    const sidebarStyle = {
        ...styles.sidebarColumn,
        ...(!isWideScreen && { position: 'static', maxWidth: 'none' }) // Override sticky/max-width on small screens
    };

  return (
    // Removed outer pageWrapper div
    <div> 
      {/* Apply padding directly to title/welcome or keep in parent */}
      <h2 style={styles.title}>Admin Dashboard</h2>
      <p style={styles.welcomeMessage}>Welcome, {user.name}!</p>

      {/* dashboardLayout now applies padding and responsive columns */}
      <div style={layoutStyle}> 
        {/* --- Sidebar Column (Form) --- */}
        <div style={sidebarStyle}>
           <div style={styles.formContainer}>
            <h3 style={styles.formTitle}>Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              {/* --- CORRECTED Form Inputs --- */}
               <div>
                 <label htmlFor="projectName" style={styles.label}>Project Name</label>
                 <input id="projectName" type="text" name="name" value={newProject.name} onChange={handleInputChange} style={styles.input} required />
               </div>
               <div>
                  <label htmlFor="projectDesc" style={styles.label}>Project Description</label>
                 <textarea id="projectDesc" name="description" value={newProject.description} onChange={handleInputChange} style={{...styles.input, minHeight: '80px'}} required />
               </div>
              <div>
                  <label htmlFor="startDate" style={styles.label}>Start Date</label>
                 <input id="startDate" type="date" name="startDate" value={newProject.startDate} onChange={handleInputChange} style={styles.input} required />
               </div>
               <div>
                  <label htmlFor="endDate" style={styles.label}>End Date</label>
                 <input id="endDate" type="date" name="endDate" value={newProject.endDate} onChange={handleInputChange} style={styles.input} required />
               </div>

              {/* Manager Select Dropdown */}
              <div>
                <label htmlFor="managerSelect" style={styles.label}>Assign Manager:</label>
                <select
                  id="managerSelect" value={selectedManager} onChange={handleManagerChange}
                  style={styles.select} required disabled={loadingManagers}
                >
                  <option value="" disabled={managers.length > 0}>
                     {loadingManagers ? 'Loading...' : (managers.length > 0 ? 'Select a Manager' : 'No managers found')}
                  </option>
                  {managers.map(manager => (
                      <option key={manager._id} value={manager._id}> {manager.name} </option>
                    ))
                  }
                </select>
              </div>

              <button type="submit" style={styles.button}>Create Project</button>
            </form>
          </div>
        </div>

        {/* --- Main Content Column (Projects & Inquiries) --- */}
        <div style={styles.mainContentColumn}>
            {/* Project List Section */}
            <div style={styles.projectListContainer}>
              <h3 style={styles.projectListTitle}>All Projects</h3>
              <div style={styles.projectList}>
                 {projects.length > 0 ? (
                    projects.map(project => (
                        <div
                            key={project._id} style={styles.projectItem}
                            onMouseEnter={(e) => e.currentTarget.style = {...styles.projectItem, ...styles.projectItemHover} }
                            onMouseLeave={(e) => e.currentTarget.style = styles.projectItem }
                        >
                            <h4 style={styles.projectName}>{project.name}</h4>
                            <p style={{color: '#4a5568', marginBottom: '0.5rem'}}>{project.description}</p>
                            <p style={styles.projectMeta}>Manager: {project.manager?.name || 'N/A'}</p>
                            <p style={styles.projectMeta}>Status: {project.status}</p>
                            <Link to={`/project/${project._id}`} style={styles.link}>View Details & Chat →</Link>
                        </div>
                    ))
                 ) : <p>No projects found. Create one to get started.</p>}
              </div>
            </div>

            {/* Inquiries Section */}
             <div style={styles.inquiriesContainer}>
                <h3 style={styles.inquiriesTitle}>Client Inquiries</h3>
                {loadingInquiries ? <p>Loading inquiries...</p> : (
                    inquiries.length > 0 ? (
                        <div style={{overflowX: 'auto'}}> 
                            <table style={styles.inquiryTable}>
                                <thead>
                                    <tr>
                                        <th style={{...styles.tableHeader, width: '30%'}}>Client</th>
                                        <th style={{...styles.tableHeader, width: '30%'}}>Offering Type</th>
                                        <th style={{...styles.tableHeader, width: '25%'}}>Submitted</th>
                                        <th style={{...styles.tableHeader, width: '15%'}}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inquiries.map(inq => (
                                        <tr key={inq._id} style={styles.tableRow}>
                                            <td style={styles.tableCell}>{inq.client?.name || 'N/A'} ({inq.client?.email || 'N/A'})</td>
                                            <td style={styles.tableCell}>{inq.offeringType}</td>
                                            <td style={styles.tableCell}>{formatDateTime(inq.createdAt)}</td>
                                            <td style={styles.tableCell}>
                                                <select
                                                    value={inq.status}
                                                    onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                                                    style={styles.statusSelect}
                                                >
                                                    <option value="New">New</option>
                                                    <option value="Viewed">Viewed</option>
                                                    <option value="Contacted">Contacted</option>
                                                    <option value="Project Created">Project Created</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No new inquiries found.</p>
                    )
                )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

