import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
// Page Imports... (ensure all are correct)
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ProjectDetails from './pages/ProjectDetails.jsx';
import Solutions from './pages/Solutions.jsx';
import GeneralContractors from './pages/GeneralContractors.jsx';
import ChatAi from './pages/ChatAi.jsx';
import About from './pages/About.jsx';
import ProjectOfferings from './pages/ProjectOfferings.jsx';
// Component Imports... (ensure all are correct)
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx'; // Public navbar
import ProtectedLayout from './components/ProtectedLayout.jsx'; // Logged-in layout

// --- EDITED: Enhanced PageLayout for Fullscreen Centering ---
const PageLayout = () => {
  const styles = {
    layoutContainer: {
      display: 'flex',
      flexDirection: 'column', // Stack Navbar and content vertically
      minHeight: '100vh',     // Ensure layout takes full viewport height
      backgroundColor: '#f7fafc', // Apply consistent background here
      fontFamily: 'system-ui, sans-serif', // Apply base font here
    },
    contentArea: {
      flexGrow: 1,              // Allow content area to take remaining space
      display: 'flex',          // Use flexbox to center the Outlet content
      // Center based on page type - landing page needs different alignment
      // alignItems: 'center',     // Vertically center (Removed for more flexibility)
      // justifyContent: 'center', // Horizontally center (Removed for more flexibility)
      width: '100%',            // Ensure it uses full width
      boxSizing: 'border-box',
    },
  };

  return (
    <div style={styles.layoutContainer}>
      <Navbar />
      {/* Content area takes remaining space */}
      <main style={styles.contentArea}> 
        <Outlet /> {/* Renders the specific public page */}
      </main>
    </div>
  );
};


function App() {
  return (
    <Routes>
      {/* --- Public Routes --- */}
      {/* Routes now render inside the enhanced PageLayout */}
      <Route element={<PageLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/solutions/general-contractors" element={<GeneralContractors />} />
        <Route path="/services" element={<Solutions />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<GeneralContractors />} /> {/* Placeholder */}
        <Route path="/chat-ai" element={<ChatAi />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* --- Protected Routes --- */}
      {/* Protected routes use ProtectedLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project/:projectId" element={<ProjectDetails />} />
          <Route path="/offerings" element={<ProjectOfferings />} />
        </Route>
      </Route>

    </Routes>
  );
}

export default App;

