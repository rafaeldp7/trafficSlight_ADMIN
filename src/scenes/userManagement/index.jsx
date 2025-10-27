import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  useTheme,
  TextField,
  Button,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  alpha,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Pie,
  Bar,
  Line,
} from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import FlexBetween from "components/FlexBetween";
import Header from "components/Header";

Chart.register(...registerables);

const LOCALHOST_IP = "https://ts-backend-1-jyit.onrender.com";

const UserManagement = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("All");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [barangayData, setBarangayData] = useState(null);
  const [topBarangayData, setTopBarangayData] = useState(null);
  const [growthData, setGrowthData] = useState(null);

  // Fetch data only when component mounts (not on every navigation)
  React.useMemo(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          throw new Error('No admin token found. Please login first.');
        }

        const res = await fetch(`${LOCALHOST_IP}/api/admin-users`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `API request failed with status ${res.status}`);
        }
        
        const data = await res.json();
        console.log('✅ USER MANAGEMENT - API Response:', data);
        
        // Handle response structure based on backend controller
        let usersData = [];
        if (data.success && data.data && data.data.users) {
          usersData = data.data.users;
        } else if (Array.isArray(data)) {
          usersData = data;
        } else {
          console.warn('⚠️ USER MANAGEMENT - Unexpected data structure:', data);
          usersData = [];
        }
        
        console.log('📊 USER MANAGEMENT - Processed users data:', {
          usersCount: usersData.length,
          dataStructure: data.success ? 'backend format' : 'array'
        });
        
        setUsers(usersData);
        setFilteredUsers(usersData);
        processChartData(usersData);
      } catch (error) {
        console.error("❌ USER MANAGEMENT - Error fetching users:", error);
        // Set empty arrays on error to prevent crashes
        setUsers([]);
        setFilteredUsers([]);
        processChartData([]);
      }
    };
    fetchUsers();
  }, []); // Empty dependency array - only runs once

  useEffect(() => {
    // Ensure users is always an array
    const usersArray = Array.isArray(users) ? users : [];
    let filtered = [...usersArray];
    if (barangayFilter !== "All") {
      filtered = filtered.filter((u) => u.barangay === barangayFilter);
    }
    if (searchText) {
      filtered = filtered.filter((u) =>
        `${u.name} ${u.email} ${u.barangay}`.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    setFilteredUsers(filtered);
  }, [searchText, barangayFilter, users]);

  const processChartData = (data) => {
    // Ensure data is always an array
    const usersArray = Array.isArray(data) ? data : [];
    console.log('📊 USER MANAGEMENT - Processing chart data:', { usersCount: usersArray.length });
    
    // Handle barangay data with null/undefined checks
    const barangayCounts = usersArray.reduce((acc, user) => {
      const barangay = user.barangay || 'Unknown';
      acc[barangay] = (acc[barangay] || 0) + 1;
      return acc;
    }, {});

    const topSorted = Object.entries(barangayCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Handle date data with proper date parsing
    const dateCounts = usersArray.reduce((acc, user) => {
      const createdAt = user.createdAt || user.created_at;
      if (createdAt) {
        const date = new Date(createdAt).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {});

    const sortedDates = Object.keys(dateCounts).sort((a, b) => new Date(a) - new Date(b));

    setBarangayData({
      labels: Object.keys(barangayCounts),
      datasets: [
        {
          label: "Users per Barangay",
          data: Object.values(barangayCounts),
          backgroundColor: Object.keys(barangayCounts).map(
            (_, i) => `hsl(${(i * 37) % 360}, 70%, 60%)`
          ),
          borderColor: "#fff",
          borderWidth: 1,
        },
      ],
    });

    setTopBarangayData({
      labels: topSorted.map(([b]) => b),
      datasets: [
        {
          label: "Top 5 Barangays",
          data: topSorted.map(([, v]) => v),
          backgroundColor: theme.palette.secondary.main,
          borderRadius: 4,
        },
      ],
    });

    setGrowthData({
      labels: sortedDates,
      datasets: [
        {
          label: "User Growth",
          data: sortedDates.map((d) => dateCounts[d]),
          borderColor: theme.palette.secondary.main,
          tension: 0.3,
          fill: true,
          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
        },
      ],
    });
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "User_Data_TrafficSlight.xlsx");
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Name", flex: 0.7 },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      renderCell: (params) => {
        if (!params.value) return 'N/A';
        const [user, domain] = params.value.split("@");
        const masked = user.slice(0, 2) + "*".repeat(user.length - 2);
        return `${masked}@${domain}`;
      },
    },
    { field: "barangay", headerName: "Barangay", flex: 0.6 },
    { field: "street", headerName: "Street", flex: 0.6 },
    { field: "city", headerName: "City", flex: 0.6 },
    { field: "isActive", headerName: "Status", flex: 0.5, 
      renderCell: (params) => (
        <span style={{ 
          color: params.value ? '#4caf50' : '#f44336',
          fontWeight: 'bold'
        }}>
          {params.value ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ];

  const uniqueBarangays = [...new Set((Array.isArray(users) ? users : []).map((u) => u.barangay))];

  return (
    <Box p="1.5rem 2.5rem" sx={{ backgroundColor: theme.palette.background.default }}>
<Header title="User Management" subtitle="Manage users"/>

      {/* Dashboard */}
      <Box mt="1.5rem" display="flex" gap="1.5rem" flexWrap="wrap">
        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            flex: 1,
            borderRadius: 2,
            backgroundColor: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.secondary.main, 0.15) 
              : alpha(theme.palette.secondary.main, 0.08),
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.secondary.main, 0.25) 
                : alpha(theme.palette.secondary.main, 0.15),
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Typography variant="h6" color="text.primary" gutterBottom sx={{ opacity: 0.9 }}>
            Total Users
          </Typography>
          <Typography variant="h3" color="secondary.main" fontWeight="bold">
            {(Array.isArray(users) ? users : []).length}
          </Typography>
        </Paper>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            flex: 1,
            borderRadius: 2,
            backgroundColor: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.secondary.main, 0.15) 
              : alpha(theme.palette.secondary.main, 0.08),
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.secondary.main, 0.25) 
                : alpha(theme.palette.secondary.main, 0.15),
              transform: 'translateY(-2px)'
            }
          }}
        >
          <Typography variant="h6" color="text.primary" gutterBottom sx={{ opacity: 0.9 }}>
            Barangays
          </Typography>
          <Typography variant="h3" color="secondary.main" fontWeight="bold">
            {uniqueBarangays.length}
          </Typography>
        </Paper>
      </Box>

      {/* Search + Filter with Export Button */}
      <Box mt="2rem" mb="1rem">
        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <TextField
            fullWidth
            label="Search users..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: alpha(theme.palette.divider, 0.2),
                },
              },
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Barangay</InputLabel>
            <Select
              value={barangayFilter}
              label="Filter by Barangay"
              onChange={(e) => setBarangayFilter(e.target.value)}
              sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: 1,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.divider, 0.2),
                },
              }}
            >
              <MenuItem value="All">All</MenuItem>
              {uniqueBarangays.map((b) => (
                <MenuItem key={b} value={b}>
                  {b}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button 
            variant="contained" 
            onClick={exportToExcel}
            sx={{
              height: 56,
              px: 3,
              fontWeight: '500',
              backgroundColor: theme.palette.secondary.main,
              whiteSpace: 'nowrap',
              '&:hover': {
                backgroundColor: theme.palette.secondary.light,
              }
            }}
          >
            Export to Excel
          </Button>
        </Box>
      </Box>

      {/* Data Table */}
      <Paper 
        elevation={3} 
        sx={{ 
          height: '65vh',
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <DataGrid
          getRowId={(row) => row._id || row.id}
          rows={filteredUsers}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          sortingOrder={["asc", "desc"]}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              color: theme.palette.text.primary,
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.secondary.main, 0.15) 
                : alpha(theme.palette.secondary.main, 0.08),
              color: theme.palette.text.primary,
              borderBottom: 'none',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.secondary.main, 0.15) 
                : alpha(theme.palette.secondary.main, 0.08),
              borderTop: 'none',
            },
          }}
        />
      </Paper>

      {/* Charts */}
      <Grid container spacing={4} mt={4}>
        {topBarangayData && (
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3,
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Typography variant="h6" mb={2} color="text.primary" fontWeight="bold">
                Top 5 Barangays
              </Typography>
              <Bar
                data={topBarangayData}
                options={{
                  responsive: true,
                  plugins: { 
                    legend: { 
                      display: false,
                      labels: {
                        color: theme.palette.text.primary
                      }
                    }
                  },
                  scales: {
                    x: {
                      ticks: { color: theme.palette.text.primary }
                    },
                    y: {
                      ticks: { color: theme.palette.text.primary }
                    }
                  }
                }}
              />
            </Paper>
          </Grid>
        )}

        {growthData && (
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3,
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}
            >
              <Typography variant="h6" mb={2} color="text.primary" fontWeight="bold">
                User Growth Over Time
              </Typography>
              <Line
                data={growthData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { 
                      display: true, 
                      position: "top",
                      labels: {
                        color: theme.palette.text.primary
                      }
                    }
                  },
                  scales: {
                    x: {
                      ticks: { color: theme.palette.text.primary }
                    },
                    y: {
                      ticks: { color: theme.palette.text.primary }
                    }
                  }
                }}
              />
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Pie Chart */}
{/* Bar Chart */}
{barangayData && (
  <Box mt={1}>
    <Paper 
      elevation={3} 
      sx={{ 
        maxWidth: "100%", 
        mx: "100", 
        p: 3,
        borderRadius: 2,
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
      }}
    >
      <Typography variant="h6" mb={2} color="text.primary" fontWeight="bold">
        Users by Barangay Distribution
      </Typography>
      <Bar 
        data={barangayData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: false, // mas formal kung walang masyadong kulay legend
            },
            title: {
              display: true,
              text: "Number of Users per Barangay",
              color: theme.palette.text.primary,
              font: { size: 14 }
            }
          },
          scales: {
            x: {
              ticks: { color: theme.palette.text.primary }
            },
            y: {
              ticks: { color: theme.palette.text.primary },
              beginAtZero: true
            }
          }
        }}
      />
    </Paper>
  </Box>
)}

    </Box>
  );
};

export default UserManagement;
