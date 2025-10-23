// Protected Admin Route Component
// Provides permission-based access control for admin routes

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

const ProtectedAdminRoute = ({ children, requiredPermission = null }) => {
  const { isAuthenticated, loading, admin, hasPermission } = useAdminAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
      >
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
        p={3}
      >
        <Alert severity="error" sx={{ mb: 2, maxWidth: 500 }}>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography>
            You don't have permission to access this page. Required permission: {requiredPermission}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Contact your administrator if you believe this is an error.
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Render children if all checks pass
  return children;
};

export default ProtectedAdminRoute;
