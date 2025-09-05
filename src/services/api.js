import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  logout: () => api.post('/api/auth/logout'),
  getProfile: () => api.get('/api/auth/profile'),
};

// Post APIs
export const postAPI = {
  createPost: (formData) => api.post('/api/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAllPosts: () => api.get('/api/posts'),
  getUserPosts: (userId) => api.get(`/api/posts/user/${userId}`),
  likePost: (postId) => api.put(`/api/posts/${postId}/like`),
  deletePost: (postId) => api.delete(`/api/posts/${postId}`),
};

// Image/Caption APIs
export const captionAPI = {
  generateCaption: (formData) => api.post('/api/caption', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default api;
