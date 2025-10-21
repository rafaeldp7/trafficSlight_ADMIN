import React, { useEffect, useState, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import {
  Box,
  Typography,
  Paper,
  Modal,
  Button,
  TextField,
  Pagination,
  CircularProgress,
  useTheme,
  Snackbar,
  Alert,
  alpha,
} from "@mui/material";

const API = "https://ts-backend-1-jyit.onrender.com";
const defaultCenter = { lat: 14.7006, lng: 120.9836 };
const ITEMS_PER_PAGE = 5;

console.log("API: " + API);
// Force all icons to be red
const getReportIcon = () => {
  return {
    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    scaledSize: window?.google
      ? new window.google.maps.Size(32, 32)
      : undefined,
  };
};

const getGasIcon = (brand = "") => {
  const lowerBrand = brand.toLowerCase();

  const iconMap = {
    "petron": "/assets/PETRON.png",
    "shell": "/assets/SHELL.png",
    "caltex": "/assets/CALTEX.png",
    "cleanfuel": "/assets/CLEANFUEL.png",
    "Flying": "/assets/FLYINGV.png",
    "jetti": "/assets/JETTI.png",
    "petrogazz": "/assets/PETROGAZZ.png",
    "phoenix": "/assets/PHOENIX.png",
    "rephil": "/assets/REPHIL.png",
    "seaoil": "/assets/SEAOIL.png",
    "total": "/assets/TOTAL.png",
    "unioil": "/assets/UNIOIL.png",
    "dual": "/assets/UNIOIL.png",
  };

  // Check if any key is included in the input brand
  const matchedKey = Object.keys(iconMap).find((key) =>
    lowerBrand.includes(key)
  );


  return {
    url: matchedKey ? iconMap[matchedKey] : "/assets/default.png",
    scaledSize: window?.google
      ? new window.google.maps.Size(40, 40)
      : undefined,
  };
};



const MapsAndTraffic = () => {
  const theme = useTheme();
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyAzFeqvqzZUO9kfLVZZOrlOwP5Fg4LpLf4",
    libraries: ["places"],
  });

  const [reports, setReports] = useState([]);
  const [stations, setStations] = useState([]);
  const [metrics, setMetrics] = useState({ reportCount: 0, stationCount: 0 });

  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({
  name: "",
  brand: "",
  gasoline: "",
  diesel: "",
  servicesOffered: [],
  openHours: "",
  lat: "",
  lng: "",
});
  const [editingId, setEditingId] = useState(null);
  const [markerPreview, setMarkerPreview] = useState(null);

  const [reportPage, setReportPage] = useState(1);
  const [stationPage, setStationPage] = useState(1);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const mapRef = useRef(null);
