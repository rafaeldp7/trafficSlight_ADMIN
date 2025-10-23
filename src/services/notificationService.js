// Notification service for notification management
import { apiService } from './apiService';

export const notificationService = {
  // Get all notifications
  async getNotifications(page = 1, limit = 20, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      return await apiService.get(`/notifications?${params}`);
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  },

  // Get notification by ID
  async getNotification(id) {
    try {
      return await apiService.get(`/notifications/${id}`);
    } catch (error) {
      console.error('Get notification error:', error);
      throw error;
    }
  },

  // Create notification
  async createNotification(notification) {
    try {
      return await apiService.post('/notifications', notification);
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  },

  // Update notification
  async updateNotification(id, notification) {
    try {
      return await apiService.put(`/notifications/${id}`, notification);
    } catch (error) {
      console.error('Update notification error:', error);
      throw error;
    }
  },

  // Delete notification
  async deleteNotification(id) {
    try {
      return await apiService.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  },

  // Mark notification as read
  async markAsRead(id) {
    try {
      return await apiService.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  },

  // Mark notification as unread
  async markAsUnread(id) {
    try {
      return await apiService.put(`/notifications/${id}/unread`);
    } catch (error) {
      console.error('Mark notification as unread error:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      return await apiService.put('/notifications/mark-all-read');
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  },

  // Mark all notifications as unread
  async markAllAsUnread() {
    try {
      return await apiService.put('/notifications/mark-all-unread');
    } catch (error) {
      console.error('Mark all notifications as unread error:', error);
      throw error;
    }
  },

  // Get unread notifications count
  async getUnreadCount() {
    try {
      return await apiService.get('/notifications/unread-count');
    } catch (error) {
      console.error('Get unread notifications count error:', error);
      throw error;
    }
  },

  // Get notification preferences
  async getNotificationPreferences() {
    try {
      return await apiService.get('/notifications/preferences');
    } catch (error) {
      console.error('Get notification preferences error:', error);
      throw error;
    }
  },

  // Update notification preferences
  async updateNotificationPreferences(preferences) {
    try {
      return await apiService.put('/notifications/preferences', preferences);
    } catch (error) {
      console.error('Update notification preferences error:', error);
      throw error;
    }
  },

  // Get notification history
  async getNotificationHistory() {
    try {
      return await apiService.get('/notifications/history');
    } catch (error) {
      console.error('Get notification history error:', error);
      throw error;
    }
  },

  // Clear notification history
  async clearNotificationHistory() {
    try {
      return await apiService.delete('/notifications/history');
    } catch (error) {
      console.error('Clear notification history error:', error);
      throw error;
    }
  },

  // Get notification statistics
  async getNotificationStatistics() {
    try {
      return await apiService.get('/notifications/statistics');
    } catch (error) {
      console.error('Get notification statistics error:', error);
      throw error;
    }
  },

  // Send notification to user
  async sendNotificationToUser(userId, notification) {
    try {
      return await apiService.post(`/notifications/send/${userId}`, notification);
    } catch (error) {
      console.error('Send notification to user error:', error);
      throw error;
    }
  },

  // Send notification to all users
  async sendNotificationToAll(notification) {
    try {
      return await apiService.post('/notifications/send-all', notification);
    } catch (error) {
      console.error('Send notification to all users error:', error);
      throw error;
    }
  },

  // Get notification templates
  async getNotificationTemplates() {
    try {
      return await apiService.get('/notifications/templates');
    } catch (error) {
      console.error('Get notification templates error:', error);
      throw error;
    }
  },

  // Create notification template
  async createNotificationTemplate(template) {
    try {
      return await apiService.post('/notifications/templates', template);
    } catch (error) {
      console.error('Create notification template error:', error);
      throw error;
    }
  },

  // Update notification template
  async updateNotificationTemplate(id, template) {
    try {
      return await apiService.put(`/notifications/templates/${id}`, template);
    } catch (error) {
      console.error('Update notification template error:', error);
      throw error;
    }
  },

  // Delete notification template
  async deleteNotificationTemplate(id) {
    try {
      return await apiService.delete(`/notifications/templates/${id}`);
    } catch (error) {
      console.error('Delete notification template error:', error);
      throw error;
    }
  }
};
