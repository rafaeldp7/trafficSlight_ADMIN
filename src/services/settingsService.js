// Settings service for system configuration
import { apiService } from './apiService';

export const settingsService = {
  // Get all settings
  async getSettings() {
    try {
      return await apiService.get('/settings');
    } catch (error) {
      console.error('Get settings error:', error);
      throw error;
    }
  },

  // Update settings
  async updateSettings(settings) {
    try {
      return await apiService.put('/settings', settings);
    } catch (error) {
      console.error('Update settings error:', error);
      throw error;
    }
  },

  // Get theme settings
  async getThemeSettings() {
    try {
      return await apiService.get('/settings/theme');
    } catch (error) {
      console.error('Get theme settings error:', error);
      throw error;
    }
  },

  // Update theme settings
  async updateThemeSettings(theme) {
    try {
      return await apiService.put('/settings/theme', theme);
    } catch (error) {
      console.error('Update theme settings error:', error);
      throw error;
    }
  },

  // Get notification settings
  async getNotificationSettings() {
    try {
      return await apiService.get('/settings/notifications');
    } catch (error) {
      console.error('Get notification settings error:', error);
      throw error;
    }
  },

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      return await apiService.put('/settings/notifications', settings);
    } catch (error) {
      console.error('Update notification settings error:', error);
      throw error;
    }
  },

  // Get privacy settings
  async getPrivacySettings() {
    try {
      return await apiService.get('/settings/privacy');
    } catch (error) {
      console.error('Get privacy settings error:', error);
      throw error;
    }
  },

  // Update privacy settings
  async updatePrivacySettings(settings) {
    try {
      return await apiService.put('/settings/privacy', settings);
    } catch (error) {
      console.error('Update privacy settings error:', error);
      throw error;
    }
  },

  // Get system configuration
  async getSystemConfiguration() {
    try {
      return await apiService.get('/settings/system');
    } catch (error) {
      console.error('Get system configuration error:', error);
      throw error;
    }
  },

  // Update system configuration
  async updateSystemConfiguration(config) {
    try {
      return await apiService.put('/settings/system', config);
    } catch (error) {
      console.error('Update system configuration error:', error);
      throw error;
    }
  },

  // Get user preferences
  async getUserPreferences() {
    try {
      return await apiService.get('/settings/user-preferences');
    } catch (error) {
      console.error('Get user preferences error:', error);
      throw error;
    }
  },

  // Update user preferences
  async updateUserPreferences(preferences) {
    try {
      return await apiService.put('/settings/user-preferences', preferences);
    } catch (error) {
      console.error('Update user preferences error:', error);
      throw error;
    }
  },

  // Reset settings to default
  async resetSettingsToDefault() {
    try {
      return await apiService.post('/settings/reset');
    } catch (error) {
      console.error('Reset settings error:', error);
      throw error;
    }
  },

  // Export settings
  async exportSettings() {
    try {
      const response = await fetch(`${apiService.baseURL}/settings/export`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'settings.json';
      a.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename: 'settings.json' };
    } catch (error) {
      console.error('Export settings error:', error);
      throw error;
    }
  },

  // Import settings
  async importSettings(file) {
    try {
      const formData = new FormData();
      formData.append('settings', file);
      
      return await apiService.post('/settings/import', formData);
    } catch (error) {
      console.error('Import settings error:', error);
      throw error;
    }
  },

  // Get settings history
  async getSettingsHistory() {
    try {
      return await apiService.get('/settings/history');
    } catch (error) {
      console.error('Get settings history error:', error);
      throw error;
    }
  },

  // Restore settings from history
  async restoreSettingsFromHistory(historyId) {
    try {
      return await apiService.post(`/settings/restore/${historyId}`);
    } catch (error) {
      console.error('Restore settings error:', error);
      throw error;
    }
  }
};
