// Geography service for geographic data and analytics
import { apiService } from './apiService';

export const geographyService = {
  // Get all geography data
  async getGeographyData() {
    try {
      return await apiService.get('/geography');
    } catch (error) {
      console.error('Get geography data error:', error);
      throw error;
    }
  },

  // Get barangay data
  async getBarangayData(barangay) {
    try {
      return await apiService.get(`/geography/barangay/${barangay}`);
    } catch (error) {
      console.error('Get barangay data error:', error);
      throw error;
    }
  },

  // Get geography statistics
  async getStatistics() {
    try {
      return await apiService.get('/geography/statistics');
    } catch (error) {
      console.error('Get geography statistics error:', error);
      throw error;
    }
  },

  // Get user distribution by location
  async getUserDistribution() {
    try {
      return await apiService.get('/geography/user-distribution');
    } catch (error) {
      console.error('Get user distribution error:', error);
      throw error;
    }
  },

  // Get trip analytics by location
  async getTripAnalyticsByLocation() {
    try {
      return await apiService.get('/geography/trip-analytics');
    } catch (error) {
      console.error('Get trip analytics by location error:', error);
      throw error;
    }
  },

  // Get traffic hotspots
  async getTrafficHotspots() {
    try {
      return await apiService.get('/geography/traffic-hotspots');
    } catch (error) {
      console.error('Get traffic hotspots error:', error);
      throw error;
    }
  },

  // Get gas station distribution
  async getGasStationDistribution() {
    try {
      return await apiService.get('/geography/gas-station-distribution');
    } catch (error) {
      console.error('Get gas station distribution error:', error);
      throw error;
    }
  },

  // Get city statistics
  async getCityStatistics() {
    try {
      return await apiService.get('/geography/city-statistics');
    } catch (error) {
      console.error('Get city statistics error:', error);
      throw error;
    }
  },

  // Get province statistics
  async getProvinceStatistics() {
    try {
      return await apiService.get('/geography/province-statistics');
    } catch (error) {
      console.error('Get province statistics error:', error);
      throw error;
    }
  },

  // Get region statistics
  async getRegionStatistics() {
    try {
      return await apiService.get('/geography/region-statistics');
    } catch (error) {
      console.error('Get region statistics error:', error);
      throw error;
    }
  },

  // Get geographic trends
  async getGeographicTrends(period = '30d') {
    try {
      return await apiService.get(`/geography/trends?period=${period}`);
    } catch (error) {
      console.error('Get geographic trends error:', error);
      throw error;
    }
  },

  // Get location-based analytics
  async getLocationAnalytics(location, radius = 10) {
    try {
      return await apiService.get(`/geography/location-analytics?location=${location}&radius=${radius}`);
    } catch (error) {
      console.error('Get location analytics error:', error);
      throw error;
    }
  },

  // Get map data for visualization
  async getMapData() {
    try {
      return await apiService.get('/geography/map-data');
    } catch (error) {
      console.error('Get map data error:', error);
      throw error;
    }
  },

  // Get geographic export data
  async exportGeographicData(format = 'csv', filters = {}) {
    try {
      const params = new URLSearchParams({
        format,
        ...filters
      });
      
      const response = await fetch(`${apiService.baseURL}/geography/export?${params}`, {
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
      a.download = `geographic-data.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename: `geographic-data.${format}` };
    } catch (error) {
      console.error('Export geographic data error:', error);
      throw error;
    }
  }
};
