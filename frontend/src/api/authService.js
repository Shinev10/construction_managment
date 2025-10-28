import axios from 'axios'; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]

const API_BASE_URL = 'http://localhost:5000/api/'; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]

// Function to get the auth token from localStorage
const getToken = () => localStorage.getItem('token'); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]

// Axios instance (using this simplifies adding token)
const api = axios.create({ baseURL: API_BASE_URL }); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
api.interceptors.request.use((config) => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
  const token = getToken(); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
  // Defensive check to ensure token is not null/undefined before assigning header
  if (token) { config.headers['x-auth-token'] = token; } // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
  return config; // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
}, (error) => Promise.reject(error));


// --- Auth Functions ---
const register = (name, email, password) => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
  return api.post('auth/register', { name, email, password }); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
};

const login = (email, password) => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
  return api.post('auth/login', { email, password }); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
};

// --- Inquiry Functions (Simplified to reduce overhead) ---
const submitInquiry = (offeringType) => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
  // Use the established api instance for the POST request
  return api.post('inquiries/', { offeringType }); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
};

// --- Functions to GET Inquiries (used by AdminDashboard) ---
const getInquiries = () => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
  return api.get('inquiries/'); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
};

const updateInquiryStatus = (inquiryId, status) => { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
    return api.put(`inquiries/${inquiryId}/status`, { status }); // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
}

// --- NEW: Chat/Conversation Functions ---
const getConversations = () => {
    // Calls the GET /api/chat/conversations endpoint
    return api.get('chat/conversations');
};


export default { // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
  register, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
  login, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
  submitInquiry, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
  getInquiries, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
  updateInquiryStatus, // [cite: uploaded:shinev10/construction_managment/construction_managment-bb03423c5646cb45e0f1d17b7a57e9983bc82509/frontend/src/api/authService.js]
  getConversations, // Export the new function
};
