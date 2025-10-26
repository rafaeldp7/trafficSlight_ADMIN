// Admin Authentication Context
// Aligned with backend AdminAuthController and Admin model structure

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

  const login = useCallback(async (email, password) => {
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
  }, []);

  const logout = useCallback(async () => {
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
  }, []);

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

  const refreshAdmin = useCallback(async () => {
    try {
      if (isAuthenticated) {
        const response = await getProfile();
        if (!response.success) {
          // If refresh fails, admin might be logged out
          // Don't call logout() here to prevent infinite loops
          setAdmin(null);
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Refresh admin error:', error);
      // Don't call logout() here to prevent infinite loops
      setAdmin(null);
      setIsAuthenticated(false);
    }
  }, [isAuthenticated]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Permission checking methods
  const hasPermission = useCallback((permission) => {
    if (!admin || !admin.role) {
      return false;
    }

    // If role has permissions object, use it
    if (admin.role.permissions && admin.role.permissions[permission] !== undefined) {
      return admin.role.permissions[permission] === true;
    }

    // Otherwise, determine permissions based on role name and level
    const roleName = admin.role.name || admin.role;
    const roleLevel = admin.role.level || 0;
    
    // Super Admin (Level 100) - Full system access
    if (roleName === 'super_admin' || roleLevel >= 100) {
      return true;
    }
    
    // Admin (Level 50) - Standard administrative access
    if (roleName === 'admin' || roleLevel >= 50) {
      // Admin can do most things except manage other admins and system settings
      return permission !== 'canManageAdmins' && 
             permission !== 'canAssignRoles' && 
             permission !== 'canManageSettings';
    }
    
    // Moderator (Level 25) - Content moderation access
    if (roleName === 'moderator' || roleLevel >= 25) {
      // Moderator can only read and limited update
      return permission === 'canRead' || 
             (permission === 'canUpdate' && 
              (permission === 'canManageReports' || permission === 'canManageTrips'));
    }
    
    return false;
  }, [admin]);

  const canCreate = useCallback(() => hasPermission('canCreate'), [hasPermission]);
  const canRead = useCallback(() => hasPermission('canRead'), [hasPermission]);
  const canUpdate = useCallback(() => hasPermission('canUpdate'), [hasPermission]);
  const canDelete = useCallback(() => hasPermission('canDelete'), [hasPermission]);
  const canManageAdmins = useCallback(() => hasPermission('canManageAdmins'), [hasPermission]);
  const canAssignRoles = useCallback(() => hasPermission('canAssignRoles'), [hasPermission]);
  const canManageUsers = useCallback(() => hasPermission('canManageUsers'), [hasPermission]);
  const canManageReports = useCallback(() => hasPermission('canManageReports'), [hasPermission]);
  const canManageTrips = useCallback(() => hasPermission('canManageTrips'), [hasPermission]);
  const canManageGasStations = useCallback(() => hasPermission('canManageGasStations'), [hasPermission]);
  const canViewAnalytics = useCallback(() => hasPermission('canViewAnalytics'), [hasPermission]);
  const canExportData = useCallback(() => hasPermission('canExportData'), [hasPermission]);
  const canManageSettings = useCallback(() => hasPermission('canManageSettings'), [hasPermission]);

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
