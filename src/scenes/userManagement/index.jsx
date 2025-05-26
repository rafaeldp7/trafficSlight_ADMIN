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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${LOCALHOST_IP}/api/auth/users`);
        const data = await res.json();
        setUsers(data);
        setFilteredUsers(data);
        processChartData(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = [...users];
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
    const barangayCounts = data.reduce((acc, user) => {
      acc[user.barangay] = (acc[user.barangay] || 0) + 1;
      return acc;
    }, {});

    const topSorted = Object.entries(barangayCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const dateCounts = data.reduce((acc, user) => {
      const date = new Date(user.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
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
          backgroundColor: "#2196f3",
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
          borderColor: "#4caf50",
          tension: 0.3,
          fill: true,
          backgroundColor: "rgba(76, 175, 80, 0.2)",
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
    saveAs(blob, "User_Data_EcoBantay.xlsx");
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "name", headerName: "Name", flex: 0.7 },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      renderCell: (params) => {
        const [user, domain] = params.value.split("@");
        const masked = user.slice(0, 2) + "*".repeat(user.length - 2);
        return `${masked}@${domain}`;
      },
    },
    { field: "barangay", headerName: "Barangay", flex: 0.6 },
    { field: "street", headerName: "Street", flex: 0.6 },
  ];

  const uniqueBarangays = [...new Set(users.map((u) => u.barangay))];

  return (
    <Box m="1.5rem 2.5rem">
      <FlexBetween>
        <Header title="User Management" />
        <Button variant="contained" onClick={exportToExcel}>
          Export to Excel
        </Button>
      </FlexBetween>

      {/* Dashboard */}
      <Box mt="1.5rem" display="flex" gap="1.5rem" flexWrap="wrap">
        <Paper sx={{ p: 2, flex: 1, textAlign: "center" }}>
          <Typography variant="h6">Total Users</Typography>
          <Typography variant="h4">{users.length}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, textAlign: "center" }}>
          <Typography variant="h6">Barangays</Typography>
          <Typography variant="h4">{uniqueBarangays.length}</Typography>
        </Paper>
      </Box>

      {/* Search + Filter */}
      <Box mt="2rem" mb="1rem" display="flex" gap={2}>
        <TextField
          fullWidth
          label="Search users..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Barangay</InputLabel>
          <Select
            value={barangayFilter}
            label="Filter by Barangay"
            onChange={(e) => setBarangayFilter(e.target.value)}
          >
            <MenuItem value="All">All</MenuItem>
            {uniqueBarangays.map((b) => (
              <MenuItem key={b} value={b}>
                {b}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Data Table */}
      <Box height="65vh">
        <DataGrid
          getRowId={(row) => row._id}
          rows={filteredUsers}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          sortingOrder={["asc", "desc"]}
        />
      </Box>

      {/* Graphs */}
{/* Charts */}
<Grid container spacing={4} mt={4}>
  {topBarangayData && (
    <Grid item xs={12} md={6}>
      <Typography variant="h6" mb={1}>
        Top 5 Barangays
      </Typography>
      <Bar
        data={topBarangayData}
        options={{
          plugins: { legend: { display: false } },
          responsive: true,
        }}
      />
    </Grid>
  )}

  {growthData && (
    <Grid item xs={12} md={6}>
      <Typography variant="h6" mb={1}>
        User Growth Over Time
      </Typography>
      <Line
        data={growthData}
        options={{
          responsive: true,
          plugins: {
            legend: { display: true, position: "top" },
          },
        }}
      />
    </Grid>
  )}
</Grid>

{/* Pie Chart placed below */}
{barangayData && (
  <Box mt={6}>
    <Typography variant="h6" mb={2}>
      Users by Barangay (Pie Chart)
    </Typography>
    <Paper sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      <Pie data={barangayData} />
    </Paper>
  </Box>
)}

    </Box>
  );
};

export default UserManagement;
