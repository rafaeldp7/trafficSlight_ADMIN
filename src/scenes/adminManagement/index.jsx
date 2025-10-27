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
  Snackbar,
  Grid,
  FormControlLabel,
  Switch,
  useTheme
} from '@mui/material';
import { Edit, Delete, Add, Visibility, PersonAdd, Security } from '@mui/icons-material';
import Header from 'components/Header';
import FlexBetween from 'components/FlexBetween';
import { usePermissions } from 'hooks/usePermissions';

const AdminManagement = () => {
  const theme = useTheme();
  const { canRead, canCreate, canUpdate, canDelete, canManage, canOnlyView, userRoleDisplay } = usePermissions();
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: ''
  });
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    isActive: true
  });
  const [roleFormData, setRoleFormData] = useState({
    name: '',
    displayName: '',
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

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found. Please login first.');
      }

      const response = await fetch('https://ts-backend-1-jyit.onrender.com/api/admin-management', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle response structure based on backend controller
      let adminsData = [];
      if (data.success && data.data && data.data.admins) {
        adminsData = data.data.admins;
      } else if (Array.isArray(data)) {
        adminsData = data;
      } else {
        console.warn('⚠️ ADMIN MANAGEMENT - Unexpected data structure:', data);
        adminsData = [];
      }
      
      setAdmins(adminsData);
      
      if (adminsData.length === 0) {
      }
      
    } catch (error) {
      console.error('❌ ADMIN MANAGEMENT - Error fetching admins:', error);
      showSnackbar(`Failed to fetch admins: ${error.message}`, 'error');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      
      const response = await fetch('https://ts-backend-1-jyit.onrender.com/api/admin-management/roles', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Roles API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Handle response structure based on backend controller
      let rolesData = [];
      if (data.success && data.data && data.data.roles) {
        rolesData = data.data.roles;
      } else if (Array.isArray(data)) {
        rolesData = data;
      } else {
        console.warn('⚠️ ADMIN MANAGEMENT - Unexpected roles data structure:', data);
        rolesData = [];
      }
      
      setRoles(rolesData);
      
    } catch (error) {
      console.error('❌ ADMIN MANAGEMENT - Error fetching roles:', error);
      showSnackbar(`Failed to fetch roles: ${error.message}`, 'error');
      setRoles([]);
    }
  };

  // Fetch data only when component mounts (not on every navigation)
  React.useMemo(() => {
    fetchAdmins();
    fetchRoles();
  }, []); // Empty dependency array - only runs once

  const handleCreateAdmin = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found. Please login first.');
      }

      const response = await fetch('https://ts-backend-1-jyit.onrender.com/api/admin-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create admin: ${response.status}`);
      }
      
      const data = await response.json();
      
      showSnackbar('Admin created successfully', 'success');
      fetchAdmins();
      setOpenDialog(false);
      setFormData({ firstName: '', lastName: '', email: '', password: '', role: '' });
      
    } catch (error) {
      console.error('❌ ADMIN MANAGEMENT - Error creating admin:', error);
      showSnackbar(`Failed to create admin: ${error.message}`, 'error');
    }
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setEditFormData({
      firstName: admin.firstName || '',
      lastName: admin.lastName || '',
      email: admin.email || '',
      role: admin.role || '',
      isActive: admin.isActive !== false
    });
    setOpenEditDialog(true);
  };

  const handleUpdateAdmin = async () => {
    try {
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found. Please login first.');
      }

      const response = await fetch(`https://ts-backend-1-jyit.onrender.com/api/admin-management/${selectedAdmin._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update admin: ${response.status}`);
      }
      
      const data = await response.json();
      
      showSnackbar('Admin updated successfully', 'success');
      fetchAdmins();
      setOpenEditDialog(false);
      setSelectedAdmin(null);
      
    } catch (error) {
      console.error('❌ ADMIN MANAGEMENT - Error updating admin:', error);
      showSnackbar(`Failed to update admin: ${error.message}`, 'error');
    }
  };

  const handleUpdateRole = async (adminId, newRoleId) => {
    try {
      // Try real backend first, fallback to mock if not available
      try {
        const response = await fetch(`https://ts-backend-1-jyit.onrender.com/api/admin-management/admins/${adminId}/role`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ roleId: newRoleId })
        });
        
        if (response.ok) {
          showSnackbar('Admin role updated successfully', 'success');
          fetchAdmins();
          return; // Exit early on success
        }
      } catch (backendError) {
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
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No admin token found. Please login first.');
      }

      const response = await fetch(`https://ts-backend-1-jyit.onrender.com/api/admin-management/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to deactivate admin: ${response.status}`);
      }
      
      const data = await response.json();
      
      showSnackbar('Admin deactivated successfully', 'success');
      fetchAdmins();
      
    } catch (error) {
      console.error('❌ ADMIN MANAGEMENT - Error deactivating admin:', error);
      showSnackbar(`Failed to deactivate admin: ${error.message}`, 'error');
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
          displayName: '',
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
      case 'admin': return 'info';
      case 'moderator': return 'warning';
      default: return 'secondary';
    }
  };

  const getRoleDisplayName = (roleName) => {
    switch (roleName) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'moderator': return 'Moderator';
      default: return 'No Role';
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

  return (
    <Box m="1.5rem 2.5rem">
      <Header title="Admin Management" subtitle="Manage admin users and roles" mb={4} />
      
      {/* Security Warning for users without proper permissions */}
      {!canRead && !canCreate && !canUpdate && !canDelete && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Access Restricted:</strong> You don't have permission to manage admin users. 
            Contact your system administrator to request appropriate access.
          </Typography>
        </Alert>
      )}
      
      {/* Viewer-only warning */}
      {canOnlyView && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Read-Only Access:</strong> You are logged in as a {userRoleDisplay}. 
            You can view admin users but cannot create, edit, or delete them.
          </Typography>
        </Alert>
      )}
      
      <Box mt="20px">
        <Box display="flex" gap={2} mb={3}>
          {canCreate && (
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => setOpenDialog(true)}
              sx={{ backgroundColor: theme.palette.secondary.main }}
            >
              Add New Admin
            </Button>
          )}
        </Box>

        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100] }}>
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
              {(admins || []).map((admin) => (
                <TableRow key={admin._id} hover>
                  <TableCell>{admin.firstName} {admin.lastName}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getRoleDisplayName(admin.role)} 
                      color={getRoleColor(admin.role)}
                      size="small"
                      variant="outlined"
                      sx={{
                        color: theme.palette.text.primary,
                        borderColor: theme.palette.mode === 'dark'
                          ? theme.palette.secondary.main
                          : theme.palette.grey[600],
                        '& .MuiChip-label': {
                          color: theme.palette.text.primary,
                          fontWeight: 500
                        },
                        '&:hover': {
                          backgroundColor: theme.palette.mode === 'dark'
                            ? theme.palette.action.hover
                            : theme.palette.grey[50],
                          borderColor: theme.palette.secondary.main
                        }
                      }}
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
                      {canUpdate && (
                        <IconButton 
                          size="small"
                          onClick={() => handleEditAdmin(admin)}
                          sx={{ color: '#00ADB5' }}
                          title="Edit Admin"
                        >
                          <Edit />
                        </IconButton>
                      )}
                      {canDelete && (
                        <IconButton 
                          size="small"
                          onClick={() => handleDeactivateAdmin(admin._id)}
                          sx={{ color: '#ff6b6b' }}
                          title="Deactivate Admin"
                        >
                          <Delete />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {(admins || []).length === 0 && !loading && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No admins found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {loading ? 'Loading admins...' : 'Create your first admin account to get started'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => setOpenDialog(true)}
              sx={{ 
                backgroundColor: theme.palette.secondary.main,
                mt: 2
              }}
            >
              Create First Admin
            </Button>
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
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              required
            >
              {(roles || []).map((role) => (
                <MenuItem key={role.name} value={role.name}>
                  {role.displayName} - {role.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          {canCreate && (
            <Button onClick={handleCreateAdmin} variant="contained" sx={{ backgroundColor: theme.palette.secondary.main }}>
              Create
            </Button>
          )}
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
            label="Display Name"
            value={roleFormData.displayName}
            onChange={(e) => setRoleFormData({...roleFormData, displayName: e.target.value})}
            margin="normal"
            required
            placeholder="e.g., Super Administrator"
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
          {canUpdate && (
            <Button onClick={handleCreateRole} variant="contained" sx={{ backgroundColor: theme.palette.secondary.main }}>
              Create Role
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Edit Admin Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Admin</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={editFormData.firstName}
                onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={editFormData.lastName}
                onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  label="Role"
                >
                  {roles.map((role) => (
                    <MenuItem key={role.name} value={role.name}>
                      {role.displayName} ({role.name})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                  />
                }
                label="Active Status"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          {canUpdate && (
            <Button onClick={handleUpdateAdmin} variant="contained" sx={{ bgcolor: '#00ADB5' }}>
              Update Admin
            </Button>
          )}
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
