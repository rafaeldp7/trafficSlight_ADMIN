import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Modal,
  IconButton,
  useTheme,
  Divider,
  alpha,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Warning, TrafficRounded, Block, ReportProblem, Search } from "@mui/icons-material";

Chart.register(...registerables);

const API_BASE = "https://ts-backend-1-jyit.onrender.com/api/reports";
const defaultCenter = { lat: 14.7006, lng: 120.9836 };
const defaultZoom = 12;

const markerIcons = {
  "Accident": "/assets/reportMarkers/accident.png",
  "Traffic Jam": "/assets/reportMarkers/traffic.png",
  "Road Closure": "/assets/reportMarkers/closure.png",
  "Hazard": "/assets/reportMarkers/hazard.png",
};

const ReportsDashboard = () => {
  const theme = useTheme();
  const [reports, setReports] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [chartData, setChartData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ _id: null, reportType: "", description: "", latitude: "", longitude: "" });
  const [marker, setMarker] = useState(null);
  const mapRef = useRef(null);


  const zoomToLocation = (lat, lng) => {
  if (mapRef.current) {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(16);
  }
};

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyAzFeqvqzZUO9kfLVZZOrlOwP5Fg4LpLf4",
  });

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE}`);
      let data = await res.json();
      data = data.filter((r) => r.reportType !== "Police");
      setReports(data);
      setAllReports(data);
      setFiltered(data);
      processChart(data);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  useEffect(() => {
    let filteredData = [...reports];
    if (typeFilter !== "All") {
      filteredData = filteredData.filter((r) => r.reportType === typeFilter);
    }
    if (searchText) {
      filteredData = filteredData.filter((r) =>
        `${r.description} ${r.reportType}`.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    setFiltered(filteredData);
  }, [searchText, typeFilter, reports]);

  const processChart = (data) => {
    const typeCounts = data.reduce((acc, r) => {
      acc[r.reportType] = (acc[r.reportType] || 0) + 1;
      return acc;
    }, {});
    setChartData({
      labels: Object.keys(typeCounts),
      datasets: [{
        label: "Number of Reports",
        data: Object.values(typeCounts),
        backgroundColor: Object.keys(typeCounts).map((_, i) => `hsl(${(i * 45) % 360}, 70%, 60%)`),
      }],
    });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        reportType: formData.reportType,
        description: formData.description,
        location: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        },
      };
      if (formData._id) {
        await fetch(`${API_BASE}/${formData._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch(API_BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      resetForm();
      fetchReports();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      fetchReports();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEdit = (row) => {
    setFormData({
      _id: row._id,
      reportType: row.reportType,
      description: row.description,
      latitude: row.location.latitude,
      longitude: row.location.longitude,
    });
    setMarker({ lat: row.location.latitude, lng: row.location.longitude });
    setModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ _id: null, reportType: "", description: "", latitude: "", longitude: "" });
    setMarker(null);
  };

  const columns = [
    { field: "reportType", headerName: "Type", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "timestamp",
      headerName: "Timestamp",
      flex: 1.2,
      valueGetter: (params) => new Date(params.value).toLocaleString(),
    },
    {
      field: "location",
      headerName: "Location",
      flex: 1,
      valueGetter: (params) => `Lat: ${params.value.latitude}, Lng: ${params.value.longitude}`,
    },
{
  field: "actions",
  headerName: "Actions",
  flex: 1,
  sortable: false,
  renderCell: (params) => (
    <Box>
      <IconButton color="error" onClick={() => handleEdit(params.row)}><EditIcon /></IconButton>
      <IconButton color="error" onClick={() => handleDelete(params.row._id)}><DeleteIcon /></IconButton>
      <IconButton
        color="secondary"
        onClick={() =>
          zoomToLocation(params.row.location.latitude, params.row.location.longitude)
        }
        title="Zoom to Report"
      >
        📍
      </IconButton>
    </Box>
  ),
},

  ];

  const reportTypes = ["Accident", "Traffic Jam", "Road Closure", "Hazard"];

  const getReportTypeStats = () => {
    const stats = {
      Accident: 0,
      "Traffic Jam": 0,
      "Road Closure": 0,
      Hazard: 0,
    };
    reports.forEach(report => {
      if (stats.hasOwnProperty(report.reportType)) {
        stats[report.reportType]++;
      }
    });
    return stats;
  };

  return (
    <Box p="1.5rem 2.5rem" sx={{ backgroundColor: theme.palette.background.default }}>
      {/* Header Section */}
      <Box mb={4}>
        <FlexBetween>
          <Box>
            <Header title="Reports Dashboard" />
            <Typography variant="subtitle1" color="text.secondary" mt={1}>
              Monitor and manage traffic incidents and road conditions
            </Typography>
          </Box>
        </FlexBetween>
      </Box>

      {/* Overview Section */}
      <Box mb={4}>
        <Typography variant="h5" color="text.primary" fontWeight="bold" mb={2}>
          Overview
        </Typography>
        <Box mb={3}>
          <Button 
            variant="contained" 
            onClick={() => setModalOpen(true)}
            startIcon={<EditIcon />}
            sx={{
              backgroundColor: theme.palette.secondary.main,
              '&:hover': {
                backgroundColor: theme.palette.secondary.dark,
              },
              px: 3,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            New Report
          </Button>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3,
                height: '100%',
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.error.main, 0.15) 
                  : alpha(theme.palette.error.main, 0.08),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.error.main, 0.25) 
                    : alpha(theme.palette.error.main, 0.15),
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.primary" gutterBottom sx={{ opacity: 0.9 }}>
                    Accidents
                  </Typography>
                  <Typography variant="h3" color="error.main" fontWeight="bold">
                    {getReportTypeStats().Accident}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    p: 1, 
                    borderRadius: '50%', 
                    backgroundColor: alpha(theme.palette.error.main, 0.2)
                  }}
                >

                  <img src="/assets/reportMarkers/accident.png" alt="accident marker" height={"50%"} width={50} />
                  {/* <Warning sx={{ fontSize: 30, color: theme.palette.error.main }} /> */}
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3,
                height: '100%',
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.warning.main, 0.15) 
                  : alpha(theme.palette.warning.main, 0.08),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.warning.main, 0.25) 
                    : alpha(theme.palette.warning.main, 0.15),
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.primary" gutterBottom sx={{ opacity: 0.9 }}>
                    Traffic Jams
                  </Typography>
                  <Typography variant="h3" color="warning.main" fontWeight="bold">
                    {getReportTypeStats()["Traffic Jam"]}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    p: 1, 
                    borderRadius: '50%', 
                    backgroundColor: alpha(theme.palette.warning.main, 0.2)
                  }}
                >
                  <img src="/assets/reportMarkers/traffic.png" alt="traffuc marker" height={"50%"} width={50} />
                  {/* <TrafficRounded sx={{ fontSize: 30, color: theme.palette.warning.main }} /> */}
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3,
                height: '100%',
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.info.main, 0.15) 
                  : alpha(theme.palette.info.main, 0.08),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.info.main, 0.25) 
                    : alpha(theme.palette.info.main, 0.15),
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.primary" gutterBottom sx={{ opacity: 0.9 }}>
                    Road Closures
                  </Typography>
                  <Typography variant="h3" color="info.main" fontWeight="bold">
                    {getReportTypeStats()["Road Closure"]}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    p: 1, 
                    borderRadius: '50%', 
                    backgroundColor: alpha(theme.palette.info.main, 0.2)
                  }}
                >
                  <img src="/assets/reportMarkers/closure.png" alt="road closure marker" height={"50%"} width={50} />
                  {/* <Block sx={{ fontSize: 30, color: theme.palette.info.main }} /> */}
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3,
                height: '100%',
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.success.main, 0.15) 
                  : alpha(theme.palette.success.main, 0.08),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.success.main, 0.25) 
                    : alpha(theme.palette.success.main, 0.15),
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" color="text.primary" gutterBottom sx={{ opacity: 0.9 }}>
                    Hazards
                  </Typography>
                  <Typography variant="h3" color="success.main" fontWeight="bold">
                    {getReportTypeStats().Hazard}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    p: 1, 
                    borderRadius: '50%', 
                    backgroundColor: alpha(theme.palette.success.main, 0.2)
                  }}
                >
                  <img src="/assets/reportMarkers/hazard.png" alt="hazard marker" height={"50%"} width={50} />
                  {/* <ReportProblem sx={{ fontSize: 30, color: theme.palette.success.main }} /> */}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Search and Filter Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3,
          mb: 4,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box display="flex" gap={2}>
          <TextField
            fullWidth
            placeholder="Search reports..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: theme.palette.text.secondary }} />,
            }}
            sx={{
              backgroundColor: theme.palette.mode === 'light' 
                ? alpha(theme.palette.common.black, 0.02)
                : alpha(theme.palette.common.white, 0.02),
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: theme.palette.secondary.main,
                },
              },
            }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select 
              value={typeFilter} 
              label="Filter by Type" 
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.divider, 0.2),
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.secondary.main,
                },
              }}
            >
              <MenuItem value="All">All</MenuItem>
              {reportTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Map Section */}
      {isLoaded && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            mb: 4,
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="h5" color="text.primary" fontWeight="bold" mb={3}>
            Live Map View
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box height="400px">
            <GoogleMap
              mapContainerStyle={{ height: "100%", width: "100%", borderRadius: 8 }}
              center={defaultCenter}
              zoom={12}
              onLoad={(map) => (mapRef.current = map)}
            >
              {allReports.map((report) => (
                <Marker
                  key={report._id}
                  position={{ lat: report.location.latitude, lng: report.location.longitude }}
                  title={`${report.reportType} - ${report.description}`}
                  icon={{
                    url: markerIcons[report.reportType] || undefined,
                    scaledSize: new window.google.maps.Size(64, 64),
                  }}
                />
              ))}
            </GoogleMap>
          </Box>
        </Paper>
      )}

      {/* Reports Table */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3,
          mb: 4,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Typography variant="h5" color="text.primary" fontWeight="bold" mb={3}>
          All Reports
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box height="60vh">
          <DataGrid
            getRowId={(row) => row._id}
            rows={filtered}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderColor: alpha(theme.palette.divider, 0.1),
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.secondary.main, 0.15)
                  : alpha(theme.palette.secondary.main, 0.08),
                borderColor: alpha(theme.palette.divider, 0.1),
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.secondary.main, 0.1)
                  : alpha(theme.palette.secondary.main, 0.05),
              },
            }}
          />
        </Box>
      </Paper>

      {/* Charts Section */}
      {chartData && (
        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            mb: 4,
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="h5" color="text.primary" fontWeight="bold" mb={3}>
            Reports Analytics
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color="text.secondary" mb={2}>Reports by Type (Bar)</Typography>
              <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.background.default, 0.6), borderRadius: 2 }}>
                <Bar 
                  data={chartData} 
                  options={{ 
                    plugins: { 
                      legend: { display: false },
                    }, 
                    responsive: true,
                    scales: {
                      y: {
                        grid: {
                          color: alpha(theme.palette.divider, 0.1),
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }} 
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color="text.secondary" mb={2}>Reports Distribution (Pie)</Typography>
              <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.background.default, 0.6), borderRadius: 2 }}>
                <Pie 
                  data={chartData}
                  options={{
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 20,
                          color: theme.palette.text.primary,
                        },
                      },
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Modal Form */}
      <Modal 
        open={modalOpen} 
        onClose={() => { setModalOpen(false); resetForm(); }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          sx={{ 
            p: 4,
            width: 600,
            maxWidth: '90%',
            maxHeight: '90vh',
            overflow: 'auto',
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography variant="h5" color="text.primary" fontWeight="bold" mb={3}>
            {formData._id ? "Edit Report" : "New Report"}
            
            <Button variant="h5" color="text.primary" fontWeight="bold" mb={3}>
              Verify
            </Button>
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={formData.reportType}
              label="Report Type"
              onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.divider, 0.2),
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.secondary.main,
                },
              }}
            >
              {reportTypes.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: theme.palette.secondary.main,
                },
              },
            }}
          />
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Latitude"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.secondary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Longitude"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.secondary.main,
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
          {isLoaded && (
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Click on the map to set location
              </Typography>
              <Box sx={{ height: 300, borderRadius: 2, overflow: 'hidden' }}>
                <GoogleMap
                  center={{ lat: parseFloat(formData.latitude) || defaultCenter.lat, lng: parseFloat(formData.longitude) || defaultCenter.lng }}
                  zoom={defaultZoom}
                  mapContainerStyle={{ height: "100%", width: "100%" }}
                  onClick={(e) => {
                    const lat = e.latLng.lat();
                    const lng = e.latLng.lng();
                    setFormData({ ...formData, latitude: lat, longitude: lng });
                    setMarker({ lat, lng });
                  }}
                >
                  {marker && <Marker position={marker} />}
                </GoogleMap>
              </Box>
            </Box>
          )}
          <Box display="flex" gap={2}>
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              fullWidth
              sx={{
                py: 1.5,
                backgroundColor: theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: theme.palette.secondary.dark,
                },
              }}
            >
              {formData._id ? "Update Report" : "Submit Report"}
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => { setModalOpen(false); resetForm(); }}
              fullWidth
              sx={{
                py: 1.5,
                borderColor: alpha(theme.palette.secondary.main, 0.5),
                color: theme.palette.secondary.main,
                '&:hover': {
                  borderColor: theme.palette.secondary.main,
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                },
              }}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
};

export default ReportsDashboard;