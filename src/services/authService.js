// Authentication service with JWT token management
import { apiService } from './apiService';

export const authService = {
  // Login functionality
  async login(email, password) {
    try {
      const response = await apiService.post('/auth/login', { email, password });
      
      if (response.token) {
        this.setToken(response.token);
        this.setUser(response.user);
        return response;
      }
      
      throw new Error('Login failed');
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  },

  // Register functionality
  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', userData);
      
      if (response.token) {
        this.setToken(response.token);
        this.setUser(response.user);
        return response;
      }
      
      throw new Error('Registration failed');
    } catch (error) {
      console.error('Registration Error:', error);
      throw error;
    }
  },

  // Logout functionality
  async logout() {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout Error:', error);
    } finally {
      this.removeToken();
      this.removeUser();
    }
  },

  // Token management
  getToken() {
    return localStorage.getItem('token');
  },

  setToken(token) {
    localStorage.setItem('token', token);
  },

  removeToken() {
    localStorage.removeItem('token');
  },

  // User management
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  removeUser() {
    localStorage.removeItem('user');
  },

  // Token validation
  async validateToken() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const response = await apiService.get('/auth/verify-token');
      return response.valid;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  },

  // Get user profile
  async getProfile() {
    try {
      return await apiService.get('/auth/profile');
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      return await apiService.put('/auth/profile', profileData);
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      return await apiService.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // Password reset request
  async requestPasswordReset(email) {
    try {
      return await apiService.post('/auth/forgot-password', { email });
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },

  // Reset password
  async resetPassword(token, newPassword) {
    try {
      return await apiService.post('/auth/reset-password', {
        token,
        newPassword
      });
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }
};
