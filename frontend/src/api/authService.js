import axios from 'axios';

// The base URL for your backend API
const API_URL = 'http://localhost:5000/api/auth/';

const register = (name, email, password) => {
  return axios.post(API_URL + 'register', { name, email, password });
};

const login = (email, password) => {
  return axios.post(API_URL + 'login', { email, password });
};

export default {
  register,
  login,
};
