import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/';

// Function to get the auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Axios instance
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
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

// --- Inquiry Functions ---
const submitInquiry = (offeringType) => {
  return api.post('inquiries/', { offeringType });
};

// --- Functions to GET Inquiries (used by AdminDashboard) ---
const getInquiries = () => {
  return api.get('inquiries/'); 
};

const updateInquiryStatus = (inquiryId, status) => {
    return api.put(`inquiries/${inquiryId}/status`, { status });
}

// --- Chat/Conversation Functions ---
const getConversations = () => {
    return api.get('chat/conversations');
};

// Function to initialize chat 
// UPDATED: Now accepts targetUserId to support Admin -> Client connections
const startChat = (targetUserId = null) => {
    return api.post('chat/start', { userId: targetUserId });
};

// --- NEW: Function to fetch past messages ---
const getChatHistory = (conversationId) => {
    return api.get(`chat/${conversationId}/messages`);
};

export default {
  register,
  login,
  submitInquiry,
  getInquiries,
  updateInquiryStatus,
  getConversations,
  startChat, 
  getChatHistory, // <--- Export this!
};