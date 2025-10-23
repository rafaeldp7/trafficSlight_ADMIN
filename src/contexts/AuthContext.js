// Authentication context for JWT token management
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is already authenticated
      if (authService.isAuthenticated()) {
        const token = authService.getToken();
        const userData = authService.getUser();
        
        // Validate token with backend
        const isValid = await authService.validateToken();
        
        if (isValid) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear auth data
          authService.removeToken();
          authService.removeUser();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setError('Failed to initialize authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login(email, password);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.register(userData);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await authService.logout();
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.updateProfile(profileData);
      
      setUser(response.user);
      
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error.message || 'Profile update failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.changePassword(currentPassword, newPassword);
      
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      setError(error.message || 'Password change failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.requestPasswordReset(email);
      
      return response;
    } catch (error) {
      console.error('Password reset request error:', error);
      setError(error.message || 'Password reset request failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.resetPassword(token, newPassword);
      
      return response;
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message || 'Password reset failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const refreshUser = async () => {
    try {
      if (isAuthenticated) {
        const userData = await authService.getProfile();
        setUser(userData);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails, user might be logged out
      if (error.message.includes('Unauthorized')) {
        logout();
      }
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    clearError,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
