import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/'; // Base URL for backend

// Function to get the auth token from localStorage
const getToken = () => localStorage.getItem('token');

// --- Axios instance with auth header (Optional but good practice) ---
// This simplifies adding the token to every request
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


// --- Project Functions ---

// Create a new project (Admin only)
const createProject = (projectData) => {
  return api.post('projects/', projectData); // Use the axios instance
};

// Get projects for the logged-in user (handles Admin, Manager, Client)
const getProjects = () => {
  return api.get('projects/'); // Use the axios instance
};

// --- NEW FUNCTION: Get a specific project by ID ---
const getProjectById = (projectId) => {
  return api.get(`projects/${projectId}`); // Assuming you'll create this backend route later
}

// --- NEW FUNCTION: Get all client users ---
const getClients = () => {
  // Calls the new route we added in userRoutes.js
  return api.get('users/clients'); 
};

// --- NEW FUNCTION: Add a team member to a project ---
const addTeamMember = (projectId, userId) => {
  // Calls the PUT route we added in projects.js
  return api.put(`projects/${projectId}/team/${userId}`); 
};

export default {
  createProject,
  getProjects,
  getProjectById, // Export the new function
  getClients,     // Export the new function
  addTeamMember,  // Export the new function
};

