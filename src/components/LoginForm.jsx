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
import { PersonAdd, Login } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { setLogin } from "state";
import { adminAuthService } from "../services/adminAuthService";
import { adminService } from "../services/adminService";

const LoginForm = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
    role: "admin",
  });
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");

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
    
    setAccountFormData({
      ...accountFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddAccount = () => {
    console.log('🚀 ADMIN ACCOUNT - Opening Add Account Dialog:', {
      timestamp: new Date().toISOString(),
      action: 'OPEN_DIALOG'
    });
    
    setIsAddAccountOpen(true);
    setAccountError("");
    setAccountSuccess("");
    setAccountFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "admin",
    });
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
      minLengthRequired: 6
    });

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
      
      // Use adminService for creating admin account
      const adminData = {
        firstName: accountFormData.firstName,
        lastName: accountFormData.lastName,
        email: accountFormData.email,
        password: accountFormData.password,
        role: accountFormData.role
      };
      
      // Use real backend service
      const response = await adminService.createAdmin(adminData);
      
      if (response.success) {
        console.log('✅ ADMIN ACCOUNT - Account Created Successfully:', {
          timestamp: new Date().toISOString(),
          accountData: {
            firstName: accountFormData.firstName,
            lastName: accountFormData.lastName,
            email: accountFormData.email,
            role: accountFormData.role
          }
        });
        
        setAccountSuccess("Admin account created successfully!");
        setTimeout(() => {
          console.log('🔄 ADMIN ACCOUNT - Closing Dialog');
          setIsAddAccountOpen(false);
          setAccountSuccess("");
        }, 2000);
      } else {
        console.log('❌ ADMIN ACCOUNT - Creation Failed:', {
          error: response.error,
          timestamp: new Date().toISOString()
        });
        setAccountError(response.error || "Failed to create admin account. Please try again.");
      }
      
    } catch (err) {
      console.log('❌ ADMIN ACCOUNT - Creation Failed:', {
        error: err.message,
        timestamp: new Date().toISOString()
      });
      setAccountError("Failed to create admin account. Please try again.");
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
    
    console.log('🔍 LOGIN FORM - Current State Before Login:', {
      formData,
      isLoading,
      error
    });
    
    setIsLoading(true);
    setError("");

    try {
      console.log('🔍 LOGIN - Validating Credentials:', {
        providedEmail: formData.email,
        providedPassword: formData.password,
        expectedEmail: "admin@trafficslight.com",
        expectedPassword: "admin123"
      });

      // Try real backend authentication first, fallback to mock if backend is not available
      try {
        const response = await fetch('https://ts-backend-1-jyit.onrender.com/api/admin-auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            console.log('✅ LOGIN - Backend Authentication Successful:', {
              timestamp: new Date().toISOString(),
              user: data.data.admin,
              token: data.data.token
            });

            dispatch(setLogin({
              user: data.data.admin,
              token: data.data.token,
            }));

            console.log('🎉 LOGIN - Login Successful, User Authenticated');
            return; // Exit early on success
          }
        }
      } catch (backendError) {
        console.log('⚠️ LOGIN - Backend not available, using mock authentication:', backendError.message);
      }

      // Fallback to mock authentication if backend is not available
      console.log('🔄 LOGIN - Using mock authentication as fallback');
      
      // Validate credentials for mock authentication
      if (formData.email === "admin@trafficslight.com" && formData.password === "admin123") {
        const mockResponse = {
          success: true,
          data: {
            token: 'mock_admin_token_' + Date.now(),
            admin: {
              id: '1',
              firstName: 'Admin',
              lastName: 'User',
              email: formData.email,
              role: {
                name: 'super_admin',
                displayName: 'Super Administrator',
                permissions: {
                  canCreate: true,
                  canRead: true,
                  canUpdate: true,
                  canDelete: true,
                  canManageAdmins: true,
                  canAssignRoles: true,
                  canManageUsers: true,
                  canManageReports: true,
                  canManageTrips: true,
                  canManageGasStations: true,
                  canViewAnalytics: true,
                  canExportData: true,
                  canManageSettings: true
                }
              },
              isActive: true,
              lastLogin: new Date().toISOString()
            }
          }
        };

        console.log('✅ LOGIN - Mock Authentication Successful:', {
          timestamp: new Date().toISOString(),
          user: mockResponse.data.admin,
          token: mockResponse.data.token
        });

        dispatch(setLogin({
          user: mockResponse.data.admin,
          token: mockResponse.data.token,
        }));

        console.log('🎉 LOGIN - Mock Login Successful, User Authenticated');
      } else {
        console.log('❌ LOGIN - Invalid Credentials:', {
          providedEmail: formData.email,
          providedPassword: formData.password
        });
        setError("Invalid email or password");
      }
    } catch (err) {
      console.log('❌ LOGIN - Login Failed with Error:', {
        error: err.message,
        timestamp: new Date().toISOString()
      });
      
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      console.log('🔄 LOGIN - Login Process Complete, Setting Loading to False');
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

        <Box mt={3} p={2} sx={{ backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Demo Credentials:
          </Typography>
          <Typography variant="body2" color="text.primary" fontWeight="medium">
            Email: admin@trafficslight.com
          </Typography>
          <Typography variant="body2" color="text.primary" fontWeight="medium">
            Password: admin123
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
            <Typography variant="h6">Create Admin Account</Typography>
          </Box>
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

          <Box component="form" onSubmit={handleCreateAccount}>
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
                disabled={isCreatingAccount}
              >
                <MenuItem value="super_admin">Super Administrator</MenuItem>
                <MenuItem value="admin">Administrator</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
              </Select>
            </FormControl>

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
            onClick={() => setIsAddAccountOpen(false)}
            disabled={isCreatingAccount}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateAccount}
            variant="contained"
            disabled={isCreatingAccount}
            startIcon={isCreatingAccount ? <CircularProgress size={20} /> : <PersonAdd />}
          >
            {isCreatingAccount ? "Creating..." : "Create Account"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoginForm;
