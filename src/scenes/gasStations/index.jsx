import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Modal,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Pagination,
} from "@mui/material";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Edit, Delete } from "@mui/icons-material";
import axios from "axios";

const defaultCenter = { lat: 14.7006, lng: 120.9836 };
const ITEMS_PER_PAGE = 5;
const API_URL = "https://ts-backend-1-jyit.onrender.com/api/gas-stations";

const getGasIcon = (brand = "") => {
  const lower = brand.toLowerCase();
  const iconMap = {
    petron: "/assets/PETRON.png",
    shell: "/assets/SHELL.png",
    caltex: "/assets/CALTEX.png",
    cleanfuel: "/assets/CLEANFUEL.png",
    flying: "/assets/FLYINGV.png",
    jetti: "/assets/JETTI.png",
    petrogazz: "/assets/PETROGAZZ.png",
    phoenix: "/assets/PHOENIX.png",
    rephil: "/assets/REPHIL.png",
    seaoil: "/assets/SEAOIL.png",
    total: "/assets/TOTAL.png",
    unioil: "/assets/UNIOIL.png",
    dual: "/assets/UNIOIL.png",
  };
  const match = Object.keys(iconMap).find((key) => lower.includes(key));
  return {
    url: match ? iconMap[match] : "/assets/default.png",
    scaledSize: typeof window !== "undefined" && window.google
      ? new window.google.maps.Size(40, 40)
      : undefined,
  };
};

const GasStationsPage = () => {
  const [stations, setStations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
  name: "",
  brand: "",
  fuelPrices: { gasoline: "", diesel: "", premium: "" },
  location: { lat: 14.7006, lng: 120.9836 },
  servicesOffered: [],
  openHours: "",
});


  const mapRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyAzFeqvqzZUO9kfLVZZOrlOwP5Fg4LpLf4",
  });

  const fetchStations = () => {
    axios.get(API_URL).then((res) => {
      setStations(res.data);
      setFiltered(res.data);
    });
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleSearch = (val) => {
    setSearch(val);
    setFiltered(
      stations.filter((s) =>
        s.name.toLowerCase().includes(val.toLowerCase())
      )
    );
    setPage(1);
  };

  const zoomToLocation = (lat, lng) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(16);
    }
  };

  const currentStations = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const avgPrice = (
    filtered.reduce((acc, s) => acc + (s.price || 0), 0) / filtered.length
  ).toFixed(2);

const handleEdit = (s) => {
  setEditId(s._id);
  setForm({
    name: s.name || "",
    brand: s.brand || "",
    fuelPrices: {
      gasoline: s.fuelPrices?.gasoline?.toString() || "",
      diesel: s.fuelPrices?.diesel?.toString() || "",
      premium: s.fuelPrices?.premium?.toString() || "",
    },
    openHours: s.openHours || "",
    location: {
      lat: s.location?.coordinates?.[1] || 14.7006,
      lng: s.location?.coordinates?.[0] || 120.9836,
    },
    servicesOffered: s.servicesOffered || [],
  });
  setModalOpen(true);
};


  const handleDelete = (id) => {
    axios.delete(`${API_URL}/${id}`).then(fetchStations);
  };