const stationRefs = useRef({});

  const [snackbar, setSnackbar] = useState({
  open: false,
  message: "",
  severity: "success", // "success", "error", "warning", "info"
});

  const showSnackbar = (message, severity = "success") => {
  setSnackbar({ open: true, message, severity });
};



  const handleMapLoad = (map) => {
    mapRef.current = map;
  };
  useEffect(() => {
    fetchReports();
    fetchStations();
  }, []);

  const zoomToLocation = (lat, lng) => {
    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      isNaN(lat) ||
      isNaN(lng)
    ) {
      console.warn("❌ Invalid location passed to zoomToLocation", {
        lat,
        lng,
      });
      return;
    }

    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(16);
    }
  };

  const fetchReports = async () => {
    const res = await fetch(`${API}/api/reports`);
    const data = await res.json();
    setReports(Array.isArray(data) ? data : []);
    setMetrics((prev) => ({ ...prev, reportCount: data.length || 0 }));
  };

  const fetchStations = async () => {
    try {
      const res = await fetch(`${API}/api/gas-stations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (!res.ok) throw new Error("Fetch failed");

      const data = await res.json();

      // Force it to fallback to empty array if invalid format
      const stationsData = Array.isArray(data)
        ? data
        : Array.isArray(data?.stations)
        ? data.stations
        : [];

      setStations(stationsData);
      setMetrics((prev) => ({
        ...prev,
        stationCount: stationsData.length,
      }));
    } catch (err) {
      console.error("🚨 Failed to fetch stations:", err);
      setStations([]); // Prevent `.map()` error
    }
  };
    useEffect(() => {
    console.log("📍 Stations fetched:", stations.length);
    stations.forEach((s, i) => {
      console.log(
        `Marker ${i + 1}: ${s.name} at [${s.location.coordinates[1]}, ${
          s.location.coordinates[0]
        }]`
      );
    });
  }, [stations]);


const handleSubmit = async () => {
  const payload = {
    name: form.name,
    brand: form.brand,
    location: { lat: parseFloat(form.lat), lng: parseFloat(form.lng) },
    openHours: form.openHours,
    servicesOffered: form.servicesOffered,
    fuelPrices: {
      gasoline: form.gasoline ? parseFloat(form.gasoline) : undefined,
      diesel: form.diesel ? parseFloat(form.diesel) : undefined,
      premium: form.premium ? parseFloat(form.premium) : undefined,
    },
  };

  const url = `${API}/api/gas-stations${editingId ? "/" + editingId : ""}`;
  const method = editingId ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Request failed");

    showSnackbar(editingId ? "Station updated!" : "Station added!", "success");

    setOpenModal(false);
    setForm({
      name: "",
      brand: "",
      gasoline: "",
      diesel: "",
      premium: "",
      servicesOffered: [],
      openHours: "",
      lat: "",
      lng: "",
    });
    setEditingId(null);
    setMarkerPreview(null);
    fetchStations();
  } catch (err) {
    console.error("❌ handleSubmit error:", err);
    showSnackbar("Failed to save station", "error");
  }
};




const handleEdit = (station) => {
  setForm({
    name: station.name,
    brand: station.brand || "",
    gasoline: station.fuelPrices?.gasoline?.toString() || "",
    diesel: station.fuelPrices?.diesel?.toString() || "",
    servicesOffered: station.servicesOffered || [],
    openHours: station.openHours || "",
    lat: station.location.coordinates[1],
    lng: station.location.coordinates[0],
  });
  setEditingId(station._id);
  setOpenModal(true);
};


const handleDelete = async (id) => {
  if (!window.confirm("Delete this station?")) return;

  try {
    const res = await fetch(`${API}/api/gas-stations/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) throw new Error("Delete failed");

    showSnackbar("Station deleted", "success");
    fetchStations();
  } catch (err) {
    console.error("❌ handleDelete error:", err);
    showSnackbar("Failed to delete station", "error");
  }
};


  const currentReports = reports.slice(
    (reportPage - 1) * ITEMS_PER_PAGE,
    reportPage * ITEMS_PER_PAGE
  );
  const currentStations = stations.slice(
    (stationPage - 1) * ITEMS_PER_PAGE,
    stationPage * ITEMS_PER_PAGE
  );



  return (
    <Box p={4} sx={{ backgroundColor: theme.palette.background.default }}>
      {/* Dashboard Overview */}
      <Typography variant="h5" mb={3} color="text.primary" fontWeight="bold">
        Dashboard Overview
      </Typography>
      <Box 
        display="flex" 
        gap={3} 
        mb={4}
        flexDirection={{ xs: 'column', md: 'row' }}
      >
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
          <Typography 
            variant="h6" 
            color="text.primary" 
            gutterBottom 
            sx={{ opacity: 0.9 }}
          >
            Total Reports
          </Typography>
          <Typography 
            variant="h3" 
            color="secondary.main" 
            fontWeight="bold"
          >
            {metrics.reportCount}
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
          <Typography 
            variant="h6" 
            color="text.primary" 
            gutterBottom 
            sx={{ opacity: 0.9 }}
          >
            Total Gas Stations
          </Typography>
          <Typography 
            variant="h3" 
            color="secondary.main" 
            fontWeight="bold"
          >
            {metrics.stationCount}
          </Typography>
        </Paper>
      </Box>

      {/* 🗺️ Google Map */}
      {!isLoaded ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={500}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper 
          }}
        >
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "500px", borderRadius: "8px" }}
            center={defaultCenter}
            zoom={13}
            onLoad={handleMapLoad}
            onClick={(e) => {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              setForm({ ...form, lat, lng });
              setMarkerPreview({ lat, lng });
            }}
          >
            {reports.map((r, i) => (
              <Marker
                key={i}
                position={{ lat: r.location.latitude, lng: r.location.longitude }}
                icon={getReportIcon()}
                onClick={() => setSelectedMarker({ type: "report", data: r })}
              />
            ))}
            {Array.isArray(stations) &&
              stations.length > 0 &&
              stations.map((s) => (
                <Marker
                  key={s._id || s.name + s.lat}
                  
                  position={{
                    lat: s.location.coordinates[1], // correct: latitude
                    lng: s.location.coordinates[0], // correct: longitude
                  }}
                  icon={getGasIcon(s.name)}
                  onClick={() => setSelectedMarker({ type: "station", data: s })}
                />
              ))}

            {markerPreview && (
              <Marker
                position={markerPreview}
                draggable
                onDragEnd={(e) => {
                  const lat = e.latLng.lat();
                  const lng = e.latLng.lng();
                  setForm({ ...form, lat, lng });
                  setMarkerPreview({ lat, lng });
                }}
              />
            )}
          </GoogleMap>
        </Paper>
      )}

      {/* Reports and Stations Lists */}
      <Box display="flex" mt={4} gap={3}>
        <Paper sx={{ p: 3, flex: 1, backgroundColor: theme.palette.background.paper }}>
          <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
            Reports
          </Typography>
          {currentReports.map((r, i) => (
            <Box
              key={i}
              mt={2}
              p={2.5}
              border={`1px solid ${theme.palette.divider}`}
              borderRadius={2}
              onClick={() => zoomToLocation(r.location.latitude, r.location.longitude)}
              sx={{
                cursor: "pointer",
                backgroundColor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.primary.main, 0.1) 
                  : theme.palette.grey[50],
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.primary.main, 0.2)
                    : theme.palette.grey[100],
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease'
                }
              }}
            >
              <Typography variant="subtitle1" color="text.primary" fontWeight="medium">
                📝 <strong>{r.reportType}</strong>
              </Typography>

              <Typography variant="body2" mt={1} color="text.primary">
                📄 <strong>Description:</strong> {r.description}
              </Typography>

              <Typography variant="body2" mt={1} color="text.primary">
                📍 <strong>Location:</strong> {r.location.latitude}, {r.location.longitude}
              </Typography>

              <Typography variant="body2" mt={1} color="text.primary">
                🕒 <strong>Timestamp:</strong> {new Date(r.timestamp).toLocaleString()}
              </Typography>
            </Box>
          ))}

          <Box mt={3} display="flex" justifyContent="center">
            <Pagination
              count={Math.ceil(reports.length / ITEMS_PER_PAGE)}
              page={reportPage}
              onChange={(_, val) => setReportPage(val)}
              color="primary"
            />
          </Box>
        </Paper>

        <Paper sx={{ p: 3, flex: 1, backgroundColor: theme.palette.background.paper }}>
          <Typography variant="h6" color="text.primary" gutterBottom fontWeight="bold">
            Gas Stations
          </Typography>
          {currentStations.map((s) => (
            <Box
              key={s._id}
              ref={(el) => (stationRefs.current[s._id] = el)}
              mt={2}
              p={2.5}
              border={`1px solid ${theme.palette.divider}`}
              borderRadius={2}
              onClick={() => zoomToLocation(s.location.coordinates[1], s.location.coordinates[0])}
              sx={{
                cursor: "pointer",
                backgroundColor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.secondary.main, 0.1) 
                  : theme.palette.grey[50],
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark'
                    ? alpha(theme.palette.secondary.main, 0.2)
                    : theme.palette.grey[100],
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease'
                }
              }}
            >
              <Typography variant="subtitle1" color="text.primary" fontWeight="medium">
                <strong>{s.name}</strong> ({s.brand})
              </Typography>

              {s.address && (
                <Typography variant="body2" mt={1} color="text.primary">
                  📍 {s.address.street}, {s.address.barangay || ""}, {s.address.city || ""}, {s.address.province || ""}
                </Typography>
              )}

              <Typography variant="body2" mt={1} color="text.primary">
                ⛽ <strong>Gasoline:</strong> {s.fuelPrices?.gasoline ?? "N/A"} PHP | 
                🛢️ <strong>Diesel:</strong> {s.fuelPrices?.diesel ?? "N/A"} PHP | 
                ⭐ <strong>Premium:</strong> {s.fuelPrices?.premium ?? "N/A"} PHP
              </Typography>

              <Typography variant="body2" mt={1} color="text.primary">
                🕒 <strong>Open Hours:</strong> {s.openHours || "N/A"}
              </Typography>

              <Typography variant="body2" mt={1} color="text.primary">
                🔁 <strong>Price Source:</strong> {s.priceSource} | 
                📅 <strong>Last Updated:</strong> {new Date(s.lastUpdated).toLocaleString()}
              </Typography>

              {s.servicesOffered?.length > 0 && (
                <Typography variant="body2" mt={1} color="text.primary">
                  🛠️ <strong>Services:</strong> {s.servicesOffered.join(", ")}
                </Typography>
              )}

              <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(s);
                  }}
                  sx={{
                    minWidth: '80px',
                    fontWeight: 'medium'
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(s._id);
                  }}
                  sx={{
                    minWidth: '80px',
                    fontWeight: 'medium'
                  }}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          ))}

          <Box mt={3} display="flex" justifyContent="center">
            <Pagination
              count={Math.ceil((stations?.length || 0) / ITEMS_PER_PAGE)}
              page={stationPage}
              onChange={(_, val) => setStationPage(val)}
              color="secondary"
            />
          </Box>
        </Paper>
      </Box>

      {/* Add Station Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenModal(true)}
        sx={{
          mt: 3,
          mb: 3,
          px: 4,
          py: 1.5,
          fontWeight: 'bold'
        }}
      >
        + Add Gas Station
      </Button>

      {/* Modals */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            p: 4,
            width: { xs: '90%', sm: 400 },
            maxHeight: '90vh',
            overflowY: 'auto',
            backgroundColor: theme.palette.background.paper
          }}
        >
          <Typography variant="h6" mb={3} color="text.primary" fontWeight="bold">
            {editingId ? "Edit Station" : "Add Station"}
          </Typography>

          <TextField
            label="Name"
            fullWidth
            sx={{ mb: 2 }}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Brand"
            fullWidth
            sx={{ mb: 2 }}
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
          />
          <TextField
            label="Gasoline Price"
            fullWidth
            sx={{ mb: 2 }}
            type="number"
            value={form.gasoline}
            onChange={(e) => setForm({ ...form, gasoline: e.target.value })}
          />
          <TextField
            label="Diesel Price"
            fullWidth
            sx={{ mb: 2 }}
            type="number"
            value={form.diesel}
            onChange={(e) => setForm({ ...form, diesel: e.target.value })}
          />
          <TextField
            label="Premium Price"
            fullWidth
            sx={{ mb: 2 }}
            type="number"
            value={form.premium}
            onChange={(e) => setForm({ ...form, premium: e.target.value })}
          />
          <TextField
            label="Open Hours"
            fullWidth
            sx={{ mb: 2 }}
            value={form.openHours}
            onChange={(e) => setForm({ ...form, openHours: e.target.value })}
          />
          <TextField
            label="Latitude"
            fullWidth
            sx={{ mb: 2 }}
            value={form.lat}
            onChange={(e) => setForm({ ...form, lat: e.target.value })}
          />
          <TextField
            label="Longitude"
            fullWidth
            sx={{ mb: 2 }}
            value={form.lng}
            onChange={(e) => setForm({ ...form, lng: e.target.value })}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{
              mt: 3,
              py: 1.5,
              fontWeight: 'bold'
            }}
          >
            {editingId ? "Update Station" : "Add Station"}
          </Button>
        </Paper>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MapsAndTraffic;
