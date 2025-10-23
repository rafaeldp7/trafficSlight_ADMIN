// Trip service for trip management
import { apiService } from './apiService';

export const tripService = {
  // Get all trips
  async getTrips(page = 1, limit = 20, filters = {}) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      return await apiService.get(`/trips?${params}`);
    } catch (error) {
      console.error('Get trips error:', error);
      throw error;
    }
  },

  // Get trip by ID
  async getTrip(id) {
    try {
      return await apiService.get(`/trips/${id}`);
    } catch (error) {
      console.error('Get trip error:', error);
      throw error;
    }
  },

  // Create trip
  async createTrip(tripData) {
    try {
      return await apiService.post('/trips', tripData);
    } catch (error) {
      console.error('Create trip error:', error);
      throw error;
    }
  },

  // Update trip
  async updateTrip(id, tripData) {
    try {
      return await apiService.put(`/trips/${id}`, tripData);
    } catch (error) {
      console.error('Update trip error:', error);
      throw error;
    }
  },

  // Delete trip
  async deleteTrip(id) {
    try {
      return await apiService.delete(`/trips/${id}`);
    } catch (error) {
      console.error('Delete trip error:', error);
      throw error;
    }
  },

  // Get trip count
  async getTripCount() {
    try {
      return await apiService.get('/trips/count');
    } catch (error) {
      console.error('Get trip count error:', error);
      throw error;
    }
  },

  // Get trip analytics
  async getTripAnalytics(period = '30d') {
    try {
      return await apiService.get(`/trips/analytics?period=${period}`);
    } catch (error) {
      console.error('Get trip analytics error:', error);
      throw error;
    }
  },

  // Get trip statistics
  async getTripStatistics() {
    try {
      return await apiService.get('/trips/statistics');
    } catch (error) {
      console.error('Get trip statistics error:', error);
      throw error;
    }
  },

  // Get monthly trip stats
  async getMonthlyTripStats() {
    try {
      return await apiService.get('/trips/monthly-stats');
    } catch (error) {
      console.error('Get monthly trip stats error:', error);
      throw error;
    }
  },

  // Get overall trip stats
  async getOverallTripStats() {
    try {
      return await apiService.get('/trips/overall-stats');
    } catch (error) {
      console.error('Get overall trip stats error:', error);
      throw error;
    }
  },

  // Get trips by user
  async getTripsByUser(userId, page = 1, limit = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      return await apiService.get(`/trips/user/${userId}?${params}`);
    } catch (error) {
      console.error('Get trips by user error:', error);
      throw error;
    }
  },

  // Get trip details
  async getTripDetails(id) {
    try {
      return await apiService.get(`/trips/${id}/details`);
    } catch (error) {
      console.error('Get trip details error:', error);
      throw error;
    }
  },

  // Get trip route
  async getTripRoute(id) {
    try {
      return await apiService.get(`/trips/${id}/route`);
    } catch (error) {
      console.error('Get trip route error:', error);
      throw error;
    }
  },

  // Get trip fuel data
  async getTripFuelData(id) {
    try {
      return await apiService.get(`/trips/${id}/fuel`);
    } catch (error) {
      console.error('Get trip fuel data error:', error);
      throw error;
    }
  },

  // Get trip performance
  async getTripPerformance(id) {
    try {
      return await apiService.get(`/trips/${id}/performance`);
    } catch (error) {
      console.error('Get trip performance error:', error);
      throw error;
    }
  },

  // Get trip safety score
  async getTripSafetyScore(id) {
    try {
      return await apiService.get(`/trips/${id}/safety-score`);
    } catch (error) {
      console.error('Get trip safety score error:', error);
      throw error;
    }
  },

  // Get trip efficiency
  async getTripEfficiency(id) {
    try {
      return await apiService.get(`/trips/${id}/efficiency`);
    } catch (error) {
      console.error('Get trip efficiency error:', error);
      throw error;
    }
  },

  // Get trip trends
  async getTripTrends(period = '30d') {
    try {
      return await apiService.get(`/trips/trends?period=${period}`);
    } catch (error) {
      console.error('Get trip trends error:', error);
      throw error;
    }
  },

  // Get trip leaderboard
  async getTripLeaderboard(period = '30d') {
    try {
      return await apiService.get(`/trips/leaderboard?period=${period}`);
    } catch (error) {
      console.error('Get trip leaderboard error:', error);
      throw error;
    }
  },

  // Get trip recommendations
  async getTripRecommendations(userId) {
    try {
      return await apiService.get(`/trips/recommendations/${userId}`);
    } catch (error) {
      console.error('Get trip recommendations error:', error);
      throw error;
    }
  },

  // Get trip insights
  async getTripInsights(userId) {
    try {
      return await apiService.get(`/trips/insights/${userId}`);
    } catch (error) {
      console.error('Get trip insights error:', error);
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
      
      const response = await fetch(`${apiService.baseURL}/trips/export?${params}`, {
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
  }
};
