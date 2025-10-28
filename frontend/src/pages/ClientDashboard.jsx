import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// CORRECTED Import Paths: Changed from ../api/ to ./../api/
import projectService from './../api/projectService.js';
import authService from './../api/authService.js'; // Needed for submitting inquiries and fetching conversations
import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]

// --- HELPER FUNCTIONS ---
const formatDate = (dateString) => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  if (!dateString) return 'N/A'; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  const options = { year: 'numeric', month: 'long', day: 'numeric' }; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  return new Date(dateString).toLocaleDateString(undefined, options); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
};
// --- NEW: Format date/time for conversations ---
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getStatusColor = (status) => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  switch (status) {
    case 'Completed': return { backgroundColor: '#d1fae5', color: '#065f46' }; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    case 'In Progress': return { backgroundColor: '#dbeafe', color: '#1e40af' }; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    case 'On Hold': return { backgroundColor: '#fee2e2', color: '#991b1b' }; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    default: return { backgroundColor: '#f0b900', color: '#1a202c' }; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  }
};

// --- OFFERINGS DATA ---
const offerings = [ // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  { price: '₹20 Lakh Range', description: 'A standard, high-quality residential home...', type: 'Standard Residential' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  { price: '₹50 Lakh Range', description: 'A premium, spacious home featuring luxury fittings...', type: 'Premium Residential' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  { price: '₹1 Crore & Above', description: 'Fully customized luxury villas or commercial buildings...', type: 'Custom Luxury/Commercial' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
];

