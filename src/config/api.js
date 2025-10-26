// API Configuration
// Centralized configuration for backend API endpoints
import ENV_CONFIG from './environment';

const API_CONFIG = {
  // Backend URL - can be overridden by environment variables
  BASE_URL: ENV_CONFIG.BACKEND_URL,
  
  // API Endpoints - Updated to match backend routes
  ENDPOINTS: {
    // Admin Authentication
    ADMIN_AUTH: {
      REGISTER: '/admin-auth/register',
      LOGIN: '/admin-auth/login',
      ADMIN_LOGIN: '/admin-auth/admin-login',
      LOGOUT: '/admin-auth/logout',
      PROFILE: '/admin-auth/profile',
      CHANGE_PASSWORD: '/admin-auth/change-password',
      VERIFY_TOKEN: '/admin-auth/verify-token',
    },
    
    // Admin Management
    ADMIN_MANAGEMENT: {
      LIST: '/admin-management',
      DETAIL: (id) => `/admin-management/${id}`,
      ROLES: '/admin-management/roles',
      ROLE_DETAIL: (id) => `/admin-management/roles/${id}`,
      STATS: '/admin-management/stats',
    },
    
    // Admin Dashboard
    ADMIN_DASHBOARD: {
      OVERVIEW: '/admin-dashboard/overview',
      STATS: '/admin-dashboard/stats',
      ANALYTICS: '/admin-dashboard/analytics',
    },
    
    // Admin Users
    ADMIN_USERS: {
      LIST: '/admin-users',
      DETAIL: (id) => `/admin-users/${id}`,
      STATS: '/admin-users/stats',
      BY_LOCATION: '/admin-users/location',
    },
    
    // Admin Reports
    ADMIN_REPORTS: {
      LIST: '/admin-reports',
      DETAIL: (id) => `/admin-reports/${id}`,
      VERIFY: (id) => `/admin-reports/${id}/verify`,
      RESOLVE: (id) => `/admin-reports/${id}/resolve`,
      ARCHIVE: (id) => `/admin-reports/${id}/archive`,
      COMMENTS: (id) => `/admin-reports/${id}/comments`,
      BY_LOCATION: '/admin-reports/location',
      STATS: '/admin-reports/stats',
    },
    
    // Admin Trips
    ADMIN_TRIPS: {
      LIST: '/admin-trips',
      DETAIL: (id) => `/admin-trips/${id}`,
      USER_TRIPS: (userId) => `/admin-trips/user/${userId}`,
      DATE_RANGE: '/admin-trips/date-range',
      ANALYTICS: '/admin-trips/analytics/summary',
      MONTHLY: '/admin-trips/analytics/monthly',
      TOP_USERS: '/admin-trips/insights/top-users',
      TOP_MOTORS: '/admin-trips/insights/top-motors',
      ROUTE_POINTS: (id) => `/admin-trips/${id}/route-points`,
      EXPENSES: (id) => `/admin-trips/${id}/expenses`,
    },
    
    // Admin Gas Stations
    ADMIN_GAS_STATIONS: {
      LIST: '/admin-gas-stations',
      DETAIL: (id) => `/admin-gas-stations/${id}`,
      FUEL_PRICES: (id) => `/admin-gas-stations/${id}/fuel-prices`,
      REVIEWS: (id) => `/admin-gas-stations/${id}/reviews`,
      VERIFY: (id) => `/admin-gas-stations/${id}/verify`,
      BY_BRAND: (brand) => `/admin-gas-stations/brand/${brand}`,
      BY_CITY: (city) => `/admin-gas-stations/city/${city}`,
      NEARBY: '/admin-gas-stations/nearby',
      ARCHIVE: (id) => `/admin-gas-stations/${id}/archive`,
      PRICE_TRENDS: (id) => `/admin-gas-stations/${id}/price-trends`,
      STATS: '/admin-gas-stations/stats',
    },
    
    // Public Routes (for backward compatibility)
    PUBLIC: {
      REPORTS: '/reports',
      TRIPS: '/trips',
      GAS_STATIONS: '/gas-stations',
      DASHBOARD: '/dashboard',
    },
  },
  
  // Request Configuration
  REQUEST_CONFIG: {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
  },
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export default API_CONFIG;
