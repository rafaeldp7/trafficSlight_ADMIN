import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  useTheme
} from '@mui/material';
import {
  AdminPanelSettings,
  Security,
  History,
  People,
  TrendingUp,
  Notifications,
  Settings,
  Dashboard,
  Person,
  Lock,
  Visibility,
  Edit,
  Delete,
  Add,
  Refresh,
  Download,
  Upload,
  Search,
  FilterList,
  MoreVert
} from '@mui/icons-material';
import Header from 'components/Header';
import FlexBetween from 'components/FlexBetween';
// import { adminService } from '../../services/adminService'; // Not needed with mock data
import { useSelector } from 'react-redux';

const AdminDashboard = () => {
  const theme = useTheme();
  const user = useSelector((state) => state.global.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalAdmins: 0,
    activeAdmins: 0,
    inactiveAdmins: 0,
    totalLogs: 0,
    todayLogs: 0,
    uniqueAdmins: 0,
    recentActivity: [],
    adminStats: [],
    roleDistribution: [],
    systemHealth: {
      status: 'healthy',
      uptime: '99.9%',
      lastBackup: '2024-01-15',
      securityScore: 95
    }
  });

  // Admin management data
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [adminLogs, setAdminLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://ts-backend-1-jyit.onrender.com/api/admin-settings/dashboard-stats', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data || {});
      } else {
        console.error('Failed to fetch dashboard data:', response.status, response.statusText);
        console.log('🔄 ADMIN DASHBOARD - Using fallback mock data since API is not available');
        
        // Use mock data when API is not available
        setDashboardData({
          totalAdmins: 3,
          activeAdmins: 2,
          inactiveAdmins: 1,
          totalLogs: 15,
          todayLogs: 5,
          uniqueAdmins: 2,
          recentActivity: [
            { description: 'John Admin logged in', timestamp: '2 minutes ago' },
            { description: 'Jane Manager created new user', timestamp: '1 hour ago' },
            { description: 'Mike Supervisor updated report', timestamp: '3 hours ago' }
          ],
          adminStats: [
            { name: 'John Admin', role: 'Super Admin', status: 'Active', lastLogin: '2 minutes ago' },
            { name: 'Jane Manager', role: 'Admin', status: 'Active', lastLogin: '1 hour ago' },
            { name: 'Mike Supervisor', role: 'Viewer', status: 'Inactive', lastLogin: 'Never' }
          ],
          roleDistribution: [
            { name: 'Super Admin', count: 1 },
            { name: 'Admin', count: 1 },
            { name: 'Viewer', count: 1 }
          ],
          systemHealth: {
            status: 'healthy',
            uptime: '99.9%',
            lastBackup: '2024-01-15',
            securityScore: 95
          }
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.log('🔄 ADMIN DASHBOARD - Using fallback mock data since API is not available');
      
      // Use mock data when API is not available
      setDashboardData({
        totalAdmins: 3,
        activeAdmins: 2,
        inactiveAdmins: 1,
        totalLogs: 15,
        todayLogs: 5,
        uniqueAdmins: 2,
        recentActivity: [
          { description: 'John Admin logged in', timestamp: '2 minutes ago' },
          { description: 'Jane Manager created new user', timestamp: '1 hour ago' }
        ],
        adminStats: [
          { name: 'John Admin', role: 'Super Admin', status: 'Active', lastLogin: '2 minutes ago' }
        ],
        roleDistribution: [
          { name: 'Super Admin', count: 1 },
          { name: 'Admin', count: 1 },
          { name: 'Viewer', count: 1 }
        ],
        systemHealth: {
          status: 'healthy',
          uptime: '99.9%',
          lastBackup: '2024-01-15',
          securityScore: 95
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch('https://ts-backend-1-jyit.onrender.com/api/admin-management/admins', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.data?.admins || data.admins || []);
      } else {
        console.error('Failed to fetch admins:', response.status, response.statusText);
        console.log('🔄 ADMIN DASHBOARD - Using fallback mock admins since API is not available');
        
        // Use mock data when API is not available
        const mockAdmins = [
          {
            _id: '1',
            name: 'John Admin',
            email: 'john.admin@trafficslight.com',
            role: { name: 'super_admin', displayName: 'Super Administrator' },
            isActive: true,
            lastLogin: new Date().toISOString()
          },
          {
            _id: '2',
            name: 'Jane Manager',
            email: 'jane.manager@trafficslight.com',
            role: { name: 'admin', displayName: 'Administrator' },
            isActive: true,
            lastLogin: new Date(Date.now() - 3600000).toISOString()
          },
          {
            _id: '3',
            name: 'Mike Supervisor',
            email: 'mike.supervisor@trafficslight.com',
            role: { name: 'viewer', displayName: 'Viewer' },
            isActive: false,
            lastLogin: null
          }
        ];
        
        setAdmins(mockAdmins);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      console.log('🔄 ADMIN DASHBOARD - Using fallback mock admins since API is not available');
      
      // Use mock data when API is not available
      const mockAdmins = [
        {
          _id: '1',
          name: 'John Admin',
          email: 'john.admin@trafficslight.com',
          role: { name: 'super_admin', displayName: 'Super Administrator' },
          isActive: true,
          lastLogin: new Date().toISOString()
        }
      ];
      
      setAdmins(mockAdmins);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('https://ts-backend-1-jyit.onrender.com/api/admin-management/admin-roles', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRoles(data.data?.roles || data.roles || []);
      } else {
        console.error('Failed to fetch roles:', response.status, response.statusText);
        console.log('🔄 ADMIN DASHBOARD - Using fallback mock roles since API is not available');
        
        // Use mock data when API is not available
        const mockRoles = [
          {
            _id: '1',
            name: 'super_admin',
            displayName: 'Super Administrator',
            description: 'Full system access with all permissions'
          },
          {
            _id: '2',
            name: 'admin',
            displayName: 'Administrator',
            description: 'Standard admin access with most permissions'
          },
          {
            _id: '3',
            name: 'viewer',
            displayName: 'Viewer',
            description: 'Read-only access to system data'
          }
        ];
        
        setRoles(mockRoles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      console.log('🔄 ADMIN DASHBOARD - Using fallback mock roles since API is not available');
      
      // Use mock data when API is not available
      const mockRoles = [
        {
          _id: '1',
          name: 'super_admin',
          displayName: 'Super Administrator',
          description: 'Full system access with all permissions'
        }
      ];
      
      setRoles(mockRoles);
    }
  };

  const fetchAdminLogs = async () => {
    try {
      const response = await fetch('https://ts-backend-1-jyit.onrender.com/api/admin-management/admin-logs', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdminLogs(data.data?.logs || data.logs || []);
      } else {
        console.error('Failed to fetch admin logs:', response.status, response.statusText);
        console.log('🔄 ADMIN DASHBOARD - Using fallback mock logs since API is not available');
        
        // Use mock data when API is not available
        const mockLogs = [
          {
            _id: '1',
            adminName: 'John Admin',
            action: 'LOGIN',
            resource: 'ADMIN',
            description: 'Admin logged in successfully',
            timestamp: new Date().toISOString()
          },
          {
            _id: '2',
            adminName: 'Jane Manager',
            action: 'CREATE',
            resource: 'USER',
            description: 'Created new user account',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            _id: '3',
            adminName: 'Mike Supervisor',
            action: 'UPDATE',
            resource: 'REPORT',
            description: 'Updated report status',
            timestamp: new Date(Date.now() - 7200000).toISOString()
          }
        ];
        
        setAdminLogs(mockLogs);
      }
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      console.log('🔄 ADMIN DASHBOARD - Using fallback mock logs since API is not available');
      
      // Use mock data when API is not available
      const mockLogs = [
        {
          _id: '1',
          adminName: 'John Admin',
          action: 'LOGIN',
          resource: 'ADMIN',
          description: 'Admin logged in successfully',
          timestamp: new Date().toISOString()
        }
      ];
      
      setAdminLogs(mockLogs);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('https://ts-backend-1-jyit.onrender.com/api/admin-settings/notifications', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data?.notifications || data.notifications || []);
      } else {
        console.error('Failed to fetch notifications:', response.status, response.statusText);
        console.log('🔄 ADMIN DASHBOARD - Using fallback mock notifications since API is not available');
        
        // Use mock data when API is not available
        const mockNotifications = [
          {
            _id: '1',
            title: 'System Update',
            message: 'New admin features have been added to the system',
            unread: true,
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            title: 'Security Alert',
            message: 'Multiple failed login attempts detected',
            unread: false,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            _id: '3',
            title: 'Backup Complete',
            message: 'Daily backup has been completed successfully',
            unread: false,
            createdAt: new Date(Date.now() - 7200000).toISOString()
          }
        ];
        
        setNotifications(mockNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      console.log('🔄 ADMIN DASHBOARD - Using fallback mock notifications since API is not available');
      
      // Use mock data when API is not available
      const mockNotifications = [
        {
          _id: '1',
          title: 'System Update',
          message: 'New admin features have been added to the system',
          unread: true,
          createdAt: new Date().toISOString()
        }
      ];
      
      setNotifications(mockNotifications);
    }
  };

  // Fetch data only when component mounts (not on every navigation)
  React.useMemo(() => {
    fetchDashboardData();
    fetchAdmins();
    fetchRoles();
    fetchAdminLogs();
    fetchNotifications();
  }, []); // Empty dependency array - only runs once

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    fetchDashboardData();
    fetchAdmins();
    fetchAdminLogs();
    fetchNotifications();
  };

  const handleExportData = async (format) => {
    try {
      const response = await fetch(`https://ts-backend-1-jyit.onrender.com/api/admin-settings/export-data?format=${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `admin-dashboard-data.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Export failed:', response.status, response.statusText);
        console.log('🔄 ADMIN DASHBOARD - Simulating export since API is not available');
        
        // Simulate export when API is not available
        const exportData = {
          dashboardData,
          admins,
          roles,
          adminLogs,
          notifications,
          exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `admin-dashboard-data.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
      console.log('🔄 ADMIN DASHBOARD - Simulating export since API is not available');
      
      // Simulate export when API is not available
      const exportData = {
        dashboardData,
        admins,
        roles,
        adminLogs,
        notifications,
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(dataBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `admin-dashboard-data.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m="1.5rem 2.5rem">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box m="1.5rem 2.5rem">
      <FlexBetween>
        <Header title="Admin Dashboard" subtitle="Comprehensive admin management overview" />
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            sx={{ borderColor: '#00ADB5', color: '#00ADB5' }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => handleExportData('csv')}
            sx={{ backgroundColor: theme.palette.secondary.main }}
          >
            Export Data
          </Button>
        </Box>
      </FlexBetween>

      {/* Dashboard Overview */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: theme.palette.secondary.main, color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.totalAdmins}
                  </Typography>
                  <Typography variant="body2">Total Admins</Typography>
                </Box>
                <AdminPanelSettings sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: theme.palette.success.main, color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.activeAdmins}
                  </Typography>
                  <Typography variant="body2">Active Admins</Typography>
                </Box>
                <People sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: theme.palette.warning.main, color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.totalLogs}
                  </Typography>
                  <Typography variant="body2">Total Logs</Typography>
                </Box>
                <History sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ backgroundColor: theme.palette.secondary.main, color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {dashboardData.todayLogs}
                  </Typography>
                  <Typography variant="body2">Today's Logs</Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Tabs */}
      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" icon={<Dashboard />} />
          <Tab label="Admin Management" icon={<People />} />
          <Tab label="Activity Logs" icon={<History />} />
          <Tab label="System Health" icon={<Security />} />
          <Tab label="Notifications" icon={<Notifications />} />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Recent Activity */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
                  <List>
                    {(dashboardData.recentActivity || []).map((activity, index) => (
                      <React.Fragment key={index}>
                        <ListItem>
                          <ListItemIcon>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#00ADB5' }}>
                              <Person fontSize="small" />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={activity.description}
                            secondary={activity.timestamp}
                          />
                        </ListItem>
                        {index < (dashboardData.recentActivity || []).length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </Grid>

              {/* Admin Statistics */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Admin Statistics
                </Typography>
                <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Admin</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Last Login</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(admins || []).slice(0, 5).map((admin) => (
                          <TableRow key={admin._id}>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <Avatar sx={{ width: 24, height: 24, bgcolor: '#00ADB5' }}>
                                  <Person fontSize="small" />
                                </Avatar>
                                {admin.name}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={admin.role?.name || 'No Role'}
                                size="small"
                                color="primary"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={admin.isActive ? 'Active' : 'Inactive'}
                                size="small"
                                color={admin.isActive ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell>
                              {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Admin Management
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Last Login</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(admins || []).map((admin) => (
                      <TableRow key={admin._id}>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#00ADB5' }}>
                              <Person />
                            </Avatar>
                            {admin.name}
                          </Box>
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={admin.role?.name || 'No Role'}
                            size="small"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={admin.isActive ? 'Active' : 'Inactive'}
                            size="small"
                            color={admin.isActive ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="View Details">
                              <IconButton size="small">
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Admin">
                              <IconButton size="small">
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Admin">
                              <IconButton size="small" color="error">
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Activity Logs
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Admin</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Resource</TableCell>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(adminLogs || []).map((log) => (
                      <TableRow key={log._id}>
                        <TableCell>{log.adminName}</TableCell>
                        <TableCell>
                          <Chip
                            label={log.action}
                            size="small"
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>{log.resource}</TableCell>
                        <TableCell>
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{log.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {activeTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  System Health
                </Typography>
                <Paper sx={{ p: 2 }}>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="System Status"
                        secondary={dashboardData.systemHealth.status}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Uptime"
                        secondary={dashboardData.systemHealth.uptime}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Last Backup"
                        secondary={dashboardData.systemHealth.lastBackup}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Security Score"
                        secondary={`${dashboardData.systemHealth.securityScore}/100`}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Role Distribution
                </Typography>
                <Paper sx={{ p: 2 }}>
                  <List>
                    {(dashboardData.roleDistribution || []).map((role, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={role.name}
                          secondary={`${role.count} admins`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          )}

          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Notifications
              </Typography>
              <List>
                {(notifications || []).map((notification) => (
                  <React.Fragment key={notification._id}>
                    <ListItem>
                      <ListItemIcon>
                        <Badge
                          badgeContent={notification.unread ? 1 : 0}
                          color="error"
                        >
                          <Notifications />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.title}
                        secondary={notification.message}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(notification.createdAt).toLocaleString()}
                      </Typography>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;
