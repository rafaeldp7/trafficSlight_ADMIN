// User service for user management
import { apiService } from './apiService';

export const userService = {
  // Get all users
  async getUsers(page = 1, limit = 20, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      return await apiService.get(`/auth/users?${params}`);
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  // Get user by ID
  async getUser(id) {
    try {
      return await apiService.get(`/auth/users/${id}`);
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },

  // Create user
  async createUser(userData) {
    try {
      return await apiService.post('/auth/users', userData);
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(id, userData) {
    try {
      return await apiService.put(`/auth/users/${id}`, userData);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  // Delete user
  async deleteUser(id) {
    try {
      return await apiService.delete(`/auth/users/${id}`);
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  // Get user count
  async getUserCount() {
    try {
      return await apiService.get('/auth/user-count');
    } catch (error) {
      console.error('Get user count error:', error);
      throw error;
    }
  },

  // Get user growth
  async getUserGrowth() {
    try {
      return await apiService.get('/auth/user-growth');
    } catch (error) {
      console.error('Get user growth error:', error);
      throw error;
    }
  },

  // Get new users this month
  async getNewUsersThisMonth() {
    try {
      return await apiService.get('/auth/new-users-this-month');
    } catch (error) {
      console.error('Get new users this month error:', error);
      throw error;
    }
  },

  // Get first user name
  async getFirstUserName() {
    try {
      return await apiService.get('/auth/first-user-name');
    } catch (error) {
      console.error('Get first user name error:', error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(id) {
    try {
      return await apiService.get(`/auth/users/${id}/profile`);
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(id, profileData) {
    try {
      return await apiService.put(`/auth/users/${id}/profile`, profileData);
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  },

  // Get user statistics
  async getUserStatistics(id) {
    try {
      return await apiService.get(`/auth/users/${id}/statistics`);
    } catch (error) {
      console.error('Get user statistics error:', error);
      throw error;
    }
  },

  // Get user activity
  async getUserActivity(id, page = 1, limit = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      return await apiService.get(`/auth/users/${id}/activity?${params}`);
    } catch (error) {
      console.error('Get user activity error:', error);
      throw error;
    }
  },

  // Get user trips
  async getUserTrips(id, page = 1, limit = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      return await apiService.get(`/auth/users/${id}/trips?${params}`);
    } catch (error) {
      console.error('Get user trips error:', error);
      throw error;
    }
  },

  // Get user reports
  async getUserReports(id, page = 1, limit = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      return await apiService.get(`/auth/users/${id}/reports?${params}`);
    } catch (error) {
      console.error('Get user reports error:', error);
      throw error;
    }
  },

  // Get user motors
  async getUserMotors(id, page = 1, limit = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      return await apiService.get(`/auth/users/${id}/motors?${params}`);
    } catch (error) {
      console.error('Get user motors error:', error);
      throw error;
    }
  },

  // Activate user
  async activateUser(id) {
    try {
      return await apiService.put(`/auth/users/${id}/activate`);
    } catch (error) {
      console.error('Activate user error:', error);
      throw error;
    }
  },

  // Deactivate user
  async deactivateUser(id) {
    try {
      return await apiService.put(`/auth/users/${id}/deactivate`);
    } catch (error) {
      console.error('Deactivate user error:', error);
      throw error;
    }
  },

  // Suspend user
  async suspendUser(id, reason) {
    try {
      return await apiService.put(`/auth/users/${id}/suspend`, { reason });
    } catch (error) {
      console.error('Suspend user error:', error);
      throw error;
    }
  },

  // Unsuspend user
  async unsuspendUser(id) {
    try {
      return await apiService.put(`/auth/users/${id}/unsuspend`);
    } catch (error) {
      console.error('Unsuspend user error:', error);
      throw error;
    }
  },

  // Get user roles
  async getUserRoles(id) {
    try {
      return await apiService.get(`/auth/users/${id}/roles`);
    } catch (error) {
      console.error('Get user roles error:', error);
      throw error;
    }
  },

  // Update user roles
  async updateUserRoles(id, roles) {
    try {
      return await apiService.put(`/auth/users/${id}/roles`, { roles });
    } catch (error) {
      console.error('Update user roles error:', error);
      throw error;
    }
  },

  // Get user permissions
  async getUserPermissions(id) {
    try {
      return await apiService.get(`/auth/users/${id}/permissions`);
    } catch (error) {
      console.error('Get user permissions error:', error);
      throw error;
    }
  },

  // Update user permissions
  async updateUserPermissions(id, permissions) {
    try {
      return await apiService.put(`/auth/users/${id}/permissions`, { permissions });
    } catch (error) {
      console.error('Update user permissions error:', error);
      throw error;
    }
  }
};
