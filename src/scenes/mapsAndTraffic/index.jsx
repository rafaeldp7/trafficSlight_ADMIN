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
  Snackbar, Alert,
  
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
  

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey:
      process.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
      "AIzaSyAzFeqvqzZUO9kfLVZZOrlOwP5Fg4LpLf4",
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
    <Box p={4}>
      {/* 🔢 Metrics */}
      <Typography variant="h6" mb={1}>
        {}
      </Typography>
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
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height={500}
        >
          <CircularProgress />
        </Box>
      ) : (
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "500px" }}
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
      )}

      <Button
        variant="contained"
        onClick={() => setOpenModal(true)}
        sx={{ mt: 2 }}
      >
        + Add Gas Station
      </Button>

      {/* 📄 Pagination Lists */}
      <Box display="flex" mt={4} gap={3}>
<Paper sx={{ p: 2, flex: 1 }}>
  <Typography variant="h6">Reports</Typography>
  {currentReports.map((r, i) => (
    <Box
      key={i}
      mt={2}
      p={2}
      border="1px solid #ddd"
      borderRadius={2}
      onClick={() => zoomToLocation(r.location.latitude, r.location.longitude)}
      sx={{ cursor: "pointer", backgroundColor: "#f9f9f9" }}
    >
      <Typography variant="subtitle1">
        📝 <strong>{r.reportType}</strong>
      </Typography>

      <Typography variant="body2" mt={0.5}>
        📄 <strong>Description:</strong> {r.description}
      </Typography>

      <Typography variant="body2" mt={0.5}>
        📍 <strong>Location:</strong> {r.location.latitude}, {r.location.longitude}
      </Typography>

      <Typography variant="body2" mt={0.5}>
        🕒 <strong>Timestamp:</strong> {new Date(r.timestamp).toLocaleString()}
      </Typography>
    </Box>
  ))}

  <Pagination
    count={Math.ceil(reports.length / ITEMS_PER_PAGE)}
    page={reportPage}
    onChange={(_, val) => setReportPage(val)}
    sx={{ mt: 2 }}
  />
</Paper>


<Paper sx={{ p: 2, flex: 1 }}>
  <Typography variant="h6">Gas Stations</Typography>
  {currentStations.map((s) => (
    <Box
      key={s._id}
      ref={(el) => (stationRefs.current[s._id] = el)}
      mt={2}
      p={2}
      border="1px solid #ddd"
      borderRadius={2}
      onClick={() =>
        zoomToLocation(s.location.coordinates[1], s.location.coordinates[0])
      }
      sx={{ cursor: "pointer", backgroundColor: "#f9f9f9" }}
    >
      <Typography variant="subtitle1"><strong>{s.name}</strong> ({s.brand})</Typography>

      {s.address && (
        <Typography variant="body2" mt={0.5}>
          📍 {s.address.street}, {s.address.barangay || ""}, {s.address.city || ""}, {s.address.province || ""}
        </Typography>
      )}

      <Typography variant="body2" mt={1}>
        ⛽ <strong>Gasoline:</strong> {s.fuelPrices?.gasoline ?? "N/A"} PHP | 
        🛢️ <strong>Diesel:</strong> {s.fuelPrices?.diesel ?? "N/A"} PHP | 
        ⭐ <strong>Premium:</strong> {s.fuelPrices?.premium ?? "N/A"} PHP
      </Typography>

      <Typography variant="body2" mt={0.5}>
        🕒 <strong>Open Hours:</strong> {s.openHours || "N/A"}
      </Typography>

      <Typography variant="body2" mt={0.5}>
        🔁 <strong>Price Source:</strong> {s.priceSource} | 📅 <strong>Last Updated:</strong> {new Date(s.lastUpdated).toLocaleString()}
      </Typography>

      {s.servicesOffered?.length > 0 && (
        <Typography variant="body2" mt={0.5}>
          🛠️ <strong>Services:</strong> {s.servicesOffered.join(", ")}
        </Typography>
      )}

      <Box mt={1} display="flex" justifyContent="flex-end" gap={1}>
        <Button size="small" color="error" onClick={(e) => { e.stopPropagation(); handleEdit(s); }}>
          Edit
        </Button>
        <Button size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDelete(s._id); }}>
          Delete
        </Button>
      </Box>
    </Box>
  ))}

  <Pagination
    count={Math.ceil((stations?.length || 0) / ITEMS_PER_PAGE)}
    page={stationPage}
    onChange={(_, val) => setStationPage(val)}
    sx={{ mt: 2 }}
  />
</Paper>

      </Box>
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

      {/* ➕ Modal */}
<Modal
  open={openModal}
  onClose={() => {
    setOpenModal(false);
    setMarkerPreview(null);
    setForm({
      name: "",
      brand: "",
      gasoline: "",
      diesel: "",
      servicesOffered: [],
      openHours: "",
      lat: "",
      lng: "",
    });
    setEditingId(null);
  }}
>
  <Paper
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      p: 4,
      width: 400,
    }}
  >
    <Typography variant="h6" mb={2}>
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
    >
      {editingId ? "Update Station" : "Add Station"}
    </Button>
  </Paper>
</Modal>

      <Modal open={!!selectedMarker} onClose={() => setSelectedMarker(null)}>
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            p: 4,
            width: 400,
          }}
        >
          {selectedMarker?.type === "station" && selectedMarker?.data && (
<>
  <Typography variant="h6" mb={2}>
    Gas Station Options
  </Typography>

  <Typography mb={1}>
    <strong>{selectedMarker.data.name}</strong> — {selectedMarker.data.brand}
  </Typography>

  {selectedMarker.data.fuelPrices && (
    <Box mb={2}>
      <Typography variant="body2">
        ⛽ <strong>Gasoline:</strong>{" "}
        {selectedMarker.data.fuelPrices.gasoline ?? "N/A"} PHP
      </Typography>
      <Typography variant="body2">
        🛢️ <strong>Diesel:</strong>{" "}
        {selectedMarker.data.fuelPrices.diesel ?? "N/A"} PHP
      </Typography>
    </Box>
  )}

  <Box display="flex" justifyContent="space-between">
    <Button
      variant="contained"
      onClick={() => {
        handleEdit(selectedMarker.data);
        setSelectedMarker(null);
      }}
    >
      Edit
    </Button>
    <Button
      variant="outlined"
      color="error"
      onClick={() => {
        handleDelete(selectedMarker.data._id);
        setSelectedMarker(null);
      }}
    >
      Delete
    </Button>
  </Box>
</>

          )}

          {selectedMarker?.type === "report" && selectedMarker?.data && (
            <>
              <Typography variant="h6" mb={2}>
                Traffic Report
              </Typography>
              <Typography mb={1}>
                <strong>Type:</strong> {selectedMarker.data.reportType}
              </Typography>
              <Typography mb={2}>
                <strong>Description:</strong> {selectedMarker.data.description}
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={async () => {
                  if (!window.confirm("Delete this report?")) return;
                  await fetch(`${API}/api/reports/${selectedMarker.data._id}`, {
                    method: "DELETE",
                  });
                  fetchReports();
                  setSelectedMarker(null);
                }}
              >
                Delete Report
              </Button>
            </>
          )}
        </Paper>
      </Modal>
    </Box>
  );
};

export default MapsAndTraffic;