// --- STYLES OBJECT ---
const styles = { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  contentWrapper: { width: '100%', fontFamily: 'system-ui, sans-serif' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  welcomeMessage: { fontSize: '1.2rem', color: '#4a5568' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  title: { fontSize: '2rem', fontWeight: 'bold', color: '#1a202c' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  // --- NEW: Styles for view toggle buttons ---
  viewToggleContainer: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  toggleButton: { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    padding: '0.7rem 1.5rem',
    border: '1px solid #cbd5e0',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#4a5568',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  activeToggleButton: { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    backgroundColor: '#1a202c',
    color: 'white',
    borderColor: '#1a202c',
  },
  // Project List Styles
  projectListContainer: { marginTop: '2rem' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  projectsHeader: { fontSize: '1.5rem', fontWeight: '600', color: '#1a202c', marginBottom: '1rem' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  summaryContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  summaryCard: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  summaryValue: { fontSize: '2.5rem', fontWeight: 'bold' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  summaryLabel: { fontSize: '1rem', color: '#6b7280' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  projectList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginTop: '1rem' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  projectItem: { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  projectName: { fontSize: '1.5rem', fontWeight: '600', color: '#1a202c', marginBottom: '0.5rem' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  projectStatus: { display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '600' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  projectDetails: { marginTop: '1rem', fontSize: '0.9rem', color: '#4a5568' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  link: { display: 'inline-block', marginTop: '1.5rem', fontWeight: 'bold', color: '#1a202c', textDecoration: 'none' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  // Offerings View Styles
  offeringsHeader: { textAlign: 'center', marginBottom: '3rem' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  offeringsTitle: { fontSize: '2.5rem', fontWeight: 'bold', color: '#1a202c' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  offeringGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  offeringCard: { backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s, box-shadow 0.2s' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  offeringPrice: { fontSize: '2rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1rem' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  offeringDescription: { color: '#4a5568', marginBottom: '2rem', flexGrow: 1 }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  inquireButton: { backgroundColor: '#f0b900', color: '#1a202c', padding: '1rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block', border: 'none', cursor: 'pointer'}, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  // Styles for feedback message
   feedbackMessage: { marginTop: '2rem', padding: '1rem', borderRadius: '8px', textAlign: 'center', fontWeight: '500', maxWidth: '800px', margin: '2rem auto 0 auto' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
   successMessage: { backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
   errorMessage: { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
   buttonDisabled: { backgroundColor: '#e2e8f0', color: '#9ca3af', cursor: 'not-allowed' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  // No Projects Message Style
  noProjectsContainer: { textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  noProjectsTitle: { fontSize: '1.8rem', fontWeight: '600', marginBottom: '1rem' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  noProjectsText: { color: '#4a5568', marginBottom: '2rem' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  browseButton: { backgroundColor: '#f0b900', color: '#1a202c', padding: '1rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', border:'none', cursor:'pointer' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  // --- NEW: Styles for Conversations ---
  conversationsContainer: { marginTop: '2rem' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  conversationsHeader: { fontSize: '1.5rem', fontWeight: '600', color: '#1a202c', marginBottom: '1rem' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  conversationList: { listStyle: 'none', padding: 0, margin: 0 }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  conversationItem: { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '1rem 1.5rem',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'background-color 0.2s',
  },
  conversationInfo: {}, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  conversationParticipant: { fontWeight: 'bold', color: '#1a202c' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  conversationTime: { fontSize: '0.85rem', color: '#6b7280', marginTop: '0.2rem' }, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  chatLink: { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    backgroundColor: '#f0b900',
    color: '#1a202c',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
};

// --- START OF COMPONENT ---
const ClientDashboard = ({ user }) => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  const [projects, setProjects] = useState([]); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  const [conversations, setConversations] = useState([]); // NEW: State for conversations // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  const [loadingConversations, setLoadingConversations] = useState(true); // NEW: Loading state // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  const [currentView, setCurrentView] = useState('projects'); // Default to projects // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  const [feedback, setFeedback] = useState({ message: '', type: '' }); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  const [submittingInquiry, setSubmittingInquiry] = useState(null); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]

  useEffect(() => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    let isMounted = true; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    // Fetch projects when component mounts
    const fetchProjects = async () => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
      try { const res = await projectService.getProjects(); if (isMounted) setProjects(res.data); } // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
      catch (error) { console.error('Failed fetch projects:', error); } // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    };
    // NEW: Fetch conversations
    const fetchConversations = async () => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
        setLoadingConversations(true); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
        try {
            const res = await authService.getConversations(); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
            if (isMounted) setConversations(res.data); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
        } catch (error) {
            console.error('Failed to fetch conversations:', error); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
            // Optionally show an error message to the user
        } finally {
            if (isMounted) setLoadingConversations(false); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
        }
    };

    fetchProjects(); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    fetchConversations(); // NEW: Call fetch conversations // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]

    // Set up WebSocket listener for project creation
    socket.on('project_created', (newProject) => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
      const isUserInTeam = newProject.team.some(member => member._id === user.id); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
      if (isUserInTeam && isMounted) setProjects((prev) => [newProject, ...prev]); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    });
    // NEW: Listen for conversation updates (e.g., new message might update 'updatedAt')
    // Note: You might need a specific backend event if you want real-time updates for *new* conversations being created.
    // This example assumes existing conversations might get re-ordered based on activity.
    socket.on('receive_dm', (message) => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
        // Refetch conversations when a new DM arrives to update the order/timestamp
        fetchConversations(); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    });

    // Clean up listener on unmount
    return () => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
        isMounted = false; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
        socket.off('project_created'); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
        socket.off('receive_dm'); // NEW: Cleanup DM listener // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    };
  }, [user.id]); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]

  // Handler for submitting inquiry
  const handleInquiry = async (offeringType) => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    setSubmittingInquiry(offeringType); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    setFeedback({ message: '', type: '' }); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    try {
      const response = await authService.submitInquiry(offeringType); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
      setFeedback({ message: response.data.msg || 'Inquiry sent!', type: 'success' }); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    } catch (error) {
      console.error("Inquiry submission error:", error); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
      setFeedback({ message: error.response?.data?.msg || 'Failed to send inquiry.', type: 'error' }); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    } finally {
      setSubmittingInquiry(null); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    }
  };

  // Calculate project summaries
  const activeProjects = projects.filter(p => p.status === 'In Progress').length; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  const completedProjects = projects.filter(p => p.status === 'Completed').length; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  const totalProjects = projects.length; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]

  // Helper to find the other participant in a conversation
  const getOtherParticipant = (convo) => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
      if (!user || !convo || !convo.participants) return null; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
      return convo.participants.find(p => p._id !== user.id); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
  }

  return ( // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
    <div style={styles.contentWrapper}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Client Dashboard</h1>
          <p style={styles.welcomeMessage}>Welcome, {user.name}!</p>
        </div>
        {/* REMOVED the single toggle button */}
      </div>

      {/* NEW: View Toggle Buttons */}
      <div style={styles.viewToggleContainer}> 
          <button 
              onClick={() => setCurrentView('projects')}
              style={currentView === 'projects' ? {...styles.toggleButton, ...styles.activeToggleButton} : styles.toggleButton}
          > 
              My Projects
          </button>
          <button 
              onClick={() => setCurrentView('conversations')}
              style={currentView === 'conversations' ? {...styles.toggleButton, ...styles.activeToggleButton} : styles.toggleButton}
          > 
              My Conversations
          </button>
          <button 
              onClick={() => setCurrentView('offerings')}
              style={currentView === 'offerings' ? {...styles.toggleButton, ...styles.activeToggleButton} : styles.toggleButton}
          > 
              Browse Offerings
          </button>
      </div>

      {/* Display Feedback Message */}
      {feedback.message && ( // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
          <div style={{...styles.feedbackMessage, ...(feedback.type === 'success' ? styles.successMessage : styles.errorMessage)}}>
              {feedback.message}
          </div>
      )}

      {/* --- Conditional Rendering Based on currentView --- */}

      {currentView === 'projects' && ( // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
        // --- Show Assigned Projects View ---
        <div style={styles.projectListContainer}>
          {projects.length > 0 ? ( // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
             <> {/* Project summary and list */}
               <div style={styles.summaryContainer}>
                 <div style={styles.summaryCard}><div style={styles.summaryValue}>{totalProjects}</div><div style={styles.summaryLabel}>Total</div></div>
                 <div style={styles.summaryCard}><div style={styles.summaryValue}>{activeProjects}</div><div style={styles.summaryLabel}>Active</div></div>
                 <div style={styles.summaryCard}><div style={styles.summaryValue}>{completedProjects}</div><div style={styles.summaryLabel}>Completed</div></div>
              </div>
              <h3 style={styles.projectsHeader}>Your Assigned Projects</h3>
              <div style={styles.projectList}>
                {projects.map(project => ( // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
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
          ) : ( // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
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

      {currentView === 'conversations' && ( // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
          // --- NEW: Show Conversations View ---
          <div style={styles.conversationsContainer}> 
              <h3 style={styles.conversationsHeader}>Your Conversations</h3> 
              {loadingConversations ? ( 
                  <p>Loading conversations...</p> 
              ) : conversations.length > 0 ? ( 
                  <ul style={styles.conversationList}> 
                      {conversations.map(convo => { 
                          const otherUser = getOtherParticipant(convo); 
                          return otherUser ? ( // Ensure other user exists // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
                              <li key={convo._id} style={styles.conversationItem}> 
                                  <div style={styles.conversationInfo}> 
                                      <div style={styles.conversationParticipant}> 
                                          Chat with {otherUser.name} ({otherUser.role})
                                      </div>
                                      <div style={styles.conversationTime}> 
                                          Last activity: {formatDateTime(convo.updatedAt)}
                                      </div>
                                  </div>
                                  <Link 
                                      to={`/chat/${otherUser._id}`} // Link using the *other* user's ID // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
                                      style={styles.chatLink}
                                  > 
                                      Open Chat
                                  </Link> 
                              </li>
                          ) : null; // Don't render if other participant info is missing // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
                      })}
                  </ul>
              ) : ( 
                  <p>No conversations started yet. An admin can initiate a chat from an inquiry.</p> 
              )}
          </div>
      )}

      {currentView === 'offerings' && ( // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
        // --- Show Project Offerings View ---
        <div>
          <header style={styles.offeringsHeader}>
            <h1 style={styles.offeringsTitle}>Choose Your Construction Plan</h1>
          </header>
          <div style={styles.offeringGrid}>
            {offerings.map((offer, index) => ( // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
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
                  onClick={() => handleInquiry(offer.type)} // Call inquiry handler // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
                  style={{ // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
                      ...styles.inquireButton, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
                      ...(submittingInquiry === offer.type ? styles.buttonDisabled : {}) // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
                  }}
                  disabled={submittingInquiry !== null} // Disable all if one submitting // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]
                >
                  {submittingInquiry === offer.type ? 'Submitting...' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; // --- END OF COMPONENT ---

export default ClientDashboard; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/pages/ClientDashboard.jsx]

