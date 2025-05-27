import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Paper,
  useTheme,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
} from "@mui/material";
import { Bar, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";

Chart.register(...registerables);

const TripAnalytics = () => {
  const theme = useTheme();
  const [stats, setStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [tripTable, setTripTable] = useState([]);
  const [totalTrips, setTotalTrips] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [chartData, setChartData] = useState(null);

  const safeFixed = (value) => (typeof value === "number" ? value.toFixed(2) : "0.00");

  useEffect(() => {
    fetchOverallStats();
    fetchMonthlyStats();
    fetchPaginatedTrips(0, 5);
  }, []);

  const fetchOverallStats = async () => {
    try {
      const res = await axios.get("https://ts-backend-1-jyit.onrender.com/api/trips/analytics");
      const data = res.data;

      setStats([
        { label: "Total Trips Recorded", value: data.totalTrips },
        { label: "Total Distance Travelled", value: `${safeFixed(data.totalDistance)} km` },
        { label: "Total Time Traveled", value: `${safeFixed(data.totalTime)} mins` },
        { label: "Total Gas Consumption", value: `${safeFixed(data.totalFuel)} L` },
        { label: "Total Gas Expense", value: `₱ ${safeFixed(data.totalExpense)}` },
      ]);
    } catch (error) {
      console.error("Error fetching overall stats:", error);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      const res = await axios.get("https://ts-backend-1-jyit.onrender.com/api/trips/summary/month");
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
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
    }
  };

  const fetchPaginatedTrips = async (page, limit) => {
    try {
      const res = await axios.get(
        `https://ts-backend-1-jyit.onrender.com/api/trips/paginated?page=${page + 1}&limit=${limit}`
      );
      setTripTable(res.data.trips || []);
      setTotalTrips(res.data.totalRecords || 0);
    } catch (error) {
      console.error("Error fetching paginated trips:", error);
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
    <Box p="1.5rem 2.5rem" backgroundColor={theme.palette.primary[400]} minHeight="100vh">
      <FlexBetween>
        <Header title="Trip Analytics" />
      </FlexBetween>

      {/* Dashboard: Overall Stats */}
      <Box mt="2rem">
        <Typography variant="h6" mb={2}>OVERALL STATS</Typography>
        <Grid container spacing={3}>
          {stats.map((stat, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  textAlign: "center",
                  borderRadius: "0.75rem",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: `0 4px 20px ${theme.palette.secondary[300]}`,
                  },
                }}
              >
                <Typography variant="subtitle2" color="textSecondary">
                  {stat.label}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color={theme.palette.secondary[500]}>
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

     
      <Box mt="4rem">
        <Typography variant="h6" mb={2}>Monthly Metrics Overview</Typography>
        {chartData && (
          <Box display="flex" gap={4} flexWrap="wrap" justifyContent="center">
            <Box width={{ xs: "100%", md: "45%" }}>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: true, text: "Monthly Breakdown", font: { size: 16 } },
                  },
                }}
              />
            </Box>
            <Box width={{ xs: "100%", md: "45%" }}>
              <Line
                data={{
                  labels: chartData.labels,
                  datasets: [
                    {
                      label: "Growth Trend",
                      data: chartData.datasets[0].data,
                      borderColor: "#ff9800",
                      backgroundColor: "rgba(255,152,0,0.2)",
                      tension: 0.4,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                }}
              />
            </Box>
          </Box>
        )}
      </Box>

      {/* Paginated Trip Table */}
      <Box mt="4rem" backgroundColor={theme.palette.background.alt} borderRadius="0.75rem" p="2rem">
        <Typography variant="h6" mb={2}>Trip Records</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Motor</TableCell>
              <TableCell>Distance</TableCell>
              <TableCell>Fuel</TableCell>
              <TableCell>Expense</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tripTable.map((trip, i) => (
              <TableRow key={i}>
                <TableCell>{trip.userId?.name || "Unknown"}</TableCell>
                <TableCell>{trip.motorId?.model || "N/A"}</TableCell>
                <TableCell>{safeFixed(trip.distance)} km</TableCell>
                <TableCell>{safeFixed(trip.fuelUsed)} L</TableCell>
                <TableCell>₱ {safeFixed(trip.totalCost)}</TableCell>
                <TableCell>{trip.createdAt ? new Date(trip.createdAt).toLocaleDateString() : "-"}</TableCell>
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
        />
      </Box>
    </Box>
  );
};

export default TripAnalytics;
