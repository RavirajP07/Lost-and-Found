import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://lost-and-found-api-dfut.onrender.com/api' : '/api');
export const SERVER_URL = API_URL.replace(/\/api\/?$/, '');

const API = axios.create({
  baseURL: API_URL,
});

// Axios Request Interceptor to append Authorization Token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// AuthService endpoints
export const authAPI = {
  sendOtp: (data) => API.post('/auth/send-otp', data),
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  adminLogin: (data) => API.post('/auth/admin/login', data),
  getProfile: () => API.get('/auth/profile'),
};

// ItemService endpoints
export const itemAPI = {
  getItems: (params) => API.get('/items', { params }),
  getItem: (id) => API.get(`/items/${id}`),
  createItem: (formData) => API.post('/items', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateItem: (id, data) => API.put(`/items/${id}`, data),
  deleteItem: (id) => API.delete(`/items/${id}`),
};

// ClaimService endpoints
export const claimAPI = {
  submitClaim: (data) => API.post('/claims', data),
  getClaims: (params) => API.get('/claims', { params }),
  processClaim: (id, status, remarks) => API.put(`/claims/${id}/process`, { status, remarks }),
};

// CategoryService endpoints
export const categoryAPI = {
  getCategories: () => API.get('/categories'),
  createCategory: (data) => API.post('/categories', data),
  updateCategory: (id, data) => API.put(`/categories/${id}`, data),
  deleteCategory: (id) => API.delete(`/categories/${id}`),
};

// NotificationService endpoints
export const notificationAPI = {
  getNotifications: () => API.get('/notifications'),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
};

// AdminService endpoints
export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getLogs: () => API.get('/admin/logs'),
  getUsers: () => API.get('/admin/users'),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
};

export default API;
