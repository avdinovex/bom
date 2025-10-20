import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  verifyRegistrationOTP: async (data) => {
    const response = await api.post('/auth/verify-registration-otp', data);
    return response.data;
  },
  
  resendOTP: async (data) => {
    const response = await api.post('/auth/resend-otp', data);
    return response.data;
  },
  
  forgotPassword: async (data) => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },
  
  verifyForgotPasswordOTP: async (data) => {
    const response = await api.post('/auth/verify-forgot-password-otp', data);
    return response.data;
  },
  
  resetPassword: async (data) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
  
  activate: async (id) => {
    const response = await api.post(`/admin/users/${id}/activate`);
    return response.data;
  },
  
  deactivate: async (id) => {
    const response = await api.post(`/admin/users/${id}/deactivate`);
    return response.data;
  },
};

// Rides API
export const ridesAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/rides', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/admin/rides/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/admin/rides', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/admin/rides/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/admin/rides/${id}`);
    return response.data;
  },
};

// Completed Rides API
export const completedRidesAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/completed-rides', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/admin/completed-rides/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/admin/completed-rides', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/admin/completed-rides/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/admin/completed-rides/${id}`);
    return response.data;
  },
};

// Events API
export const eventsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/events', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/admin/events/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/admin/events', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/admin/events/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/admin/events/${id}`);
    return response.data;
  },
};

// Blogs API
export const blogsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/blogs', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/admin/blogs/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/admin/blogs', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/admin/blogs/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/admin/blogs/${id}`);
    return response.data;
  },
  
  publish: async (id) => {
    const response = await api.post(`/admin/blogs/${id}/publish`);
    return response.data;
  },
};

// Team API
export const teamAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/team', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/admin/team/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/admin/team', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/admin/team/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/admin/team/${id}`);
    return response.data;
  },
};

// Bookings API
export const bookingsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/bookings', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/admin/bookings/${id}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/admin/bookings/stats/overview');
    return response.data;
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
  
  getRecentActivity: async () => {
    const response = await api.get('/admin/dashboard/recent-activity');
    return response.data;
  },
  
  getPopularRides: async () => {
    const response = await api.get('/admin/dashboard/popular-rides');
    return response.data;
  },
};

// Event Bookings API
export const eventBookingsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/event-bookings', { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/admin/event-bookings/${id}`);
    return response.data;
  },
  
  updateStatus: async (id, data) => {
    const response = await api.put(`/admin/event-bookings/${id}/status`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/admin/event-bookings/${id}`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await api.get('/admin/event-bookings/stats');
    return response.data;
  },
  
  exportCSV: async (params = {}) => {
    const response = await api.get('/admin/event-bookings/export/csv', { 
      params,
      responseType: 'blob'
    });
    return response;
  },
  
  // User event bookings
  getMyBookings: async (params = {}) => {
    const response = await api.get('/event-bookings/my-bookings', { params });
    return response.data;
  },
  
  createOrder: async (data) => {
    const response = await api.post('/event-bookings/create-order', data);
    return response.data;
  },
  
  verifyPayment: async (data) => {
    const response = await api.post('/event-bookings/verify-payment', data);
    return response.data;
  },
  
  cancelBooking: async (id, data) => {
    const response = await api.put(`/event-bookings/${id}/cancel`, data);
    return response.data;
  },
};

// Public Events API (no auth required)
export const publicEventsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },
  
  getByType: async (eventType, params = {}) => {
    const response = await api.get(`/events/type/${eventType}`, { params });
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
  
  getMumbaiManiaLatest: async () => {
    const response = await api.get('/events/mumbai-bikers-mania/latest');
    return response.data;
  },
  
  getMumbaiManiaAll: async () => {
    const response = await api.get('/events/mumbai-bikers-mania/all');
    return response.data;
  },
  
  getDebugAll: async () => {
    const response = await api.get('/events/debug/all');
    return response.data;
  },
  
  createTestEvent: async () => {
    const response = await api.post('/events/debug/create-test');
    return response.data;
  },
  
  fixEventCategories: async () => {
    const response = await api.post('/events/debug/fix-categories');
    return response.data;
  },
  
  getFeatured: async () => {
    const response = await api.get('/events/featured/list');
    return response.data;
  },
  
  getCategories: async () => {
    const response = await api.get('/events/categories/list');
    return response.data;
  },
  
  search: async (params = {}) => {
    const response = await api.get('/events/search', { params });
    return response.data;
  },
};

// Export both default and named export for compatibility
export { api };
export default api;