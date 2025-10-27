import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/'; 

// Function to get the auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Axios instance (using this simplifies adding token)
const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((config) => {
  const token = getToken();
  // Defensive check to ensure token is not null/undefined before assigning header
  if (token) { config.headers['x-auth-token'] = token; }
  return config;
}, (error) => Promise.reject(error));


// --- Auth Functions ---
const register = (name, email, password) => {
  return api.post('auth/register', { name, email, password });
};

const login = (email, password) => {
  return api.post('auth/login', { email, password });
};

// --- Inquiry Functions (Simplified to reduce overhead) ---
const submitInquiry = (offeringType) => {
  // Use the established api instance for the POST request
  return api.post('inquiries/', { offeringType }); 
};

// --- Functions to GET Inquiries (used by AdminDashboard) ---
const getInquiries = () => {
  return api.get('inquiries/'); 
};

const updateInquiryStatus = (inquiryId, status) => {
    return api.put(`inquiries/${inquiryId}/status`, { status });
}


export default {
  register,
  login,
  submitInquiry, 
  getInquiries,
  updateInquiryStatus, 
};
