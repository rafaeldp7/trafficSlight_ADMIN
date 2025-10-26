import { useAdminAuth } from 'contexts/AdminAuthContext';

/**
 * Custom hook for role-based permissions
 * Provides easy access to permission checks and role information
 */
export const usePermissions = () => {
  // Safely get admin auth context with fallbacks
  let admin = null;
  let hasPermission = () => false;
  
  try {
    const adminAuth = useAdminAuth();
    admin = adminAuth.admin;
    hasPermission = adminAuth.hasPermission;
  } catch (error) {
    // If AdminAuthProvider is not available, use fallback values
    console.warn('AdminAuthProvider not available, using fallback permissions');
  }

  // Permission checks
  const canRead = hasPermission('canRead');
  const canCreate = hasPermission('canCreate');
  const canUpdate = hasPermission('canUpdate');
  const canDelete = hasPermission('canDelete');

  // Role information
  const userRole = admin?.role?.name || 'viewer';
  const userRoleDisplay = admin?.role?.displayName || admin?.role?.name || 'Viewer';
  const isSuperAdmin = userRole === 'super_admin';
  const isAdmin = userRole === 'admin';
  const isViewer = userRole === 'viewer';

  // Combined permission checks
  const canManage = canCreate || canUpdate || canDelete;
  const canOnlyView = canRead && !canManage;

  // User information
  const userName = admin?.firstName && admin?.lastName 
    ? `${admin.firstName} ${admin.lastName}` 
    : admin?.name || 'Admin';
  
  const userInitials = admin?.firstName?.charAt(0) || admin?.name?.charAt(0) || 'A';

  return {
    // Permission checks
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    canManage,
    canOnlyView,
    
    // Role information
    userRole,
    userRoleDisplay,
    isSuperAdmin,
    isAdmin,
    isViewer,
    
    // User information
    userName,
    userInitials,
    
    // Admin object
    admin,
    
    // Permission helper functions
    hasPermission,
  };
};
