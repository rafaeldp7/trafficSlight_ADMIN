import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Grid,
  Button
} from '@mui/material';
import { Search, FilterList, Refresh, History } from '@mui/icons-material';
import Header from 'components/Header';
import FlexBetween from 'components/FlexBetween';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    search: ''
  });
  const [stats, setStats] = useState({
    totalLogs: 0,
    todayLogs: 0,
    uniqueAdmins: 0
  });

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [currentPage, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...filters
      });
      
      const response = await fetch(`https://ts-backend-1-jyit.onrender.com/api/admin-management/admin-logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        console.error('Failed to fetch logs:', response.status, response.statusText);
        setLogs([]);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('https://ts-backend-1-jyit.onrender.com/api/admin-management/admin-logs/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalLogs: data.totalLogs || 0,
          todayLogs: data.todayLogs || 0,
          uniqueAdmins: data.uniqueAdmins || 0
        });
      } else {
        console.error('Failed to fetch stats:', response.status, response.statusText);
        setStats({ totalLogs: 0, todayLogs: 0, uniqueAdmins: 0 });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({ totalLogs: 0, todayLogs: 0, uniqueAdmins: 0 });
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleRefresh = () => {
    fetchLogs();
    fetchStats();
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE': return 'success';
      case 'UPDATE': return 'primary';
      case 'DELETE': return 'error';
      case 'LOGIN': return 'info';
      case 'LOGOUT': return 'default';
      default: return 'secondary';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE': return '➕';
      case 'UPDATE': return '✏️';
      case 'DELETE': return '🗑️';
      case 'LOGIN': return '🔐';
      case 'LOGOUT': return '🚪';
      default: return '📝';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading && logs.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box m="1.5rem 2.5rem">
      <FlexBetween>
        <Header title="Admin Activity Logs" subtitle="Track admin actions and activities" />
        <Button
          startIcon={<Refresh />}
          onClick={handleRefresh}
          variant="outlined"
          sx={{ borderColor: '#00ADB5', color: '#00ADB5' }}
        >
          Refresh
        </Button>
      </FlexBetween>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mt: 2, mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ backgroundColor: '#f8f9fa' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <History sx={{ color: '#00ADB5', fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="#00ADB5">
                    {stats.totalLogs}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Logs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ backgroundColor: '#f8f9fa' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h4" fontWeight="bold" color="#00ADB5">
                  {stats.todayLogs}
                </Typography>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Today's Activity
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ backgroundColor: '#f8f9fa' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h4" fontWeight="bold" color="#00ADB5">
                  {stats.uniqueAdmins}
                </Typography>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Admins
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Filters */}
      <Box mt="20px" display="flex" gap={2} mb={2} flexWrap="wrap">
        <TextField
          placeholder="Search logs..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200 }}
        />
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Action</InputLabel>
          <Select
            value={filters.action}
            onChange={(e) => handleFilterChange('action', e.target.value)}
            label="Action"
          >
            <MenuItem value="">All Actions</MenuItem>
            <MenuItem value="CREATE">Create</MenuItem>
            <MenuItem value="UPDATE">Update</MenuItem>
            <MenuItem value="DELETE">Delete</MenuItem>
            <MenuItem value="LOGIN">Login</MenuItem>
            <MenuItem value="LOGOUT">Logout</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Resource</InputLabel>
          <Select
            value={filters.resource}
            onChange={(e) => handleFilterChange('resource', e.target.value)}
            label="Resource"
          >
            <MenuItem value="">All Resources</MenuItem>
            <MenuItem value="USER">User</MenuItem>
            <MenuItem value="REPORT">Report</MenuItem>
            <MenuItem value="MOTOR">Motor</MenuItem>
            <MenuItem value="ADMIN">Admin</MenuItem>
            <MenuItem value="ADMIN_ROLE">Admin Role</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Admin</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Resource</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Details</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>IP Address</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log._id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight="medium">
                      {log.adminName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={`${getActionIcon(log.action)} ${log.action}`}
                    color={getActionColor(log.action)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={log.resource}
                    color="default"
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {log.details?.description || 'No details'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {log.ipAddress || 'N/A'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatTimestamp(log.timestamp)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(log.timestamp).toLocaleString()}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {logs.length === 0 && !loading && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No activity logs found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Admin activities will appear here once they start using the system
          </Typography>
        </Box>
      )}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#00ADB5'
              }
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default AdminLogs;
