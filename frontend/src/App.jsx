import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// Page Imports - Corrected paths relative to src/
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

// Component Imports - Corrected paths relative to src/
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx'; // Public navbar
import ProtectedLayout from './components/ProtectedLayout.jsx'; // Logged-in layout
import { DirectChatPage } from './components/DirectChat.jsx'; // Import the new page component

// --- Layout for Public Pages ---
const PageLayout = () => {
  const styles = {
    layoutContainer: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f7fafc',
      fontFamily: 'system-ui, sans-serif',
    },
    contentArea: {
      flexGrow: 1,
      display: 'flex',
      width: '100%',
      boxSizing: 'border-box',
    },
  };

  return (
    <div style={styles.layoutContainer}>
      <Navbar />
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
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project/:projectId" element={<ProjectDetails />} />
          <Route path="/offerings" element={<ProjectOfferings />} />
          {/* Direct Chat Route */}
          <Route path="/chat/:recipientId" element={<DirectChatPage />} />
        </Route>
      </Route>

    </Routes>
  );
}

export default App;

