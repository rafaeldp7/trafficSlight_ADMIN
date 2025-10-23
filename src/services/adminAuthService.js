// Admin Authentication Service
// Aligned with backend AdminAuthController endpoints

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ts-backend-1-jyit.onrender.com/api';

class AdminAuthService {
  getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // POST /api/admin-auth/login
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Store admin token and data
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  // POST /api/admin-auth/logout
  async logout() {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        return { success: true };
      }

      const response = await fetch(`${API_BASE_URL}/admin-auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      // Clear local storage regardless of response
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      
      return { success: true, data };
    } catch (error) {
      console.error('Admin logout error:', error);
      // Clear local storage even if logout fails
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      return { success: true };
    }
  }

  // GET /api/admin-auth/profile
  async getProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-auth/profile`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Failed to get profile' };
      }
    } catch (error) {
      console.error('Get admin profile error:', error);
      return { success: false, error: 'Failed to get profile' };
    }
  }

  // PUT /api/admin-auth/profile
  async updateProfile(profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-auth/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update stored admin data
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Profile update failed' };
      }
    } catch (error) {
      console.error('Update admin profile error:', error);
      return { success: false, error: 'Profile update failed' };
    }
  }

  // PUT /api/admin-auth/change-password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-auth/change-password`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Password change failed' };
      }
    } catch (error) {
      console.error('Change admin password error:', error);
      return { success: false, error: 'Password change failed' };
    }
  }

  // GET /api/admin-auth/verify-token
  async verifyToken() {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      const response = await fetch(`${API_BASE_URL}/admin-auth/verify-token`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        // Token is invalid, clear storage
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        return { success: false, error: 'Token verification failed' };
      }
    } catch (error) {
      console.error('Verify admin token error:', error);
      // Clear storage on error
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      return { success: false, error: 'Token verification failed' };
    }
  }

  // Helper methods
  isAuthenticated() {
    const token = localStorage.getItem('adminToken');
    return !!token;
  }

  getToken() {
    return localStorage.getItem('adminToken');
  }

  getAdmin() {
    const adminData = localStorage.getItem('adminData');
    return adminData ? JSON.parse(adminData) : null;
  }

  removeToken() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
  }
}

export const adminAuthService = new AdminAuthService();
