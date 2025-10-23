// Analytics service for comprehensive analytics
import { apiService } from './apiService';

export const analyticsService = {
  // Get general analytics
  async getGeneralAnalytics(period = '30d') {
    try {
      return await apiService.get(`/analytics/general?period=${period}`);
    } catch (error) {
      console.error('Get general analytics error:', error);
      throw error;
    }
  },

  // Get daily analytics
  async getDailyAnalytics(date) {
    try {
      return await apiService.get(`/analytics/daily?date=${date}`);
    } catch (error) {
      console.error('Get daily analytics error:', error);
      throw error;
    }
  },

  // Get fuel statistics
  async getFuelStatistics(period = '30d') {
    try {
      return await apiService.get(`/analytics/fuel-stats?period=${period}`);
    } catch (error) {
      console.error('Get fuel statistics error:', error);
      throw error;
    }
  },

  // Get leaderboard analytics
  async getLeaderboardAnalytics(period = '30d') {
    try {
      return await apiService.get(`/analytics/leaderboard?period=${period}`);
    } catch (error) {
      console.error('Get leaderboard analytics error:', error);
      throw error;
    }
  },

  // Get user analytics
  async getUserAnalytics(userId, period = '30d') {
    try {
      return await apiService.get(`/analytics/user/${userId}?period=${period}`);
    } catch (error) {
      console.error('Get user analytics error:', error);
      throw error;
    }
  },

  // Get trip analytics
  async getTripAnalytics(period = '30d') {
    try {
      return await apiService.get(`/analytics/trips?period=${period}`);
    } catch (error) {
      console.error('Get trip analytics error:', error);
      throw error;
    }
  },

  // Get report analytics
  async getReportAnalytics(period = '30d') {
    try {
      return await apiService.get(`/analytics/reports?period=${period}`);
    } catch (error) {
      console.error('Get report analytics error:', error);
      throw error;
    }
  },

  // Get gas station analytics
  async getGasStationAnalytics(period = '30d') {
    try {
      return await apiService.get(`/analytics/gas-stations?period=${period}`);
    } catch (error) {
      console.error('Get gas station analytics error:', error);
      throw error;
    }
  },

  // Get motorcycle analytics
  async getMotorcycleAnalytics(period = '30d') {
    try {
      return await apiService.get(`/analytics/motorcycles?period=${period}`);
    } catch (error) {
      console.error('Get motorcycle analytics error:', error);
      throw error;
    }
  },

  // Get geographic analytics
  async getGeographicAnalytics(period = '30d') {
    try {
      return await apiService.get(`/analytics/geographic?period=${period}`);
    } catch (error) {
      console.error('Get geographic analytics error:', error);
      throw error;
    }
  },

  // Get performance analytics
  async getPerformanceAnalytics(period = '30d') {
    try {
      return await apiService.get(`/analytics/performance?period=${period}`);
    } catch (error) {
      console.error('Get performance analytics error:', error);
      throw error;
    }
  },

  // Get efficiency analytics
  async getEfficiencyAnalytics(period = '30d') {
    try {
      return await apiService.get(`/analytics/efficiency?period=${period}`);
    } catch (error) {
      console.error('Get efficiency analytics error:', error);
      throw error;
    }
  },

  // Get safety analytics
  async getSafetyAnalytics(period = '30d') {
    try {
      return await apiService.get(`/analytics/safety?period=${period}`);
    } catch (error) {
      console.error('Get safety analytics error:', error);
      throw error;
    }
  },

  // Get trend analytics
  async getTrendAnalytics(period = '30d') {
    try {
      return await apiService.get(`/analytics/trends?period=${period}`);
    } catch (error) {
      console.error('Get trend analytics error:', error);
      throw error;
    }
  },

  // Get comparative analytics
  async getComparativeAnalytics(period = '30d') {
    try {
      return await apiService.get(`/analytics/comparative?period=${period}`);
    } catch (error) {
      console.error('Get comparative analytics error:', error);
      throw error;
    }
  },

  // Get predictive analytics
  async getPredictiveAnalytics(period = '30d') {
    try {
      return await apiService.get(`/analytics/predictive?period=${period}`);
    } catch (error) {
      console.error('Get predictive analytics error:', error);
      throw error;
    }
  },

  // Get real-time analytics
  async getRealTimeAnalytics() {
    try {
      return await apiService.get('/analytics/real-time');
    } catch (error) {
      console.error('Get real-time analytics error:', error);
      throw error;
    }
  },

  // Get analytics summary
  async getAnalyticsSummary(period = '30d') {
    try {
      return await apiService.get(`/analytics/summary?period=${period}`);
    } catch (error) {
      console.error('Get analytics summary error:', error);
      throw error;
    }
  },

  // Get analytics insights
  async getAnalyticsInsights(period = '30d') {
    try {
      return await apiService.get(`/analytics/insights?period=${period}`);
    } catch (error) {
      console.error('Get analytics insights error:', error);
      throw error;
    }
  },

  // Get analytics recommendations
  async getAnalyticsRecommendations(userId) {
    try {
      return await apiService.get(`/analytics/recommendations/${userId}`);
    } catch (error) {
      console.error('Get analytics recommendations error:', error);
      throw error;
    }
  },

  // Export analytics
  async exportAnalytics(format = 'csv', period = '30d', type = 'general') {
    try {
      const params = new URLSearchParams({
        format,
        period,
        type
      });
      
      const response = await fetch(`${apiService.baseURL}/analytics/export?${params}`, {
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
      a.download = `analytics-${type}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename: `analytics-${type}.${format}` };
    } catch (error) {
      console.error('Export analytics error:', error);
      throw error;
    }
  }
};