const handleSubmit = () => {
  if (!form.name || !form.brand) return;

  const payload = {
    name: form.name,
    brand: form.brand,
    fuelPrices: {
      gasoline: parseFloat(form.fuelPrices.gasoline) || 0,
      diesel: parseFloat(form.fuelPrices.diesel) || 0,
      premium: parseFloat(form.fuelPrices.premium) || 0,
    },
    openHours: form.openHours,
    location: {
      lat: parseFloat(form.location.lat),
      lng: parseFloat(form.location.lng),
    },
    servicesOffered: form.servicesOffered || [],
  };

  const method = editId ? axios.put : axios.post;
  const url = editId ? `${API_URL}/${editId}` : API_URL;

  method(url, payload).then(() => {
    setModalOpen(false);
    fetchStations();
    setEditId(null);
    setForm({
      name: "",
      brand: "",
      fuelPrices: { gasoline: "", diesel: "", premium: "" },
      location: { lat: 14.7006, lng: 120.9836 },
      servicesOffered: [],
      openHours: "",
    });
  });
};


  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Gas Stations Map
      </Typography>

      <Box mb={2}>
        <Typography>Total Stations: {filtered.length}</Typography>
        <Typography>Average Price: ₱{avgPrice}</Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Search"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            fullWidth
          />

          <Button
            onClick={() => {
              setForm({ name: "", brand: "", price: "" });
              setEditId(null);
              setModalOpen(true);
            }}
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            + Add Station
          </Button>

          <Box mt={2}>
            {currentStations.map((s) => (
              <Paper key={s._id} sx={{ p: 2, mb: 1 }}>
                <Typography fontWeight="bold">{s.name}</Typography>
                <Typography>{s.brand}</Typography>
                <Typography>₱{s.price}</Typography>
                <Box mt={1} display="flex" gap={1}>
                  <Button
                    onClick={() => zoomToLocation(s.location.coordinates[1], s.location.coordinates[0])}
                  >
                    Zoom
                  </Button>
                  <Button onClick={() => handleEdit(s)}>Edit</Button>
                  <Button color="error" onClick={() => handleDelete(s._id)}>
                    Delete
                  </Button>
                </Box>
              </Paper>
            ))}
          </Box>

          <Pagination
            count={Math.ceil(filtered.length / ITEMS_PER_PAGE)}
            page={page}
            onChange={(e, val) => setPage(val)}
            sx={{ mt: 2 }}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          {isLoaded && (
            <GoogleMap
              center={defaultCenter}
              zoom={12}
              mapContainerStyle={{ height: "80vh", width: "100%" }}
              onLoad={(map) => (mapRef.current = map)}
            >
              {stations.map((s) => (
                <Marker
                  key={s._id}
                  position={{
                    lat: s.location.coordinates[1],
                    lng: s.location.coordinates[0],
                  }}
                  title={`${s.name} - ${s.brand}`}
                  icon={getGasIcon(s.brand)}
                />
              ))}
            </GoogleMap>
          )}
        </Grid>
      </Grid>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Paper sx={{ p: 3, width: 400, mx: "auto", mt: 10 }}>
          <Typography variant="h6" gutterBottom>
            {editId ? "Edit Station" : "Add Station"}
          </Typography>

          <TextField
  label="Name"
  value={form.name}
  onChange={(e) => setForm({ ...form, name: e.target.value })}
  fullWidth
  sx={{ mb: 2 }}
/>
<TextField
  label="Brand"
  value={form.brand}
  onChange={(e) => setForm({ ...form, brand: e.target.value })}
  fullWidth
  sx={{ mb: 2 }}
/>

<Typography variant="subtitle2">Fuel Prices (₱)</Typography>
<TextField
  label="Gasoline"
  value={form.fuelPrices.gasoline}
  onChange={(e) =>
    setForm({
      ...form,
      fuelPrices: { ...form.fuelPrices, gasoline: e.target.value },
    })
  }
  fullWidth
  sx={{ mb: 1 }}
/>
<TextField
  label="Diesel"
  value={form.fuelPrices.diesel}
  onChange={(e) =>
    setForm({
      ...form,
      fuelPrices: { ...form.fuelPrices, diesel: e.target.value },
    })
  }
  fullWidth
  sx={{ mb: 1 }}
/>
<TextField
  label="Premium"
  value={form.fuelPrices.premium}
  onChange={(e) =>
    setForm({
      ...form,
      fuelPrices: { ...form.fuelPrices, premium: e.target.value },
    })
  }
  fullWidth
  sx={{ mb: 2 }}
/>

<TextField
  label="Open Hours"
  value={form.openHours}
  onChange={(e) => setForm({ ...form, openHours: e.target.value })}
  fullWidth
  sx={{ mb: 2 }}
/>

<TextField
  label="Latitude"
  type="number"
  value={form.location.lat}
  onChange={(e) =>
    setForm({ ...form, location: { ...form.location, lat: parseFloat(e.target.value) } })
  }
  fullWidth
  sx={{ mb: 1 }}
/>
<TextField
  label="Longitude"
  type="number"
  value={form.location.lng}
  onChange={(e) =>
    setForm({ ...form, location: { ...form.location, lng: parseFloat(e.target.value) } })
  }
  fullWidth
  sx={{ mb: 2 }}
/>

          <Button variant="contained" onClick={handleSubmit} fullWidth>
            {editId ? "Update" : "Submit"}
          </Button>
        </Paper>
      </Modal>
    </Box>
  );
};

export default GasStationsPage;
