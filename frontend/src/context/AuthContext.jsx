import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { authAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check for both admin and user tokens
      const adminToken = localStorage.getItem('adminToken');
      const userToken = localStorage.getItem('userToken');
      const token = adminToken || userToken;
      
      if (!token) {
        setLoading(false);
        return;
      }

      // Set the token in the API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verify token with backend using /auth/me endpoint
      const response = await api.get('/auth/me');
      if (response.data.data && response.data.data.user) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userToken');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials, isAdmin = false) => {
    try {
      console.log('Attempting login with:', credentials);
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      if (response.data.success && response.data.data) {
        const { token, user } = response.data.data;
        
        // For admin login, check admin role
        if (isAdmin && user.role !== 'admin') {
          return { success: false, error: 'Access denied. Admin privileges required.' };
        }
        
        // Store appropriate token
        if (user.role === 'admin') {
          localStorage.setItem('adminToken', token);
          // Clear user token if exists
          localStorage.removeItem('userToken');
        } else {
          localStorage.setItem('userToken', token);
          // Clear admin token if exists
          localStorage.removeItem('adminToken');
        }
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        
        return { success: true };
      } else {
        return { success: false, error: response.data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Clear any user state on error to prevent unwanted redirects
      setUser(null);
      
      let errorMessage = 'Login failed';
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMessage = 'Server is currently unavailable. Please try again later.';
      } else if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        return { success: true };
      } else {
        return { success: false, error: response.data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed';
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('userToken');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};