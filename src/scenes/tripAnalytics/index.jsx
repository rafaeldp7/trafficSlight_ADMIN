import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box, Typography, Grid, Paper, useTheme,
  Table, TableHead, TableRow, TableCell, TableBody, TablePagination,
  TextField, MenuItem, Button
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { Bar, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";

Chart.register(...registerables);

// ✅ Helper to safely format numbers
const formatNumber = (value, unit = "") =>
  typeof value === "number" ? `${value.toFixed(2)}${unit}` : `0.00${unit}`;

const TripAnalytics = () => {
  const theme = useTheme();
  const [stats, setStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [tripTable, setTripTable] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [efficiencyData, setEfficiencyData] = useState(null);
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState("All");
  const [startDate, setStartDate] = useState(dayjs().startOf("month"));
  const [endDate, setEndDate] = useState(dayjs());
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalTrips, setTotalTrips] = useState(0);

  useEffect(() => {
    fetchOverallStats();
    fetchMonthlyStats();
    fetchUsers();
    fetchFilteredTrips();
  }, []);

  useEffect(() => {
    fetchFilteredTrips();
  }, [startDate, endDate, userFilter, page, rowsPerPage]);

  const fetchOverallStats = async () => {
    try {
      const res = await axios.get("https://ts-backend-1-jyit.onrender.com/api/trips/analytics");
      const data = res.data;
      setStats([
        { label: "Total Trips", value: data.totalTrips },
        { label: "Distance Traveled", value: formatNumber(data.totalDistance, " km") },
        { label: "Total Time", value: formatNumber(data.totalTime, " mins") },
        { label: "Total Fuel", value: formatNumber(data.totalFuel, " L") },
        { label: "Total Expense", value: formatNumber(data.totalExpense, "₱ ") },
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
        { label: "Monthly Distance", value: formatNumber(data.monthlyDistance, " km") },
        { label: "Monthly Fuel", value: formatNumber(data.monthlyFuel, " L") },
        { label: "Monthly Expense", value: formatNumber(data.monthlyExpense, "₱ ") },
      ]);

      setChartData({
        labels: ["Trips", "Distance (km)", "Fuel (L)", "Expense (₱)"],
        datasets: [{
          label: "Monthly Metrics",
          data: [
            data.tripsThisMonth,
            data.monthlyDistance,
            data.monthlyFuel,
            data.monthlyExpense,
          ],
          backgroundColor: ["#2196f3", "#4caf50", "#ff9800", "#f44336"],
        }],
      });
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get("https://ts-backend-1-jyit.onrender.com/api/auth/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchFilteredTrips = async () => {
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
      };
      if (userFilter !== "All") {
        params.userId = userFilter;
      }

      const res = await axios.get("https://ts-backend-1-jyit.onrender.com/api/trips/paginated", { params });
      setTripTable(res.data.trips || []);
      setTotalTrips(res.data.totalCount || 0);

      // Fuel Efficiency = distance / fuelUsed
      const efficiency = res.data.trips.map((trip) => ({
        id: trip._id,
        label: `${trip.user?.name || "User"} - ${trip.motor?.model || "Motor"}`,
        value:
          typeof trip.distance === "number" && trip.fuelUsed > 0
            ? (trip.distance / trip.fuelUsed).toFixed(2)
            : 0,
      }));

      setEfficiencyData({
        labels: efficiency.map((e) => e.label),
        datasets: [{
          label: "Fuel Efficiency (km/L)",
          data: efficiency.map((e) => e.value),
          backgroundColor: "#00acc1",
        }],
      });
    } catch (error) {
      console.error("Error fetching filtered trips:", error);
    }
  };

  const handleExport = () => {
    const sheet = XLSX.utils.json_to_sheet(tripTable);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Trips");
    const buffer = XLSX.write(book, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "Trip_Data.xlsx");
  };

  return (
    <Box p="1.5rem 2.5rem" backgroundColor={theme.palette.primary[400]} minHeight="100vh">
      <FlexBetween>
        <Header title="Trip Analytics" />
        <Button variant="contained" onClick={handleExport}>Export Excel</Button>
      </FlexBetween>

      {/* Dashboard */}
      <Box mt="2rem">
        <Grid container spacing={2}>
          {stats.map((stat, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Paper sx={{ p: 2, textAlign: "center", borderRadius: "0.75rem" }}>
                <Typography variant="subtitle2">{stat.label}</Typography>
                <Typography variant="h5" color={theme.palette.secondary[500]}>
                  {stat.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Filters */}
      <Box mt={4} display="flex" gap={2} flexWrap="wrap" alignItems="center">
        <DatePicker label="Start Date" value={startDate} onChange={(newValue) => setStartDate(newValue)} />
        <DatePicker label="End Date" value={endDate} onChange={(newValue) => setEndDate(newValue)} />
        <TextField
          select
          label="Filter by User"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="All">All Users</MenuItem>
          {users.map((u) => (
            <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Charts */}
      <Box mt={4}>
        <Grid container spacing={4}>
          {chartData && (
            <Grid item xs={12} md={6}>
              <Bar data={chartData} options={{ plugins: { legend: { display: false } } }} />
            </Grid>
          )}
          {efficiencyData && (
            <Grid item xs={12} md={6}>
              <Typography variant="h6" mb={1}>Fuel Efficiency per Trip</Typography>
              <Bar
                data={efficiencyData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { title: { display: true, text: "km/L" } },
                  },
                }}
              />
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Table */}
      <Box mt={5} backgroundColor={theme.palette.background.alt} borderRadius="0.75rem" p="2rem">
        <Typography variant="h6" mb={2}>Trip Records</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Motor</TableCell>
              <TableCell>Distance</TableCell>
              <TableCell>Fuel Used</TableCell>
              <TableCell>Expense</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tripTable.map((trip, i) => (
              <TableRow key={i}>
                <TableCell>{trip.user?.name || "Unknown"}</TableCell>
                <TableCell>{trip.motor?.model || "N/A"}</TableCell>
                <TableCell>{formatNumber(trip.distance, " km")}</TableCell>
                <TableCell>{formatNumber(trip.fuelUsed, " L")}</TableCell>
                <TableCell>{formatNumber(trip.totalCost, "₱ ")}</TableCell>
                <TableCell>{new Date(trip.date).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={totalTrips}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Box>
    </Box>
  );
};

export default TripAnalytics;
