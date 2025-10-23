// Admin Authentication Context
// Aligned with backend AdminAuthController and Admin model structure

import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAuthService } from '../services/adminAuthService';

export const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if admin is already authenticated
      if (adminAuthService.isAuthenticated()) {
        const response = await adminAuthService.verifyToken();
        
        if (response.success) {
          setAdmin(response.data.admin);
          setIsAuthenticated(true);
        } else {
          // Token is invalid, clear auth data
          adminAuthService.removeToken();
        }
      }
    } catch (error) {
      console.error('Admin auth initialization error:', error);
      setError('Failed to initialize authentication');
      adminAuthService.removeToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminAuthService.login(email, password);
      
      if (response.success) {
        setAdmin(response.data.admin);
        setIsAuthenticated(true);
        return { success: true, data: response.data };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Login failed. Please try again.');
      return { success: false, error: 'Login failed. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      await adminAuthService.logout();
      
      setAdmin(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      console.error('Admin logout error:', error);
      setError('Logout failed');
      // Clear state even if logout fails
      setAdmin(null);
      setIsAuthenticated(false);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminAuthService.updateProfile(profileData);
      
      if (response.success) {
        setAdmin(response.data.admin);
        return { success: true, data: response.data };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Update admin profile error:', error);
      setError('Profile update failed');
      return { success: false, error: 'Profile update failed' };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminAuthService.changePassword(currentPassword, newPassword);
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Change admin password error:', error);
      setError('Password change failed');
      return { success: false, error: 'Password change failed' };
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminAuthService.getProfile();
      
      if (response.success) {
        setAdmin(response.data.admin);
        return { success: true, data: response.data };
      } else {
        setError(response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Get admin profile error:', error);
      setError('Failed to get profile');
      return { success: false, error: 'Failed to get profile' };
    } finally {
      setLoading(false);
    }
  };

  const refreshAdmin = async () => {
    try {
      if (isAuthenticated) {
        const response = await getProfile();
        if (!response.success) {
          // If refresh fails, admin might be logged out
          logout();
        }
      }
    } catch (error) {
      console.error('Refresh admin error:', error);
      logout();
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Permission checking methods
  const hasPermission = (permission) => {
    if (!admin || !admin.role || !admin.role.permissions) {
      return false;
    }
    return admin.role.permissions[permission] === true;
  };

  const canCreate = () => hasPermission('canCreate');
  const canRead = () => hasPermission('canRead');
  const canUpdate = () => hasPermission('canUpdate');
  const canDelete = () => hasPermission('canDelete');
  const canManageAdmins = () => hasPermission('canManageAdmins');
  const canAssignRoles = () => hasPermission('canAssignRoles');
  const canManageUsers = () => hasPermission('canManageUsers');
  const canManageReports = () => hasPermission('canManageReports');
  const canManageTrips = () => hasPermission('canManageTrips');
  const canManageGasStations = () => hasPermission('canManageGasStations');
  const canViewAnalytics = () => hasPermission('canViewAnalytics');
  const canExportData = () => hasPermission('canExportData');
  const canManageSettings = () => hasPermission('canManageSettings');

  const value = {
    // State
    admin,
    loading,
    isAuthenticated,
    error,
    
    // Actions
    login,
    logout,
    updateProfile,
    changePassword,
    getProfile,
    refreshAdmin,
    clearError,
    
    // Permissions
    hasPermission,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canManageAdmins,
    canAssignRoles,
    canManageUsers,
    canManageReports,
    canManageTrips,
    canManageGasStations,
    canViewAnalytics,
    canExportData,
    canManageSettings
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
