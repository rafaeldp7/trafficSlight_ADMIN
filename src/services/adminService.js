// Admin service for comprehensive admin management
// Aligned with backend AdminController endpoints
import { apiService } from './apiService';

export const adminService = {
  // Get all admins
  async getAdmins(page = 1, limit = 20, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      return await apiService.get(`/admin-management/admins?${params}`);
    } catch (error) {
      console.error('Get admins error:', error);
      throw error;
    }
  },

  // Get admin by ID
  async getAdmin(id) {
    try {
      return await apiService.get(`/admin-management/admins/${id}`);
    } catch (error) {
      console.error('Get admin error:', error);
      throw error;
    }
  },

  // Create admin
  async createAdmin(adminData) {
    try {
      return await apiService.post('/admin-management/admins', adminData);
    } catch (error) {
      console.error('Create admin error:', error);
      throw error;
    }
  },


  // Update admin
  async updateAdmin(id, adminData) {
    try {
      return await apiService.put(`/admin-management/admins/${id}`, adminData);
    } catch (error) {
      console.error('Update admin error:', error);
      throw error;
    }
  },

  // Delete admin
  async deleteAdmin(id) {
    try {
      return await apiService.delete(`/admin-management/admins/${id}`);
    } catch (error) {
      console.error('Delete admin error:', error);
      throw error;
    }
  },

  // Update admin role
  async updateAdminRole(id, roleId) {
    try {
      return await apiService.put(`/admin-management/admins/${id}/role`, { roleId });
    } catch (error) {
      console.error('Update admin role error:', error);
      throw error;
    }
  },

  // Deactivate admin
  async deactivateAdmin(id) {
    try {
      return await apiService.put(`/admin-management/admins/${id}/deactivate`);
    } catch (error) {
      console.error('Deactivate admin error:', error);
      throw error;
    }
  },

  // Activate admin
  async activateAdmin(id) {
    try {
      return await apiService.put(`/admin-management/admins/${id}/activate`);
    } catch (error) {
      console.error('Activate admin error:', error);
      throw error;
    }
  },

  // Get admin roles
  async getAdminRoles() {
    try {
      return await apiService.get('/admin-management/admin-roles');
    } catch (error) {
      console.error('Get admin roles error:', error);
      throw error;
    }
  },

  // Create admin role
  async createAdminRole(roleData) {
    try {
      return await apiService.post('/admin-management/admin-roles', roleData);
    } catch (error) {
      console.error('Create admin role error:', error);
      throw error;
    }
  },

  // Update admin role
  async updateAdminRole(roleId, roleData) {
    try {
      return await apiService.put(`/admin-management/admin-roles/${roleId}`, roleData);
    } catch (error) {
      console.error('Update admin role error:', error);
      throw error;
    }
  },

  // Delete admin role
  async deleteAdminRole(roleId) {
    try {
      return await apiService.delete(`/admin-management/admin-roles/${roleId}`);
    } catch (error) {
      console.error('Delete admin role error:', error);
      throw error;
    }
  },

  // Get admin logs
  async getAdminLogs(page = 1, limit = 20, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      return await apiService.get(`/admin-management/admin-logs?${params}`);
    } catch (error) {
      console.error('Get admin logs error:', error);
      throw error;
    }
  },

  // Get my admin logs
  async getMyAdminLogs(page = 1, limit = 20, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      return await apiService.get(`/admin-management/my-admin-logs?${params}`);
    } catch (error) {
      console.error('Get my admin logs error:', error);
      throw error;
    }
  },

  // Get admin statistics
  async getAdminStatistics() {
    try {
      return await apiService.get('/admin-management/statistics');
    } catch (error) {
      console.error('Get admin statistics error:', error);
      throw error;
    }
  },

  // Get admin activity
  async getAdminActivity(adminId, page = 1, limit = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      return await apiService.get(`/admin-management/admins/${adminId}/activity?${params}`);
    } catch (error) {
      console.error('Get admin activity error:', error);
      throw error;
    }
  },

  // Get admin permissions
  async getAdminPermissions(adminId) {
    try {
      return await apiService.get(`/admin-management/admins/${adminId}/permissions`);
    } catch (error) {
      console.error('Get admin permissions error:', error);
      throw error;
    }
  },

  // Update admin permissions
  async updateAdminPermissions(adminId, permissions) {
    try {
      return await apiService.put(`/admin-management/admins/${adminId}/permissions`, { permissions });
    } catch (error) {
      console.error('Update admin permissions error:', error);
      throw error;
    }
  },

  // Get admin sessions
  async getAdminSessions(adminId) {
    try {
      return await apiService.get(`/admin-management/admins/${adminId}/sessions`);
    } catch (error) {
      console.error('Get admin sessions error:', error);
      throw error;
    }
  },

  // Terminate admin session
  async terminateAdminSession(adminId, sessionId) {
    try {
      return await apiService.delete(`/admin-management/admins/${adminId}/sessions/${sessionId}`);
    } catch (error) {
      console.error('Terminate admin session error:', error);
      throw error;
    }
  },

  // Get admin audit trail
  async getAdminAuditTrail(adminId, page = 1, limit = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      return await apiService.get(`/admin-management/admins/${adminId}/audit-trail?${params}`);
    } catch (error) {
      console.error('Get admin audit trail error:', error);
      throw error;
    }
  },

  // Export admin data
  async exportAdminData(format = 'csv', filters = {}) {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      });
      
      const response = await fetch(`${apiService.baseURL}/admin-management/export?${params}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin-data.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename: `admin-data.${format}` };
    } catch (error) {
      console.error('Export admin data error:', error);
      throw error;
    }
  },

  // Get admin dashboard
  async getAdminDashboard() {
    try {
      return await apiService.get('/admin-management/dashboard');
    } catch (error) {
      console.error('Get admin dashboard error:', error);
      throw error;
    }
  },

  // Get admin notifications
  async getAdminNotifications() {
    try {
      return await apiService.get('/admin-management/notifications');
    } catch (error) {
      console.error('Get admin notifications error:', error);
      throw error;
    }
  },

  // Mark admin notification as read
  async markAdminNotificationAsRead(notificationId) {
    try {
      return await apiService.put(`/admin-management/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Mark admin notification as read error:', error);
      throw error;
    }
  }
};
