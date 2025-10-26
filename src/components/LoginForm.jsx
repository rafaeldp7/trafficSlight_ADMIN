import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import { PersonAdd, Login, Security, AdminPanelSettings, Visibility } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setLogin } from "state";
import { useAdminAuth } from "contexts/AdminAuthContext";
import { adminService } from "../services/adminService";

const LoginForm = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { login, isAuthenticated } = useAdminAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user is already authenticated and redirect
  useEffect(() => {
    console.log('🔍 LOGIN FORM - isAuthenticated changed:', {
      isAuthenticated,
      timestamp: new Date().toISOString()
    });
    
    if (isAuthenticated) {
      console.log('🔄 LOGIN FORM - User authenticated, redirecting to overview...');
      // Add a small delay to ensure Redux state is updated
      setTimeout(() => {
        console.log('🔄 LOGIN FORM - Executing redirect after delay...');
        window.location.href = '/overview';
      }, 100);
    }
  }, [isAuthenticated]);

  // Console logging for debugging - only log on significant state changes
  if (isLoading || error) {
    console.log('🔍 LOGIN FORM - Component State:', {
      timestamp: new Date().toISOString(),
      formData,
      isLoading,
      error,
      isAddAccountOpen: false
    });
  }
  
  // Add Account Dialog State
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [accountFormData, setAccountFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    selectedRole: null, // Store the complete role object
  });
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");
  
  // Role fetching state
  const [availableRoles, setAvailableRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [rolesError, setRolesError] = useState("");
  
  // Setup status state
  const [setupNeeded, setSetupNeeded] = useState(null);
  const [isCheckingSetup, setIsCheckingSetup] = useState(false);

  // Console logging for admin account dialog state - only log when dialog is open or has activity
  if (isAddAccountOpen || isCreatingAccount || accountError || accountSuccess) {
    console.log('🔍 ADMIN ACCOUNT DIALOG - State:', {
      timestamp: new Date().toISOString(),
      isAddAccountOpen,
      accountFormData,
      isCreatingAccount,
      accountError,
      accountSuccess
    });
  }

  // Log component mount
  useEffect(() => {
    console.log('🚀 LOGIN FORM - Component Mounted:', {
      timestamp: new Date().toISOString(),
      initialFormData: formData,
      initialLoading: isLoading,
      initialError: error
    });
  }, []);

  const handleChange = (e) => {
    console.log('🔍 LOGIN FORM - Field Changed:', {
      field: e.target.name,
      value: e.target.value,
      timestamp: new Date().toISOString()
    });
    
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAccountFormChange = (e) => {
    console.log('🔍 ADMIN ACCOUNT FORM - Field Changed:', {
      field: e.target.name,
      value: e.target.value,
      timestamp: new Date().toISOString()
    });
    
    // If role is being changed, find and store the complete role object
    if (e.target.name === 'role') {
      const selectedRole = availableRoles.find(role => 
        (role.name || role._id) === e.target.value
      );
      
      console.log('🔍 ROLE SELECTION - Complete Role Object:', {
        selectedValue: e.target.value,
        foundRole: selectedRole,
        roleId: selectedRole?._id,
        roleName: selectedRole?.name,
        displayName: selectedRole?.displayName
      });
      
      setAccountFormData({
        ...accountFormData,
        [e.target.name]: e.target.value,
        selectedRole: selectedRole || null
      });
    } else {
      setAccountFormData({
        ...accountFormData,
        [e.target.name]: e.target.value,
      });
    }
  };

  // Check if setup is needed
  const checkSetupStatus = async () => {
    try {
      setIsCheckingSetup(true);
      console.log('🔍 SETUP STATUS - Checking if first admin setup is needed...');
      
      let response;
      try {
        response = await fetch('https://ts-backend-1-jyit.onrender.com/api/setup/status', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      } catch (error) {
        console.log('⚠️ SETUP STATUS - Setup endpoint not available, assuming setup not needed');
        setSetupNeeded(false);
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 SETUP STATUS RESPONSE:', data);
        
        if (data.success && data.data) {
          setSetupNeeded(data.data.setupNeeded);
          console.log('✅ SETUP STATUS - Setup needed:', data.data.setupNeeded);
        } else {
          console.log('❌ SETUP STATUS - Invalid response format:', data);
          setSetupNeeded(false); // Default to not needed if we can't determine
        }
      } else {
        console.log('❌ SETUP STATUS - HTTP Error:', response.status, response.statusText);
        setSetupNeeded(false); // Default to not needed if we can't check
      }
    } catch (error) {
      console.log('❌ SETUP STATUS - Error:', error.message);
      setSetupNeeded(false); // Default to not needed if error
    } finally {
      setIsCheckingSetup(false);
    }
  };

  // Fetch available roles from backend
  const fetchAvailableRoles = async () => {
    try {
      setIsLoadingRoles(true);
      setRolesError("");
      
      console.log('🔄 FETCHING ROLES - Getting available roles from public endpoint...');
      
      // Try setup roles endpoint first, fallback to admin-management/roles
      let response;
      try {
        response = await fetch('https://ts-backend-1-jyit.onrender.com/api/setup/roles', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      } catch (error) {
        console.log('⚠️ SETUP ROLES - Setup endpoint not available, trying admin-management/roles');
        response = await fetch('https://ts-backend-1-jyit.onrender.com/api/admin-management/roles', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 ROLES RESPONSE DEBUG:', {
          success: data.success,
          hasData: !!data.data,
          hasRoles: !!data.data?.roles,
          rolesLength: data.data?.roles?.length,
          roles: data.data?.roles
        });
        
        if (data.success && data.data && data.data.roles) {
          console.log('✅ ROLES FETCHED - Available roles:', data.data.roles);
          setAvailableRoles(data.data.roles);
        } else {
          console.log('❌ ROLES RESPONSE INVALID:', data);
          throw new Error('Invalid response format');
        }
      } else {
        console.log('❌ ROLES HTTP ERROR:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ FETCH ROLES ERROR:', error);
      setRolesError('Failed to load roles');
      setAvailableRoles([]);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  const handleAddAccount = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Check setup status first
    await checkSetupStatus();
    
    setIsAddAccountOpen(true);
    setAccountError("");
    setAccountSuccess("");
    setAccountFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      selectedRole: null,
    });
    
    // Fetch roles when dialog opens
    console.log('🔍 HANDLE ADD ACCOUNT - About to fetch roles');
    fetchAvailableRoles();
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    
    console.log('🚀 ADMIN ACCOUNT CREATION - Starting Process:', {
      timestamp: new Date().toISOString(),
      formData: {
        firstName: accountFormData.firstName,
        lastName: accountFormData.lastName,
        email: accountFormData.email,
        role: accountFormData.role,
        passwordLength: accountFormData.password.length,
        confirmPasswordLength: accountFormData.confirmPassword.length
      }
    });
    
    setIsCreatingAccount(true);
    setAccountError("");
    setAccountSuccess("");

    // Validation
    console.log('🔍 ADMIN ACCOUNT - Validation Check:', {
      passwordMatch: accountFormData.password === accountFormData.confirmPassword,
      passwordLength: accountFormData.password.length,
      minLengthRequired: 6,
      firstName: accountFormData.firstName,
      lastName: accountFormData.lastName,
      email: accountFormData.email,
      role: accountFormData.role
    });

    // Check required fields
    if (!accountFormData.firstName.trim()) {
      console.log('❌ ADMIN ACCOUNT - Validation Failed: First name is required');
      setAccountError("First name is required");
      setIsCreatingAccount(false);
      return;
    }

    if (!accountFormData.lastName.trim()) {
      console.log('❌ ADMIN ACCOUNT - Validation Failed: Last name is required');
      setAccountError("Last name is required");
      setIsCreatingAccount(false);
      return;
    }

    if (!accountFormData.email.trim()) {
      console.log('❌ ADMIN ACCOUNT - Validation Failed: Email is required');
      setAccountError("Email is required");
      setIsCreatingAccount(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(accountFormData.email)) {
      console.log('❌ ADMIN ACCOUNT - Validation Failed: Invalid email format');
      setAccountError("Please enter a valid email address");
      setIsCreatingAccount(false);
      return;
    }

    if (!accountFormData.role) {
      console.log('❌ ADMIN ACCOUNT - Validation Failed: Role is required');
      setAccountError("Please select a role");
      setIsCreatingAccount(false);
      return;
    }

    // Validate role value
    const validRoles = availableRoles.map(role => role.name || role._id);
    if (!validRoles.includes(accountFormData.role)) {
      console.log('❌ ADMIN ACCOUNT - Validation Failed: Invalid role selected');
      setAccountError("Please select a valid role");
      setIsCreatingAccount(false);
      return;
    }

    if (accountFormData.password !== accountFormData.confirmPassword) {
      console.log('❌ ADMIN ACCOUNT - Validation Failed: Passwords do not match');
      setAccountError("Passwords do not match");
      setIsCreatingAccount(false);
      return;
    }

    if (accountFormData.password.length < 6) {
      console.log('❌ ADMIN ACCOUNT - Validation Failed: Password too short');
      setAccountError("Password must be at least 6 characters long");
      setIsCreatingAccount(false);
      return;
    }

    console.log('✅ ADMIN ACCOUNT - Validation Passed, Proceeding with Creation');

    try {
      console.log('🔄 ADMIN ACCOUNT - Calling Admin Creation API...');
      
      // Use the complete role object that was selected
      const selectedRole = accountFormData.selectedRole;
      
      console.log('🔍 USING SELECTED ROLE OBJECT:', {
        selectedRole: selectedRole,
        roleId: selectedRole?._id,
        roleName: selectedRole?.name,
        displayName: selectedRole?.displayName,
        permissions: selectedRole?.permissions
      });
      
      // Backend now uses direct role field (super_admin, admin, moderator)
      // Passwords are sent as plain text - backend will hash them automatically
      const adminData = {
        firstName: accountFormData.firstName.trim(),
        lastName: accountFormData.lastName.trim(),
        email: accountFormData.email.trim().toLowerCase(),
        password: accountFormData.password, // Plain text - backend will hash
        role: accountFormData.role // Direct role field (super_admin, admin, moderator)
      };
      
      // Validate that we have a valid role
      if (!adminData.role) {
        console.log('❌ ADMIN ACCOUNT - No valid role selected');
        setAccountError("Please select a valid role");
        setIsCreatingAccount(false);
        return;
      }
      
      console.log('🔍 ADMIN ACCOUNT - Data being sent to API:', {
        ...adminData,
        password: '[HIDDEN]' // Don't log password
      });
      
      // Try setup first-admin endpoint first, fallback to admin-management/
      let response;
      let endpoint = '/setup/first-admin';
      
      try {
        console.log('🔍 API CALL DETAILS:', {
          endpoint: '/setup/first-admin',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(adminData),
          fullUrl: 'https://ts-backend-1-jyit.onrender.com/api/setup/first-admin'
        });
        
        console.log('👤 ADMIN ACCOUNT - Creating First Admin with setup endpoint');
        
        response = await fetch('https://ts-backend-1-jyit.onrender.com/api/setup/first-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(adminData)
        });
      } catch (error) {
        console.log('⚠️ SETUP FIRST-ADMIN - Setup endpoint not available, trying admin-management/');
        endpoint = '/admin-management/';
        
        response = await fetch('https://ts-backend-1-jyit.onrender.com/api/admin-management/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(adminData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && errorData.message?.includes('already exist')) {
          throw new Error('Admin accounts already exist. Please log in first, then create additional admin accounts from the Admin Management page.');
        }
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ ADMIN ACCOUNT - Account Created Successfully:', {
          timestamp: new Date().toISOString(),
          accountData: {
            firstName: accountFormData.firstName,
            lastName: accountFormData.lastName,
            email: accountFormData.email,
            role: accountFormData.role
          },
          response: result.data
        });
        
        const roleName = accountFormData.role;
        setAccountSuccess(`Admin account created successfully! ${accountFormData.firstName} ${accountFormData.lastName} (${roleName}) can now log in.`);
        setTimeout(() => {
          console.log('🔄 ADMIN ACCOUNT - Closing Dialog');
          setIsAddAccountOpen(false);
          setAccountSuccess("");
        }, 3000);
      } else {
        console.log('❌ ADMIN ACCOUNT - Creation Failed:', {
          error: result.message,
          timestamp: new Date().toISOString()
        });
        setAccountError(result.message || "Failed to create admin account. Please try again.");
      }
      
    } catch (err) {
      console.error('❌ ADMIN ACCOUNT - Creation Error Details:', {
        error: err,
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
      
      // More specific error handling based on backend responses
      if (err.message.includes('401')) {
        setAccountError("Authentication failed. Please log in again.");
      } else if (err.message.includes('400')) {
        if (err.message.includes('Invalid role specified')) {
          setAccountError("Invalid role selected. Please select a valid role from the list.");
        } else if (err.message.includes('already exists')) {
          setAccountError("An admin with this email already exists. Please use a different email.");
        } else {
          setAccountError("Invalid data provided. Please check all fields are filled correctly.");
        }
      } else if (err.message.includes('409')) {
        setAccountError("An admin with this email already exists. Please use a different email.");
      } else if (err.message.includes('500')) {
        setAccountError("Server error. Please try again later.");
      } else if (err.message.includes('NetworkError') || err.message.includes('fetch')) {
        setAccountError("Network error. Please check your connection and try again.");
      } else if (err.message.includes('Invalid data provided')) {
        setAccountError("Please ensure all fields are filled correctly and email format is valid.");
      } else {
        setAccountError(`Account creation failed: ${err.message}`);
      }
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔐 LOGIN - Starting Login Process:', {
      timestamp: new Date().toISOString(),
      email: formData.email,
      passwordLength: formData.password.length,
      action: 'LOGIN_ATTEMPT'
    });
    
    setIsLoading(true);
    setError("");

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        console.log('✅ LOGIN - Authentication Successful:', {
          timestamp: new Date().toISOString(),
          user: result.data?.admin
        });
        
        // Dispatch login action for Redux state
        dispatch(setLogin({
          user: result.data?.admin,
          token: localStorage.getItem('adminToken')
        }));

        console.log('🎉 LOGIN - Login Process Completed Successfully');
        console.log('🔍 LOGIN - Redux state updated:', {
          user: result.data?.admin,
          token: localStorage.getItem('adminToken'),
          timestamp: new Date().toISOString()
        });
        
        // The redirect will be handled by the useEffect hook when isAuthenticated becomes true
        console.log('🔄 LOGIN - Waiting for authentication state to update...');
      } else {
        console.log('❌ LOGIN - Authentication Failed:', {
          timestamp: new Date().toISOString(),
          error: result.error
        });
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('❌ LOGIN - Login Process Failed:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        p: 2,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box textAlign="center" mb={3}>
          <Box
            component="img"
            src="/assets/logo_trafficSlight.png"
            alt="TrafficSlight Logo"
            sx={{
              height: 60,
              mb: 2,
            }}
          />
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Admin Login
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Sign in to access the dashboard
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            disabled={isLoading}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            disabled={isLoading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            startIcon={<Login />}
            sx={{
              py: 1.5,
              backgroundColor: theme.palette.secondary.main,
              "&:hover": {
                backgroundColor: theme.palette.secondary.dark,
              },
              "&:disabled": {
                backgroundColor: theme.palette.action.disabled,
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign In"
            )}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Button
          fullWidth
          variant="outlined"
          type="button"
          onClick={handleAddAccount}
          startIcon={<PersonAdd />}
          sx={{
            py: 1.5,
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            "&:hover": {
              borderColor: theme.palette.primary.dark,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          }}
        >
          Add Admin Account
        </Button>
        
        <Box mt={2} p={2} sx={{ backgroundColor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            ⚠️ Note: Admin creation requires authentication
          </Typography>
          <Typography variant="body2" color="text.primary" fontWeight="medium">
            You need to be logged in to create admin accounts
          </Typography>
        </Box>

      </Paper>

      {/* Add Account Dialog */}
      <Dialog 
        open={isAddAccountOpen} 
        onClose={() => setIsAddAccountOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonAdd color="primary" />
            <Typography variant="h6">
              {setupNeeded === true ? 'Create First Admin Account' : 'Create Admin Account'}
            </Typography>
          </Box>
          {setupNeeded === true && (
            <Box mt={1}>
              <Typography variant="body2" color="primary" fontWeight="medium">
                🎯 First admin setup - No authentication required
              </Typography>
            </Box>
          )}
          {setupNeeded === false && (
            <Box mt={1}>
              <Typography variant="body2" color="warning.main" fontWeight="medium">
                ⚠️ Admin accounts exist - Authentication required
              </Typography>
            </Box>
          )}
        </DialogTitle>
        
        <DialogContent>
          {accountError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {accountError}
            </Alert>
          )}
          
          {accountSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {accountSuccess}
            </Alert>
          )}

          <Box component="form" onSubmit={(e) => { e.preventDefault(); handleCreateAccount(e); }}>
            <Box display="flex" gap={2} mb={2}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={accountFormData.firstName}
                onChange={handleAccountFormChange}
                required
                disabled={isCreatingAccount}
              />
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={accountFormData.lastName}
                onChange={handleAccountFormChange}
                required
                disabled={isCreatingAccount}
              />
            </Box>

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={accountFormData.email}
              onChange={handleAccountFormChange}
              required
              sx={{ mb: 2 }}
              disabled={isCreatingAccount}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={accountFormData.role}
                onChange={handleAccountFormChange}
                label="Role"
                disabled={isCreatingAccount || isLoadingRoles}
                required
              >
                {isLoadingRoles ? (
                  <MenuItem disabled>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} />
                      <Typography>Loading roles...</Typography>
                    </Box>
                  </MenuItem>
                ) : (() => {
                  console.log('🔍 ROLE SELECTION DEBUG:', {
                    availableRoles,
                    length: availableRoles.length,
                    isLoadingRoles,
                    rolesError
                  });
                  return availableRoles.length > 0;
                })() ? (
                  availableRoles.map((role) => {
                    console.log('🔍 RENDERING ROLE:', role);
                    const roleName = role.name || role._id;
                    const displayName = role.displayName || role.name || role._id;
                    const description = role.description || role.permissions?.description || 'No description available';
                    
                    // Get appropriate icon based on role name
                    const getRoleIcon = (roleName) => {
                      if (roleName.includes('super') || roleName.includes('admin')) return <Security color="primary" />;
                      if (roleName.includes('admin')) return <AdminPanelSettings color="primary" />;
                      return <Visibility color="primary" />;
                    };
                    
                    return (
                      <MenuItem key={role._id || roleName} value={roleName}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          {getRoleIcon(roleName)}
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {displayName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {description}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    );
                  })
                ) : (
                  <MenuItem disabled>
                    <Typography color="text.secondary">No roles available</Typography>
                  </MenuItem>
                )}
              </Select>
              {rolesError && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {rolesError}
                </Typography>
              )}
            </FormControl>

            {/* Role Information Display */}
            {accountFormData.selectedRole && (() => {
              const selectedRole = accountFormData.selectedRole;
              
              if (!selectedRole) return null;
              
              const displayName = selectedRole.displayName || selectedRole.name || selectedRole._id;
              const description = selectedRole.description || 'No description available';
              const permissions = selectedRole.permissions || {};
              
              // Get appropriate icon
              const getRoleIcon = (roleName) => {
                if (roleName.includes('super')) return <Security color="primary" />;
                if (roleName.includes('admin')) return <AdminPanelSettings color="primary" />;
                return <Visibility color="primary" />;
              };
              
              // Format permissions
              const formatPermissions = (perms) => {
                const permList = [];
                if (perms.canCreate) permList.push('Create');
                if (perms.canRead) permList.push('Read');
                if (perms.canUpdate) permList.push('Update');
                if (perms.canDelete) permList.push('Delete');
                if (perms.canManageAdmins) permList.push('Manage Admins');
                if (perms.canAssignRoles) permList.push('Assign Roles');
                return permList.length > 0 ? permList.join(', ') : 'Read only';
              };
              
              return (
                <Box sx={{ 
                  p: 2, 
                  mb: 2, 
                  backgroundColor: theme.palette.background.default,
                  borderRadius: 1,
                  border: `1px solid ${theme.palette.divider}`
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    {getRoleIcon(accountFormData.role)}
                    <Typography variant="subtitle2" fontWeight="medium">
                      Selected Role: {displayName}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Permissions: {formatPermissions(permissions)}
                  </Typography>
                </Box>
              );
            })()}

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={accountFormData.password}
              onChange={handleAccountFormChange}
              required
              sx={{ mb: 2 }}
              disabled={isCreatingAccount}
              helperText="Password must be at least 6 characters long"
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={accountFormData.confirmPassword}
              onChange={handleAccountFormChange}
              required
              disabled={isCreatingAccount}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button 
            type="button"
            onClick={() => setIsAddAccountOpen(false)}
            disabled={isCreatingAccount}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreateAccount}
            variant="contained"
            disabled={isCreatingAccount}
            startIcon={isCreatingAccount ? <CircularProgress size={20} /> : <PersonAdd />}
          >
            {isCreatingAccount ? "Creating..." : (setupNeeded === true ? "Create First Admin" : "Create Account")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoginForm;
