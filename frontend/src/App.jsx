import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// ... (keep existing imports for Login, Register, Dashboard, etc.)
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ProjectDetails from './pages/ProjectDetails.jsx';
import Solutions from './pages/Solutions.jsx';
import GeneralContractors from './pages/GeneralContractors.jsx';
import ChatAi from './pages/ChatAi.jsx';
import About from './pages/About.jsx';

// --- NEW IMPORTS ---
import ProjectOfferings from './pages/ProjectOfferings.jsx';
import CategoryDetails from './pages/CategoryDetails.jsx';
import SmartSupportChat from './pages/SmartSupportChat.jsx';
import { DirectChatPage } from './components/DirectChat.jsx'; 

import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedLayout from './components/ProtectedLayout.jsx';

const PageLayout = () => {
  // ... (keep existing PageLayout styles and return)
  const styles = {
    layoutContainer: { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f7fafc', fontFamily: 'system-ui, sans-serif' },
    contentArea: { flexGrow: 1, display: 'flex', width: '100%', boxSizing: 'border-box' },
  };
  return (
    <div style={styles.layoutContainer}>
      <Navbar />
      <main style={styles.contentArea}><Outlet /></main>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route element={<PageLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/solutions/general-contractors" element={<GeneralContractors />} />
        <Route path="/services" element={<Solutions />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<GeneralContractors />} />
        <Route path="/chat-ai" element={<ChatAi />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/project/:projectId" element={<ProjectDetails />} />
          
          {/* --- UPDATED ROUTES FOR OFFERINGS FLOW --- */}
          <Route path="/offerings" element={<ProjectOfferings />} />
          <Route path="/offerings/:category" element={<CategoryDetails />} />
          <Route path="/support-chat" element={<SmartSupportChat />} />
          
          <Route path="/chat/:recipientId" element={<DirectChatPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;