// Environment Configuration
// Centralized environment variable management

const ENV_CONFIG = {
  // Backend Configuration
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL || 'https://ts-backend-1-jyit.onrender.com/api',
  
  // Google Maps Configuration
  GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyAzFeqvqzZUO9kfLVZZOrlOwP5Fg4LpLf4',
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // API Configuration
  API_TIMEOUT: 30000, // 30 seconds
  API_RETRY_ATTEMPTS: 3,
  API_RETRY_DELAY: 1000, // 1 second
  
  // Polling Configuration
  POLLING_INTERVAL: 10000, // 10 seconds
  
  // Feature Flags
  FEATURES: {
    ENABLE_GOOGLE_MAPS: true,
    ENABLE_REAL_TIME_UPDATES: true,
    ENABLE_ANALYTICS: true,
    ENABLE_NOTIFICATIONS: true,
  },
  
  // Debug Configuration
  DEBUG: {
    ENABLE_CONSOLE_LOGS: process.env.NODE_ENV === 'development',
    ENABLE_API_LOGGING: process.env.NODE_ENV === 'development',
    ENABLE_ERROR_BOUNDARY: true,
  },
};

export default ENV_CONFIG;
