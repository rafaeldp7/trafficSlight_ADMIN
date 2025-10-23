// Export service for data export functionality
import { apiService } from './apiService';

export const exportService = {
  // Export users
  async exportUsers(format = 'csv', filters = {}) {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      });
      
      const response = await fetch(`${apiService.baseURL}/export/users?${params}`, {
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
      a.download = `users.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename: `users.${format}` };
    } catch (error) {
      console.error('Export users error:', error);
      throw error;
    }
  },

  // Export reports
  async exportReports(format = 'csv', filters = {}) {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      });
      
      const response = await fetch(`${apiService.baseURL}/export/reports?${params}`, {
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
      a.download = `reports.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename: `reports.${format}` };
    } catch (error) {
      console.error('Export reports error:', error);
      throw error;
    }
  },

  // Export gas stations
  async exportGasStations(format = 'csv', filters = {}) {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      });
      
      const response = await fetch(`${apiService.baseURL}/export/gas-stations?${params}`, {
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
      a.download = `gas-stations.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename: `gas-stations.${format}` };
    } catch (error) {
      console.error('Export gas stations error:', error);
      throw error;
    }
  },

  // Export trips
  async exportTrips(format = 'csv', filters = {}) {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      });
      
      const response = await fetch(`${apiService.baseURL}/export/trips?${params}`, {
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
      a.download = `trips.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename: `trips.${format}` };
    } catch (error) {
      console.error('Export trips error:', error);
      throw error;
    }
  },

  // Export motorcycles
  async exportMotorcycles(format = 'csv', filters = {}) {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      });
      
      const response = await fetch(`${apiService.baseURL}/export/motorcycles?${params}`, {
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
      a.download = `motorcycles.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename: `motorcycles.${format}` };
    } catch (error) {
      console.error('Export motorcycles error:', error);
      throw error;
    }
  },

  // Export user motors
  async exportUserMotors(format = 'csv', filters = {}) {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      });
      
      const response = await fetch(`${apiService.baseURL}/export/user-motors?${params}`, {
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
      a.download = `user-motors.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename: `user-motors.${format}` };
    } catch (error) {
      console.error('Export user motors error:', error);
      throw error;
    }
  },

  // Bulk export multiple entities
  async bulkExport(entities, format = 'csv', filters = {}) {
    try {
      const params = new URLSearchParams({
        entities: entities.join(','),
        format,
        ...filters
      });
      
      const response = await fetch(`${apiService.baseURL}/export/bulk?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Bulk export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulk-export.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename: `bulk-export.${format}` };
    } catch (error) {
      console.error('Bulk export error:', error);
      throw error;
    }
  },

  // Get export history
  async getExportHistory() {
    try {
      return await apiService.get('/export/history');
    } catch (error) {
      console.error('Get export history error:', error);
      throw error;
    }
  },

  // Download export file
  async downloadExportFile(exportId) {
    try {
      const response = await fetch(`${apiService.baseURL}/export/download/${exportId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${exportId}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Download export file error:', error);
      throw error;
    }
  }
};
