import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader
} from "@react-google-maps/api";
import {
  Box,
  Typography,
  Paper,
  Modal,
  Button,
  TextField,
  Pagination,
  CircularProgress,
  useTheme
} from "@mui/material";

const API = "https://ts-backend-1-jyit.onrender.com";
const defaultCenter = { lat: 14.7006, lng: 120.9836 };
const ITEMS_PER_PAGE = 5;

console.log("API: " + API);
// Force all icons to be red
const getReportIcon = () => {
  return {
    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    scaledSize: window?.google ? new window.google.maps.Size(32, 32) : undefined,
  };
};

const getGasIcon = () => {
  return {
    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    scaledSize: window?.google ? new window.google.maps.Size(32, 32) : undefined,
  };
};


const MapsAndTraffic = () => {
  const theme = useTheme();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyAzFeqvqzZUO9kfLVZZOrlOwP5Fg4LpLf4",
  });

  const [reports, setReports] = useState([]);
  const [stations, setStations] = useState([]);
  const [metrics, setMetrics] = useState({ reportCount: 0, stationCount: 0 });

  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({ name: "", brand: "", lat: "", lng: "" });
  const [editingId, setEditingId] = useState(null);
  const [markerPreview, setMarkerPreview] = useState(null);

  const [reportPage, setReportPage] = useState(1);
  const [stationPage, setStationPage] = useState(1);

  useEffect(() => {
    fetchReports();
    fetchStations();
  }, []);

  const fetchReports = async () => {
    const res = await fetch(`${API}/api/reports`);
    const data = await res.json();
    setReports(Array.isArray(data) ? data : []);
    setMetrics((prev) => ({ ...prev, reportCount: data.length || 0 }));
  };

  const fetchStations = async () => {
    const res = await fetch(`${API}/api/gas-stations`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    setStations(Array.isArray(data) ? data : []);
    setMetrics((prev) => ({ ...prev, stationCount: data.length || 0 }));
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      brand: form.brand,
      location: { lat: parseFloat(form.lat), lng: parseFloat(form.lng) },
    };

    const url = `${API}/api/gas-stations${editingId ? "/" + editingId : ""}`;
    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(payload),
    });

    setOpenModal(false);
    setForm({ name: "", brand: "", lat: "", lng: "" });
    setEditingId(null);
    setMarkerPreview(null);
    fetchStations();
  };

  const handleEdit = (station) => {
    setForm({
      name: station.name,
      brand: station.brand,
      lat: station.location.lat,
      lng: station.location.lng,
    });
    setEditingId(station._id);
    setMarkerPreview({ lat: station.location.lat, lng: station.location.lng });
    setOpenModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this station?")) return;
    await fetch(`${API}/api/gas-stations/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    fetchStations();
  };

  const currentReports = reports.slice((reportPage - 1) * ITEMS_PER_PAGE, reportPage * ITEMS_PER_PAGE);
  const currentStations = stations.slice((stationPage - 1) * ITEMS_PER_PAGE, stationPage * ITEMS_PER_PAGE);

  return (
    <Box p={4}>
      {/* 🔢 Metrics */}
      <Typography variant="h6" mb={1}>{}</Typography>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Paper sx={{ p: 2, width: "49%" }}>
          <Typography variant="h6">Total Reports</Typography>
          <Typography variant="h4">{metrics.reportCount}</Typography>
        </Paper>
        <Paper sx={{ p: 2, width: "49%" }}>
          <Typography variant="h6">Total Gas Stations</Typography>
          <Typography variant="h4">{metrics.stationCount}</Typography>
        </Paper>
      </Box>

      {/* 🗺️ Google Map */}
      {!isLoaded ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={500}>
          <CircularProgress />
        </Box>
      ) : (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "500px" }}
          center={defaultCenter}
          zoom={13}
          onClick={(e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setForm({ ...form, lat, lng });
            setMarkerPreview({ lat, lng });
          }}
        >
          {reports.map((r, i) => (
            <Marker key={i} position={r.location} icon={getReportIcon()} />
          ))}
          {stations.map((s) => (
            <Marker
              key={s._id}
              position={s.location}
              icon={getGasIcon()}
              onClick={() => handleEdit(s)}
            />
          ))}
          {markerPreview && (
            <Marker position={markerPreview} draggable onDragEnd={(e) => {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              setForm({ ...form, lat, lng });
              setMarkerPreview({ lat, lng });
            }} />
          )}
        </GoogleMap>
      )}

      <Button variant="contained" onClick={() => setOpenModal(true)} sx={{ mt: 2 }}>
        + Add Gas Station
      </Button>

      {/* 📄 Pagination Lists */}
      <Box display="flex" mt={4} gap={3}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Gas Stations</Typography>
          {currentStations.map((s) => (
            <Box key={s._id} display="flex" justifyContent="space-between" mt={1}>
              <span>{s.name} — {s.brand}</span>
              <Box>
                <Button size="small" onClick={() => handleEdit(s)}>Edit</Button>
                <Button size="small" color="error" onClick={() => handleDelete(s._id)}>Delete</Button>
              </Box>
            </Box>
          ))}
          <Pagination
            count={Math.ceil(stations.length / ITEMS_PER_PAGE)}
            page={stationPage}
            onChange={(_, val) => setStationPage(val)}
            sx={{ mt: 2 }}
          />
        </Paper>

        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6">Reports</Typography>
          {currentReports.map((r, i) => (
            <Box key={i} mt={1}>
              {r.type}: {r.description}
            </Box>
          ))}
          <Pagination
            count={Math.ceil(reports.length / ITEMS_PER_PAGE)}
            page={reportPage}
            onChange={(_, val) => setReportPage(val)}
            sx={{ mt: 2 }}
          />
        </Paper>
      </Box>

      {/* ➕ Modal */}
      <Modal open={openModal} onClose={() => {
        setOpenModal(false);
        setMarkerPreview(null);
        setForm({ name: "", brand: "", lat: "", lng: "" });
        setEditingId(null);
      }}>
        <Paper sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", p: 4, width: 400 }}>
          <Typography variant="h6" mb={2}>{editingId ? "Edit Station" : "Add Station"}</Typography>
          <TextField label="Name" fullWidth sx={{ mb: 2 }} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Brand" fullWidth sx={{ mb: 2 }} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <TextField label="Latitude" fullWidth sx={{ mb: 2 }} value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
          <TextField label="Longitude" fullWidth sx={{ mb: 2 }} value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
          <Button fullWidth variant="contained" onClick={handleSubmit}>{editingId ? "Update" : "Create"}</Button>
        </Paper>
      </Modal>
    </Box>
  );
};

export default MapsAndTraffic;
