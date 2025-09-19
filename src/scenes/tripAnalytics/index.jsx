import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TablePagination,
  useTheme,
  alpha,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { Bar, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import axios from "axios";
import Header from "components/Header";

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);
Chart.register(...registerables);
const API = "https://ts-backend-1-jyit.onrender.com/api/trips";

const AdminTripsDashboard = () => {
  const theme = useTheme();

  const [stats, setStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [tripTable, setTripTable] = useState([]);
  const [totalTrips, setTotalTrips] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");

  const [userIdFilter, setUserIdFilter] = useState("");
  const [reload, setReload] = useState(false);

  const safeFixed = (val) => (typeof val === "number" ? val.toFixed(2) : "0.00");

  useEffect(() => {
    fetchOverallStats();
    fetchMonthlyStats();
    fetchPaginatedTrips(page, rowsPerPage);
  }, [page, reload]);

  const fetchOverallStats = async () => {
    try {
      const res = await axios.get(`${API}/analytics/summary`);
      const data = res.data;
      setStats([
        { label: "Total Trips", value: data.totalTrips },
        // { label: "Total Distance", value: `${safeFixed(data.totalDistance)} km` },
        // { label: "Total Time", value: `${safeFixed(data.totalTime)} mins` },
        // { label: "Total Fuel", value: `${safeFixed(data.totalFuel)} L` },
        // { label: "Total Expense", value: `₱ ${safeFixed(data.totalExpense)}` },
      ]);
    } catch (err) {
      console.error("Error fetching overall stats:", err);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const res = await axios.get(`${API}/analytics/monthy`);
      const data = res.data;
      setMonthlyStats([
        { label: "Trips This Month", value: data.tripsThisMonth },
        { label: "Monthly Distance", value: safeFixed(data.monthlyDistance) },
        { label: "Monthly Fuel", value: safeFixed(data.monthlyFuel) },
        { label: "Monthly Expense", value: safeFixed(data.monthlyExpense) },
      ]);
      setChartData({
        labels: ["Trips", "Distance (km)", "Fuel (L)", "Expense (₱)"],
        datasets: [
          {
            label: "Monthly Metrics",
            data: [
              data.tripsThisMonth,
              data.monthlyDistance,
              data.monthlyFuel,
              data.monthlyExpense,
            ],
            backgroundColor: ["#2196f3", "#4caf50", "#ff9800", "#f44336"],
          },
        ],
      });
    } catch (err) {
      console.error("Error fetching monthly stats:", err);
    }
  };

  const fetchPaginatedTrips = async (page, limit) => {
  try {
    let url = `${API}/paginate?page=${page + 1}&limit=${limit}`;
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }

    const res = await axios.get(url);
    setTripTable(res.data.trips || res.data);
    setTotalTrips(res.data.totalRecords || res.data.length || 0);
  } catch (err) {
    console.error("Error fetching trips:", err);
  }
};

  const handleDelete = async (id) => {
    try {
      const res = await axios.delete(`${API}/${id}`);
      alert(res.data.msg || "Trip deleted.");
      setReload(!reload);
    } catch (err) {
      console.error("Failed to delete trip:", err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchPaginatedTrips(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newLimit = parseInt(event.target.value, 10);
    setRowsPerPage(newLimit);
    setPage(0);
    fetchPaginatedTrips(0, newLimit);
  };



  return (
    <Box p="1.5rem 2.5rem" sx={{ backgroundColor: theme.palette.background.default }} minHeight="100vh">
      <Header title="Trips Dashboard" subtitle="Analytics and trip records" />

      <Box mb={4}>
        <Typography variant="h6" mb={2} color="text.primary" fontWeight="bold">Overall Stats</Typography>
        <Grid container spacing={3}>
          {stats.map((stat, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3,
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
                <Typography 
                  variant="subtitle2" 
                  color="text.primary" 
                  gutterBottom 
                  sx={{ opacity: 0.9 }}
                >
                  {stat.label}
                </Typography>
                <Typography 
                  variant="h3" 
                  color="secondary.main" 
                  fontWeight="bold"
                >
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box mb={4}>
        <Typography variant="h6" mb={2} color="text.primary" fontWeight="bold">Monthly Metrics</Typography>
        {chartData && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              >
                <Bar data={chartData} options={{ 
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
                }} />
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              >
                <Line
                  data={{
                    labels: chartData.labels,
                    datasets: [{
                      label: "Growth",
                      data: chartData.datasets[0].data,
                      borderColor: theme.palette.secondary.main,
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      fill: true,
                      tension: 0.4,
                    }],
                  }}
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
          </Grid>
        )}
      </Box>

<Box mb={2} display="flex" gap={2} alignItems="center">
  <TextField
    label="Search trips..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    size="small"
    sx={{
      backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : theme.palette.background.paper,
      minWidth: 250
    }}
  />
  <Button 
    variant="contained" 
    onClick={() => {
      setPage(0);
      fetchPaginatedTrips(0, rowsPerPage);
    }}
  >
    Search
  </Button>
  <Button 
    variant="outlined" 
    onClick={() => {
      setSearchQuery("");
      setPage(0);
      setReload(!reload);
    }}
  >
    Clear
  </Button>
</Box>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          "& .MuiTableCell-root": {
            color: theme.palette.text.primary
          }
        }}
      >
        <Typography variant="h6" mb={3} color="text.primary" fontWeight="bold">Trip Records</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Start → Arrival</TableCell>
              <TableCell>Trip ID</TableCell>
              <TableCell>Motor</TableCell>
              {/* <TableCell>Est. Distance</TableCell> */}
              <TableCell>Distance</TableCell>

              {/* <TableCell>Duration</TableCell> */}
              {/* <TableCell>Fuel (Est / Actual)</TableCell> */}
              {/* <TableCell>Destination</TableCell> */}
              <TableCell>Status</TableCell>
              
              {/* <TableCell>Action</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {tripTable.map((trip) => (
              <TableRow 
                key={trip._id}
                sx={{
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.main, 0.1) 
                    : theme.palette.grey[50],
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.2)
                      : theme.palette.grey[100],
                    transition: 'all 0.2s ease'
                  }
                }}
              >
                <TableCell>{new Date(trip.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{dayjs(trip.timeArrived, "h:mm A").subtract(trip.duration || 0, "minute").format("h:mm A")} → {trip.timeArrived}</TableCell>
                <TableCell>{trip._id || "Unknown"}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                    {trip.motorId?.motorcycleId?.model
                      ? `${trip.motorId.motorcycleId.model} (${trip.motorId.motorcycleId.engineDisplacement}cc)`
                      : "Model N/A"}
                  </Typography>
                </TableCell>
                {/* <TableCell>{safeFixed(trip.distance)} km</TableCell> */}
                <TableCell>{safeFixed(trip.actualDistance)} km</TableCell>



                {/* <TableCell>{trip.duration} mins</TableCell> */}
                {/* <TableCell>
                  {(trip.fuelUsedMin.toFixed(2))}-{(trip.fuelUsedMax).toFixed(2)} L
                  {trip.actualFuelUsedMin && trip.actualFuelUsedMax && (
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>
                      {(trip.actualFuelUsedMin).toFixed(2)}-{(trip.actualFuelUsedMax).toFixed(2)} L
                    </Typography>
                  )}
                </TableCell> */}
                {/* <TableCell>{trip.destination}</TableCell> */}
                <TableCell>{trip.status}</TableCell>
                
                {/* <TableCell>
                  <IconButton 
                    onClick={() => handleDelete(trip._id)}
                    sx={{ 
                      color: theme.palette.error.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.1)
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalTrips}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20]}
          sx={{
            color: theme.palette.text.primary
          }}
        />
      </Paper>
    </Box>
  );
};

export default AdminTripsDashboard;
   