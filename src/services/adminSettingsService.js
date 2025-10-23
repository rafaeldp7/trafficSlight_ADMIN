// Admin Settings Service
// Aligned with backend AdminSettingsController endpoints

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ts-backend-1-jyit.onrender.com/api';

class AdminSettingsService {
  getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // GET /api/admin-settings/dashboard-settings
  async getDashboardSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-settings/dashboard-settings`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Failed to get dashboard settings' };
      }
    } catch (error) {
      console.error('Get dashboard settings error:', error);
      return { success: false, error: 'Failed to get dashboard settings' };
    }
  }

  // PUT /api/admin-settings/dashboard-settings
  async updateDashboardSettings(settings) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-settings/dashboard-settings`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Failed to update dashboard settings' };
      }
    } catch (error) {
      console.error('Update dashboard settings error:', error);
      return { success: false, error: 'Failed to update dashboard settings' };
    }
  }

  // GET /api/admin-settings/system-stats
  async getSystemStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-settings/system-stats`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Failed to get system stats' };
      }
    } catch (error) {
      console.error('Get system stats error:', error);
      return { success: false, error: 'Failed to get system stats' };
    }
  }

  // GET /api/admin-settings/activity-summary
  async getActivitySummary(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/admin-settings/activity-summary?${queryString}`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Failed to get activity summary' };
      }
    } catch (error) {
      console.error('Get activity summary error:', error);
      return { success: false, error: 'Failed to get activity summary' };
    }
  }

  // PUT /api/admin-settings/reset-password/:adminId
  async resetAdminPassword(adminId, newPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-settings/reset-password/${adminId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ newPassword })
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Failed to reset admin password' };
      }
    } catch (error) {
      console.error('Reset admin password error:', error);
      return { success: false, error: 'Failed to reset admin password' };
    }
  }

  // Additional helper methods for admin settings
  async getAdminDashboard() {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        this.getSystemStats(),
        this.getActivitySummary({ period: '7d' })
      ]);

      return {
        success: true,
        data: {
          systemStats: statsResponse.success ? statsResponse.data : null,
          activitySummary: activityResponse.success ? activityResponse.data : null
        }
      };
    } catch (error) {
      console.error('Get admin dashboard error:', error);
      return { success: false, error: 'Failed to get admin dashboard' };
    }
  }

  async getAdminNotifications() {
    try {
      const response = await fetch(`${this.baseURL}/admin-settings/notifications`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.data || { notifications: [] }
      };
    } catch (error) {
      console.error('Get admin notifications error:', error);
      return { success: false, error: 'Failed to get admin notifications' };
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const response = await fetch(`${this.baseURL}/admin-settings/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return { success: true, data: data.data || { id: notificationId } };
    } catch (error) {
      console.error('Mark notification as read error:', error);
      return { success: false, error: 'Failed to mark notification as read' };
    }
  }
}

export const adminSettingsService = new AdminSettingsService();
