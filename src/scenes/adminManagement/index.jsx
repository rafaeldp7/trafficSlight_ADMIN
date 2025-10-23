import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { Edit, Delete, Add, Visibility, PersonAdd, Security } from '@mui/icons-material';
import Header from 'components/Header';
import FlexBetween from 'components/FlexBetween';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleId: ''
  });
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    permissions: {
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false,
      canManageAdmins: false,
      canAssignRoles: false
    }
  });

  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      // Try real backend first, fallback to mock if not available
      try {
        const response = await fetch('https://ts-backend-1-jyit.onrender.com/api/admin-management/admins', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setAdmins(data.admins || []);
          return; // Exit early on success
        }
      } catch (backendError) {
        console.log('⚠️ ADMIN MANAGEMENT - Backend not available, using mock data:', backendError.message);
      }

      // If backend fails, show error
      console.error('Backend admin management not available');
      showSnackbar('Admin management service not available', 'error');
      setAdmins([]);
    } catch (error) {
      console.error('Error fetching admins:', error);
      showSnackbar('Failed to fetch admins', 'error');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      // Try real backend first, fallback to mock if not available
      try {
        const response = await fetch('https://ts-backend-1-jyit.onrender.com/api/admin-management/admin-roles', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setRoles(data.roles || []);
          return; // Exit early on success
        }
      } catch (backendError) {
        console.log('⚠️ ADMIN MANAGEMENT - Backend not available for roles, using mock data:', backendError.message);
      }

      // If backend fails, show error
      console.error('Backend admin roles not available');
      showSnackbar('Admin roles service not available', 'error');
      setRoles([]);
    } catch (error) {
      console.error('Error fetching roles:', error);
      showSnackbar('Failed to fetch roles', 'error');
      setRoles([]);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      // Try real backend first, fallback to mock if not available
      try {
        const response = await fetch('https://ts-backend-1-jyit.onrender.com/api/admin-management/admins', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          showSnackbar('Admin created successfully', 'success');
          fetchAdmins();
          setOpenDialog(false);
          setFormData({ firstName: '', lastName: '', email: '', password: '', roleId: '' });
          return; // Exit early on success
        }
      } catch (backendError) {
        console.log('⚠️ ADMIN MANAGEMENT - Backend not available for create admin, using mock service:', backendError.message);
      }

      // If backend fails, show error
      console.error('Backend admin creation not available');
      showSnackbar('Admin creation service not available', 'error');
    } catch (error) {
      console.error('Error creating admin:', error);
      showSnackbar('Failed to create admin', 'error');
    }
  };

  const handleUpdateRole = async (adminId, newRoleId) => {
    try {
      // Try real backend first, fallback to mock if not available
      try {
        const response = await fetch(`https://ts-backend-1-jyit.onrender.com/api/admin-management/admins/${adminId}/role`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: JSON.stringify({ roleId: newRoleId })
        });
        
        if (response.ok) {
          showSnackbar('Admin role updated successfully', 'success');
          fetchAdmins();
          return; // Exit early on success
        }
      } catch (backendError) {
        console.log('⚠️ ADMIN MANAGEMENT - Backend not available for update role, using mock service:', backendError.message);
      }

      // If backend fails, show error
      console.error('Backend admin role update not available');
      showSnackbar('Admin role update service not available', 'error');
    } catch (error) {
      console.error('Error updating role:', error);
      showSnackbar('Failed to update role', 'error');
    }
  };

  const handleDeactivateAdmin = async (adminId) => {
    try {
      const response = await fetch(`https://ts-backend-1-jyit.onrender.com/api/admin-management/admins/${adminId}/deactivate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        showSnackbar('Admin deactivated successfully', 'success');
        fetchAdmins();
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.error || 'Failed to deactivate admin', 'error');
      }
    } catch (error) {
      console.error('Error deactivating admin:', error);
      showSnackbar('Failed to deactivate admin', 'error');
    }
  };

  const handleCreateRole = async () => {
    try {
      const response = await fetch('https://ts-backend-1-jyit.onrender.com/api/admin-management/admin-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(roleFormData)
      });
      
      if (response.ok) {
        showSnackbar('Role created successfully', 'success');
        fetchRoles();
        setOpenRoleDialog(false);
        setRoleFormData({
          name: '',
          description: '',
          permissions: {
            canCreate: false,
            canRead: true,
            canUpdate: false,
            canDelete: false,
            canManageAdmins: false,
            canAssignRoles: false
          }
        });
      } else {
        const errorData = await response.json();
        showSnackbar(errorData.error || 'Failed to create role', 'error');
      }
    } catch (error) {
      console.error('Error creating role:', error);
      showSnackbar('Failed to create role', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'super_admin': return 'error';
      case 'admin': return 'primary';
      case 'viewer': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'default';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Debug logging
  console.log('🔍 ADMIN MANAGEMENT - Component render state:', {
    admins: admins,
    adminsLength: admins.length,
    loading: loading,
    roles: roles,
    rolesLength: roles.length
  });

  return (
    <Box m="1.5rem 2.5rem">
      <FlexBetween>
        <Header title="Admin Management" subtitle="Manage admin users and roles" />
      </FlexBetween>
      
      <Box mt="20px">
        <Box display="flex" gap={2} mb={3}>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setOpenDialog(true)}
            sx={{ backgroundColor: '#00ADB5' }}
          >
            Add New Admin
          </Button>
          <Button
            variant="outlined"
            startIcon={<Security />}
            onClick={() => setOpenRoleDialog(true)}
            sx={{ borderColor: '#00ADB5', color: '#00ADB5' }}
          >
            Create Role
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created By</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Last Login</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin._id} hover>
                  <TableCell>{admin.firstName} {admin.lastName}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={admin.role?.name || 'No Role'} 
                      color={getRoleColor(admin.role?.name)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{admin.createdBy?.name || 'System'}</TableCell>
                  <TableCell>
                    {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={admin.isActive ? 'Active' : 'Inactive'} 
                      color={getStatusColor(admin.isActive)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton 
                        size="small"
                        onClick={() => setSelectedAdmin(admin)}
                        sx={{ color: '#00ADB5' }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small"
                        onClick={() => handleDeactivateAdmin(admin._id)}
                        sx={{ color: '#ff6b6b' }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {admins.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No admins found
            </Typography>
          </Box>
        )}
      </Box>

      {/* Create Admin Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Admin</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.roleId}
              onChange={(e) => setFormData({...formData, roleId: e.target.value})}
              required
            >
              {roles.map((role) => (
                <MenuItem key={role._id} value={role._id}>
                  {role.name} - {role.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateAdmin} variant="contained" sx={{ backgroundColor: '#00ADB5' }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Role Dialog */}
      <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Role</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Role Name"
            value={roleFormData.name}
            onChange={(e) => setRoleFormData({...roleFormData, name: e.target.value})}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={roleFormData.description}
            onChange={(e) => setRoleFormData({...roleFormData, description: e.target.value})}
            margin="normal"
            multiline
            rows={2}
          />
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Permissions</Typography>
          <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
            {Object.keys(roleFormData.permissions).map((permission) => (
              <Box key={permission} display="flex" alignItems="center">
                <input
                  type="checkbox"
                  checked={roleFormData.permissions[permission]}
                  onChange={(e) => setRoleFormData({
                    ...roleFormData,
                    permissions: {
                      ...roleFormData.permissions,
                      [permission]: e.target.checked
                    }
                  })}
                />
                <Typography sx={{ ml: 1, textTransform: 'capitalize' }}>
                  {permission.replace(/([A-Z])/g, ' $1').trim()}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRoleDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateRole} variant="contained" sx={{ backgroundColor: '#00ADB5' }}>
            Create Role
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminManagement;
