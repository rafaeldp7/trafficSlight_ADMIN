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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

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
      <IconButton color="primary" onClick={() => handleEdit(params.row)}><EditIcon /></IconButton>
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

  return (
    <Box m="1.5rem 2.5rem">
      <FlexBetween>
        <Header title="Reports Dashboard" subtitle="Manage all user reports" />
        <Button variant="contained" onClick={() => setModalOpen(true)}>+ New Report</Button>
      </FlexBetween>

      <Box mt={3} display="flex" gap={2}>
        <TextField
          fullWidth
          label="Search by description or type"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select value={typeFilter} label="Filter by Type" onChange={(e) => setTypeFilter(e.target.value)}>
            <MenuItem value="All">All</MenuItem>
            {reportTypes.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {isLoaded && (
        <Box mt={4} height="400px">
          <Typography variant="h6" mb={1}>All Reports Map Overlay</Typography>
<GoogleMap
  mapContainerStyle={{ height: "100%", width: "100%" }}
  center={defaultCenter}
  zoom={12}
  onLoad={(map) => (mapRef.current = map)} // Add this line
>

            {allReports.map((report) => (
<Marker
  key={report._id}
  position={{ lat: report.location.latitude, lng: report.location.longitude }}
  title={`${report.reportType} - ${report.description}`}
  icon={{
    url: markerIcons[report.reportType] || undefined,
    scaledSize: new window.google.maps.Size(64, 64), // 👈 Scale to 32x32 pixels
  }}
/>

            ))}
          </GoogleMap>
        </Box>
      )}

      <Box mt={4} height="60vh">
        <DataGrid
          getRowId={(row) => row._id}
          rows={filtered}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Box>

      {chartData && (
        <Grid container spacing={4} mt={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" mb={1}>Reports by Type (Bar)</Typography>
            <Bar data={chartData} options={{ plugins: { legend: { display: false } }, responsive: true }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" mb={1}>Reports by Type (Pie)</Typography>
            <Pie data={chartData} />
          </Grid>
        </Grid>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); resetForm(); }}>
        <Box sx={{ p: 3, backgroundColor: "#fff", width: 500, mx: "auto", my: "10%", borderRadius: 2 }}>
          <Typography variant="h6" mb={2}>{formData._id ? "Edit Report" : "Add New Report"}</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
              value={formData.reportType}
              label="Report Type"
              onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
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
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Latitude"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Longitude"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            sx={{ mb: 2 }}
          />
          {isLoaded && (
            <GoogleMap
              center={{ lat: parseFloat(formData.latitude) || defaultCenter.lat, lng: parseFloat(formData.longitude) || defaultCenter.lng }}
              zoom={defaultZoom}
              mapContainerStyle={{ height: "300px", width: "100%" }}
              onClick={(e) => {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                setFormData({ ...formData, latitude: lat, longitude: lng });
                setMarker({ lat, lng });
              }}
            >
              {marker && <Marker position={marker} />}
            </GoogleMap>
          )}
          <Button variant="contained" onClick={handleSubmit} fullWidth sx={{ mt: 2 }}>
            {formData._id ? "Update Report" : "Submit Report"}
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default ReportsDashboard;