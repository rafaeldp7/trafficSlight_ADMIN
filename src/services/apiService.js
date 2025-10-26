// Base API service with comprehensive error handling
import API_CONFIG from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Get authentication token
  getAuthToken() {
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
  }

  // Get headers with authentication
  getHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Generic API call method with error handling
  async request(endpoint, options = {}) {
    const config = {
      headers: {
        ...this.getHeaders(),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          // Handle unauthorized - redirect to login
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          throw new Error('Unauthorized access');
        }
        
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          url: response.url
        });
        throw new Error(errorData.message || errorData.error || `API Error: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint);
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  // Authentication methods
  async login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  async adminLogin(email, password) {
    return this.post('/auth/admin/login', { email, password });
  }

  async register(userData) {
    return this.post('/auth/register', userData);
  }

  async getProfile() {
    return this.get('/auth/profile');
  }

  async updateProfile(profileData) {
    return this.put('/auth/profile', profileData);
  }

  async changePassword(currentPassword, newPassword) {
    return this.put('/auth/change-password', { currentPassword, newPassword });
  }

  async logout() {
    return this.post('/auth/logout');
  }

  // Reports methods
  async getReports(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/reports${queryString ? `?${queryString}` : ''}`);
  }

  async getReport(id) {
    return this.get(`/reports/${id}`);
  }

  async createReport(reportData) {
    return this.post('/reports', reportData);
  }

  async updateReport(id, reportData) {
    return this.put(`/reports/${id}`, reportData);
  }

  async deleteReport(id) {
    return this.delete(`/reports/${id}`);
  }

  async verifyReport(id, notes) {
    return this.put(`/reports/${id}/verify`, { notes });
  }

  async resolveReport(id, notes, actions) {
    return this.put(`/reports/${id}/resolve`, { notes, actions });
  }

  async archiveReport(id) {
    return this.put(`/reports/${id}/archive`);
  }

  async addComment(id, content) {
    return this.post(`/reports/${id}/comments`, { content });
  }

  async getReportsByLocation(lat, lng, radius = 1000) {
    return this.get(`/reports/location?lat=${lat}&lng=${lng}&radius=${radius}`);
  }

  async getReportStats() {
    return this.get('/reports/stats');
  }

  // Trips methods
  async getTrips(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/trips${queryString ? `?${queryString}` : ''}`);
  }

  async getTrip(id) {
    return this.get(`/trips/${id}`);
  }

  async createTrip(tripData) {
    return this.post('/trips', tripData);
  }

  async updateTrip(id, tripData) {
    return this.put(`/trips/${id}`, tripData);
  }

  async deleteTrip(id) {
    return this.delete(`/trips/${id}`);
  }

  async getUserTrips(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/trips/user/${userId}${queryString ? `?${queryString}` : ''}`);
  }

  async getTripsByDateRange(startDate, endDate, userId = null) {
    const params = { startDate, endDate };
    if (userId) params.userId = userId;
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/trips/date-range?${queryString}`);
  }

  async getTripAnalytics(userId = null) {
    const queryString = userId ? `?userId=${userId}` : '';
    return this.get(`/trips/analytics/summary${queryString}`);
  }

  async getMonthlyTripSummary(year, month, userId = null) {
    const params = { year, month };
    if (userId) params.userId = userId;
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/trips/analytics/monthly?${queryString}`);
  }

  async getTopUsersByTripCount(limit = 5) {
    return this.get(`/trips/insights/top-users?limit=${limit}`);
  }

  async getMostUsedMotors(limit = 5) {
    return this.get(`/trips/insights/top-motors?limit=${limit}`);
  }

  async addRoutePoint(tripId, coordinates, speed = null, altitude = null) {
    return this.post(`/trips/${tripId}/route-points`, { coordinates, speed, altitude });
  }

  async addExpense(tripId, type, amount, description = '', location = '') {
    return this.post(`/trips/${tripId}/expenses`, { type, amount, description, location });
  }

  // Gas Stations methods
  async getGasStations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/gas-stations${queryString ? `?${queryString}` : ''}`);
  }

  async getGasStation(id) {
    return this.get(`/gas-stations/${id}`);
  }

  async createGasStation(stationData) {
    return this.post('/gas-stations', stationData);
  }

  async updateGasStation(id, stationData) {
    return this.put(`/gas-stations/${id}`, stationData);
  }

  async deleteGasStation(id) {
    return this.delete(`/gas-stations/${id}`);
  }

  async updateFuelPrices(id, prices) {
    return this.put(`/gas-stations/${id}/fuel-prices`, { prices });
  }

  async addReview(id, rating, comment, categories) {
    return this.post(`/gas-stations/${id}/reviews`, { rating, comment, categories });
  }

  async verifyGasStation(id) {
    return this.put(`/gas-stations/${id}/verify`);
  }

  async getGasStationsByBrand(brand) {
    return this.get(`/gas-stations/brand/${brand}`);
  }

  async getGasStationsByCity(city) {
    return this.get(`/gas-stations/city/${city}`);
  }

  async getGasStationStats() {
    return this.get('/gas-stations/stats');
  }

  async getNearbyGasStations(lat, lng, radius = 5000, limit = 20) {
    return this.get(`/gas-stations/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=${limit}`);
  }

  async archiveGasStation(id) {
    return this.put(`/gas-stations/${id}/archive`);
  }

  async getFuelPriceTrends(stationId, fuelType, days = 30) {
    return this.get(`/gas-stations/${stationId}/price-trends?fuelType=${fuelType}&days=${days}`);
  }

  // Dashboard methods
  async getDashboardOverview() {
    return this.get('/dashboard/overview');
  }

  async getDashboardStats(period = '30d') {
    return this.get(`/dashboard/stats?period=${period}`);
  }

  async getUserDashboard() {
    return this.get('/dashboard/user');
  }

  async getAdminDashboard() {
    return this.get('/dashboard/admin');
  }

  async getAnalytics(type, period = '30d') {
    return this.get(`/dashboard/analytics?type=${type}&period=${period}`);
  }

  // Users methods (Admin only)
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async getUser(id) {
    return this.get(`/users/${id}`);
  }

  async updateUser(id, userData) {
    return this.put(`/users/${id}`, userData);
  }

  async deleteUser(id) {
    return this.delete(`/users/${id}`);
  }

  async getUserStats() {
    return this.get('/users/stats');
  }

  async getUsersByLocation(city, barangay) {
    return this.get(`/users/location?city=${city}&barangay=${barangay}`);
  }

  // Admin methods
  async getAdmins(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.get(`/admin${queryString ? `?${queryString}` : ''}`);
  }

  async getAdmin(id) {
    return this.get(`/admin/${id}`);
  }

  async createAdmin(adminData) {
    return this.post('/admin', adminData);
  }

  async updateAdmin(id, adminData) {
    return this.put(`/admin/${id}`, adminData);
  }

  async deleteAdmin(id) {
    return this.delete(`/admin/${id}`);
  }

  async getAdminRoles() {
    return this.get('/admin/roles');
  }

  async createAdminRole(roleData) {
    return this.post('/admin/roles', roleData);
  }

  async updateAdminRole(id, roleData) {
    return this.put(`/admin/roles/${id}`, roleData);
  }

  async deleteAdminRole(id) {
    return this.delete(`/admin/roles/${id}`);
  }

  async getAdminStats() {
    return this.get('/admin/stats');
  }

  // Auth stats
  async getAuthStats() {
    return this.get('/auth/stats');
  }
}

export const apiService = new ApiService();
