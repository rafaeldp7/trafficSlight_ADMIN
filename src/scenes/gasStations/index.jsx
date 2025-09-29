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
  useTheme,
  Divider,
  alpha,
  IconButton,
} from "@mui/material";

import { GoogleMap, Marker, useJsApiLoader, InfoWindow, InfoBox  } from "@react-google-maps/api";
import {
  Edit,
  Delete,
  LocalGasStation,
  Search,
  LocationOn,
  AccessTime,
  AttachMoney,

} from "@mui/icons-material";
import axios from "axios";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";

const defaultCenter = { lat: 14.7006, lng: 120.9836 };
const defaultZoom = 12;
const ITEMS_PER_PAGE = 3;
const API_URL = "https://ts-backend-1-jyit.onrender.com/api/gas-stations";

const getGasIcon = (brand = "") => {
  const lower = brand.toLowerCase();
  const iconMap = {
    petron: "/assets/PETRON.png",
    shell: "/assets/SHELL.png",
    caltex: "/assets/CALTEX.png",
    cleanfuel: "/assets/CLEANFUEL.png",
    flying: "/assets/FLYINGV.png",
    "flying V": "/assets/FLYINGV.png",
    jetti: "/assets/JETTI.png",
    petrogazz: "/assets/PETROGAZZ.png",
    phoenix: "/assets/PHOENIX.png",
    rephil: "/assets/REPHIL.png",
    seaoil: "/assets/SEAOIL.png",
    total: "/assets/TOTAL.png",
    unioil: "/assets/UNIOIL.png",
    dual: "/assets/UNIOIL.png",
    pryce: "/assets/PETROGAZZ.png",
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
  const theme = useTheme();
  const [stations, setStations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
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

const getStats = () => {
  return {
    totalStations: filtered.length,
    avgGasoline: (filtered.reduce((acc, s) => acc + (parseFloat(s.fuelPrices?.gasoline) || 0), 0) / filtered.length).toFixed(2),
    avgDiesel: (filtered.reduce((acc, s) => acc + (parseFloat(s.fuelPrices?.diesel) || 0), 0) / filtered.length).toFixed(2),
    avgPremium: (filtered.reduce((acc, s) => acc + (parseFloat(s.fuelPrices?.premium) || 0), 0) / filtered.length).toFixed(2),
  };
};

  return (
    <Box p="1.5rem 2.5rem" sx={{ backgroundColor: theme.palette.background.default }}>
      <Box mb={4}>
        <Header title="Gas Stations" subtitle="Monitor and manage gas station locations and fuel prices" />
      </Box>

      <Box mb={4}>
        <Typography variant="h5" color="text.primary" fontWeight="bold" mb={2}>
          Overview
        </Typography>
        <Box mb={3}>
          <Button 
            variant="contained" 
            onClick={() => {
              setForm({
                name: "",
                brand: "",
                fuelPrices: { gasoline: "", diesel: "", premium: "" },
                location: { lat: 14.7006, lng: 120.9836 },
                servicesOffered: [],
                openHours: "",
              });
              setEditId(null);
              setModalOpen(true);
            }}
            startIcon={<LocalGasStation />}
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
            Add Station
          </Button>
        </Box>

          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3,
                height: '100%',
                borderRadius: 2,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? alpha(theme.palette.primary.dark, 0.4) 
                  : alpha(theme.palette.primary.light, 0.3),
                border: `1px solid ${theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.3)
                  : alpha(theme.palette.primary.main, 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.primary.dark, 0.5) 
                    : alpha(theme.palette.primary.light, 0.4),
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ 
                    opacity: 0.9,
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.common.white
                      : theme.palette.grey[800],
                    fontWeight: 500
                  }}>
                    Total Stations
                  </Typography>
                  <Typography variant="h3" sx={{
                    color: theme.palette.mode === 'dark'
                      ? theme.palette.common.white
                      : theme.palette.primary.dark,
                    fontWeight: 600
                  }}>
                    {getStats().totalStations}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    p: 2, 
                    
                    borderRadius: '50%', 
                    backgroundColor: theme.palette.mode === 'dark'
                      ? alpha(theme.palette.common.white, 0.12)
                      : alpha(theme.palette.primary.main, 0.12)
                  }}
                >
                  <LocalGasStation sx={{ 
                    fontSize: 30, 
                    color: theme.palette.mode === 'dark'
                      ? theme.palette.common.white
                      : theme.palette.grey[800]
                  }} />
                </Box>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
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
                    Avg. Gasoline
                  </Typography>
                  <Typography variant="h3" color="success.main" fontWeight="bold">
                    ₱{getStats().avgGasoline}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    backgroundColor: alpha(theme.palette.success.main, 0.2)
                  }}
                >
                  <img src="/assets/PESOS.png" alt="PESOS Logo" width={40} height={25}/>
                </Box>
              </Box>
            </Paper>
          </Grid>
          {/* <Grid item xs={12} md={3}>
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
                    Avg. Diesel
                  </Typography>
                  <Typography variant="h3" color="warning.main" fontWeight="bold">
                    ₱{getStats().avgDiesel}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    backgroundColor: alpha(theme.palette.warning.main, 0.2)
                  }}
                >
                  <img src="/assets/PESOS.png" alt="PESOS Logo" width={40} height={25}/>
                </Box>
              </Box>
            </Paper>
          </Grid> */}
          <Grid item xs={12} md={4}>
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
                    Avg. Premium
                  </Typography>
                  <Typography variant="h3" color="info.main" fontWeight="bold">
                    ₱{getStats().avgPremium}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    backgroundColor: alpha(theme.palette.info.main, 0.2)
                  }}
                >
                  <img src="/assets/PESOS.png" alt="PESOS Logo" width={40} height={25}/>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* <Box mb={2}>
        <Typography>Total Stations: {filtered.length}</Typography>
        <Typography>Average Price: ₱{avgPrice}</Typography>
      </Box> */}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              mb: 3,
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Typography variant="h6" color="text.primary" fontWeight="bold" mb={2}>
              Search Stations
            </Typography>
            <TextField
              
              autoComplete="off"
              fullWidth
              placeholder="Search by name..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
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
          </Paper>

          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Box p={3}>
              <Typography variant="h6" color="text.primary" fontWeight="bold" mb={2}>
                Station List
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Box>
            <Box>
              {currentStations.map((s) => (
                <Box 
                  key={s._id} 
                  sx={{ 
                    p: 3,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? alpha(theme.palette.secondary.main, 0.1)
                        : alpha(theme.palette.secondary.main, 0.05),
                    }
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Box 
                      component="img" 
                      src={getGasIcon(s.name).url}
                      alt={s.brand}
                      sx={{ width: 40, height: 40 }}
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {s.name}
                      </Typography>
                        <Typography variant="body2" color="text.secondary">
                        { s.address.street || 
                        'No address available'}
                      </Typography>
                    </Box>
                  </Box>

                  <Grid container spacing={2} mb={2}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Gasoline</Typography>
                      <Typography variant="body1" color="success.main" fontWeight="bold">
                        ₱{s.fuelPrices?.gasoline || '-'}
                      </Typography>
                    </Grid>
                    {/* <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Diesel</Typography>
                      <Typography variant="body1" color="warning.main" fontWeight="bold">
                        ₱{s.fuelPrices?.diesel || '-'}
                      </Typography>
                    </Grid> */}
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">Premium</Typography>
                      <Typography variant="body1" color="info.main" fontWeight="bold">
                        ₱{s.fuelPrices?.premium || '-'}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<LocationOn />}
                      onClick={() => zoomToLocation(s.location.coordinates[1], s.location.coordinates[0])}
                      sx={{
                        borderColor: alpha(theme.palette.secondary.main, 0.5),
                        color: theme.palette.secondary.main,
                        '&:hover': {
                          borderColor: theme.palette.secondary.main,
                          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                        }
                      }}
                    >
                      View on Map
                    </Button>
                    <IconButton 
                      size="small"
                      onClick={() => handleEdit(s)}
                      sx={{ 
                        color: theme.palette.secondary.main,
                        '&:hover': { backgroundColor: alpha(theme.palette.secondary.main, 0.1) }
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => handleDelete(s._id)}
                      sx={{ 
                        color: theme.palette.error.main,
                        '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box p={2} display="flex" justifyContent="center">
              <Pagination
                count={Math.ceil(filtered.length / ITEMS_PER_PAGE)}
                page={page}
                onChange={(e, val) => setPage(val)}
                color="secondary"
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Typography variant="h6" color="text.primary" fontWeight="bold" mb={2}>
              Live Map View
            </Typography>
            <Divider sx={{ mb: 3 }} />
            {isLoaded && (
              <Box sx={{ height: "80vh", borderRadius: 2, overflow: 'hidden' }}>
  <GoogleMap
    center={defaultCenter}
    zoom={12}
    mapContainerStyle={{ height: "100%", width: "100%" }}
    onLoad={(map) => (mapRef.current = map)}
  >
    {stations.map((s) => (
      <Marker
        key={s._id}
        position={{
          lat: s.location.coordinates[1],
          lng: s.location.coordinates[0],
        }}
        title={`${s.name} - ${s.address.street}`}
        icon={getGasIcon(s.name)}
        onClick={() => setSelectedStation(s)}
        onDblClick={() => zoomToLocation(s.location.coordinates[1], s.location.coordinates[0])}
      />
    ))}

    {selectedStation && (
  <InfoBox
    position={{
      lat: selectedStation.location.coordinates[1],
      lng: selectedStation.location.coordinates[0],
    }}
    options={{
      closeBoxURL: "", // hides the default X
      enableEventPropagation: true,
    }}
    onCloseClick={() => setSelectedStation(null)}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "12px",
        borderRadius: "8px",
        boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
        minWidth: "200px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>{selectedStation.name}</h3>
        <span
          style={{ cursor: "pointer", fontWeight: "bold", color: "#555" }}
          onClick={() => setSelectedStation(null)}
        >
          ✕
        </span>
      </div>

      {/* Address */}
      <p style={{ margin: "4px 0" }}>{selectedStation.address.street}</p>

      {/* Fuel Prices */}
      <p style={{ margin: "4px 0" }}>
        Gasoline: ₱{selectedStation.fuelPrices?.gasoline || "-"}
      </p>
      <p style={{ margin: "4px 0" }}>
        Premium: ₱{selectedStation.fuelPrices?.premium || "-"}
      </p>

      {/* Edit Button */}
      <button
        style={{
          marginTop: "8px",
          padding: "6px 12px",
          borderRadius: "6px",
          border: "none",
          backgroundColor: "#1976d2",
          color: "white",
          cursor: "pointer",
        }}
        onClick={() => handleEdit(selectedStation)}
      >
        Edit
      </button>
    </div>
  </InfoBox>


          )}
        </GoogleMap>
      </Box>
      /*
              <Box sx={{ height: "80vh", borderRadius: 2, overflow: 'hidden' }}>
                <GoogleMap
                  center={defaultCenter}
                  zoom={12}
                  mapContainerStyle={{ height: "100%", width: "100%" }}
                  onLoad={(map) => (mapRef.current = map)}
                >
                  {stations.map((s) => (
                    <Marker
                      size="medium"
                      key={s._id}
                      onClick={() => {
                        zoomToLocation(s.location.coordinates[1], s.location.coordinates[0]);
                        Toast.info(`${s.name} - ${s.brand}`);
                        // toast.info(`${s.name} - ${s.brand}`);
                      }}
                      position={{
                        lat: s.location.coordinates[1],
                        lng: s.location.coordinates[0],
                      }}
                      title={`${s.name} - ${s.address.street}`}
                      icon={getGasIcon(s.name)}
                    />
                  ))}
                </GoogleMap>
              </Box>

              */
            )}
          </Paper>
        </Grid>
      </Grid>

      <Modal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)}
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
            {editId ? "Edit Gas Station" : "Add New Gas Station"}
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Station Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                fullWidth
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.secondary.main,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Brand"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                fullWidth
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.secondary.main,
                    },
                  },
                }}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" color="text.secondary" mt={2} mb={1}>
            Fuel Prices
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Gasoline (₱)"
                value={form.fuelPrices.gasoline}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fuelPrices: { ...form.fuelPrices, gasoline: e.target.value },
                  })
                }
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.secondary.main,
                    },
                  },
                }}
              />
            </Grid>
            {/* <Grid item xs={12} md={4}>
              <TextField
                label="Diesel (₱)"
                value={form.fuelPrices.diesel}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fuelPrices: { ...form.fuelPrices, diesel: e.target.value },
                  })
                }
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.secondary.main,
                    },
                  },
                }}
              />
            </Grid> */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Premium (₱)"
                value={form.fuelPrices.premium}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fuelPrices: { ...form.fuelPrices, premium: e.target.value },
                  })
                }
                fullWidth
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

          {/* <TextField
            label="Operating Hours"
            value={form.openHours}
            onChange={(e) => setForm({ ...form, openHours: e.target.value })}
            fullWidth
            sx={{
              mt: 2,
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: theme.palette.secondary.main,
                },
              },
            }}
          /> */}

          <Typography variant="subtitle1" color="text.secondary" mt={2} mb={1}>
            Location
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <TextField
                label="Latitude"
                type="number"
                value={form.location.lat}
                onChange={(e) =>
                  setForm({ ...form, location: { ...form.location, lat: parseFloat(e.target.value) } })
                }
                fullWidth
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
                label="Longitude"
                type="number"
                value={form.location.lng}
                onChange={(e) =>
                  setForm({ ...form, location: { ...form.location, lng: parseFloat(e.target.value) } })
                }
                fullWidth
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
  center={{ lat: form.location.lat, lng: form.location.lng }}
  zoom={defaultZoom}
  mapContainerStyle={{ height: "100%", width: "100%" }}
  onClick={(e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setForm({ ...form, location: { lat, lng } });
  }}
>
  {form.location.lat && form.location.lng && (
    <Marker
      position={form.location}
      icon={{
        url: "/assets/default.png", // put default.png inside /public/assets/
        scaledSize: new window.google.maps.Size(50, 50),
        anchor: new window.google.maps.Point(17, 34),
      }}
    />
  )}
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
              {editId ? "Update Station" : "Add Station"}
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => setModalOpen(false)}
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

export default GasStationsPage;
