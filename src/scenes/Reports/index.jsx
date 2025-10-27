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
  Alert,
  CircularProgress,
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";
import { usePermissions } from "hooks/usePermissions";
import {
  useGetReportsQuery,
  useGetArchivedReportsQuery,
  useCreateReportMutation,
  useUpdateReportMutation,
  useArchiveReportMutation,
  useVerifyReportByAdminMutation,
} from "state/api";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  InfoWindow,
  InfoBox,
  StandaloneSearchBox,
  TrafficLayer,
} from "@react-google-maps/api";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Warning,
  TrafficRounded,
  Block,
  ReportProblem,
  Search,
  Verified,
  LocationOn,
} from "@mui/icons-material";
import PlaceAutocompleteBox from "components/PlaceAutocompleteBox";
Chart.register(...registerables);

const defaultCenter = { lat: 14.7006, lng: 120.9836 };
const defaultZoom = 12;

// Static libraries array to prevent performance warnings
const GOOGLE_MAPS_LIBRARIES = ["places"];

const markerIcons = {
  Accident: "/assets/reportMarkers/accident.png",
  "Traffic Jam": "/assets/reportMarkers/traffic.png",
  "Road Closure": "/assets/reportMarkers/closure.png",
  Hazard: "/assets/reportMarkers/hazard.png",
};

// Helper function to create marker icon (copied from Gas Stations)
const getReportIcon = (reportType = "") => {
  const iconMap = {
    "Accident": "/assets/reportMarkers/accident.png",
    "Traffic Jam": "/assets/reportMarkers/traffic.png",
    "Road Closure": "/assets/reportMarkers/closure.png",
    "Hazard": "/assets/reportMarkers/hazard.png",
  };

  return {
    url: iconMap[reportType] || "/assets/reportMarkers/hazard.png",
    scaledSize: typeof window !== "undefined" && window.google
      ? new window.google.maps.Size(40, 40)
      : undefined,
  };
};

// Fallback marker icon for when custom icons fail to load
const getFallbackMarkerIcon = () => {
  if (typeof window === 'undefined' || !window.google || !window.google.maps) {
    return undefined;
  }
  
  return {
    url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
    scaledSize: new window.google.maps.Size(32, 32),
  };
};

const ReportsDashboard = () => {
  const theme = useTheme();
  const { canRead, canCreate, canUpdate, canDelete, canOnlyView, userRoleDisplay } = usePermissions();
  const { data: reportsData = [], isLoading, isError, error, refetch } = useGetReportsQuery(undefined);
  const { data: archivedData = [], isLoading: isLoadingArchived, isError: isArchivedError, error: archivedError } = useGetArchivedReportsQuery(undefined);
  
  // Separate state for markers to update independently of map
  const [markersData, setMarkersData] = useState([]);
  // Removed reportStats query due to 404 error - endpoint doesn't exist on backend

  // Update markers data when reports data changes (every 10 seconds)
  useEffect(() => {
    if (reportsData && reportsData.length > 0) {
      const activeReports = reportsData.filter((r) => r && r.archived !== true);
      setMarkersData(activeReports);
      console.log("🔄 Markers updated:", {
        totalReports: reportsData.length,
        activeReports: activeReports.length,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  }, [reportsData]);

  // Debug logging for reports data
  useEffect(() => {
    console.log("📊 Reports Data:", {
      reportsData,
      isLoading,
      isError,
      error,
      reportsCount: reportsData?.length || 0
    });
  }, [reportsData, isLoading, isError, error]);
  const [createReport] = useCreateReportMutation();
  const [updateReport] = useUpdateReportMutation();
  const [archiveReport] = useArchiveReportMutation();
  const [verifyReportByAdmin] = useVerifyReportByAdminMutation();
  const [filtered, setFiltered] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [chartData, setChartData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    _id: null,
    reportType: "",
    description: "",
    latitude: "",
    longitude: "",
    address: "",
    image: null,
  });
  const [marker, setMarker] = useState(null);
  const mapRef = useRef(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isFullWidth, setIsFullWidth] = useState(false); // Toggle between full width and 8 columns

  // Toggle between full width and sidebar layout
  const toggleLayout = () => {
    setIsFullWidth(!isFullWidth);
    // Map will automatically adjust to new container size
  };

  //ARCHIVED REPORTS
  const [archivedFiltered, setArchivedFiltered] = useState([]);

  //For search box
  const searchBoxRef = useRef(null);
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyAzFeqvqzZUO9kfLVZZOrlOwP5Fg4LpLf4",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Debug map loading
  useEffect(() => {
    console.log("🗺️ Map Loading Status:", {
      isLoaded,
      apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? 'Set' : 'Missing',
      fallbackKey: "AIzaSyAzFeqvqzZUO9kfLVZZOrlOwP5Fg4LpLf4"
    });
  }, [isLoaded]);
  const zoomToLocation = (lat, lng) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(16);
    }
  };

  // Map renders once, markers update every 10 seconds via polling
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      );
      const data = await res.json();
      if (data.status === "OK") {
        return data.results[0]?.formatted_address || "Address not found";
      }
      return "Address not found";
    } catch (err) {
      console.error("Geocoding error:", err);
      return "Error fetching address";
    }
  };

  // const { isLoaded } = useJsApiLoader({
  //   googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "AIzaSyAzFeqvqzZUO9kfLVZZOrlOwP5Fg4LpLf4",
  // });

  useEffect(() => {
    const active = (reportsData || []).filter((r) => r && r.archived !== true);
    setFiltered(active);
    processChart(active);
  }, [reportsData]);

  useEffect(() => {
    setArchivedFiltered(archivedData || []);
  }, [archivedData]);

  useEffect(() => {
    let filteredData = [...(reportsData || [])].filter((r) => r && r.archived !== true);
    if (typeFilter !== "All") {
      filteredData = filteredData.filter((r) => r.reportType === typeFilter);
    }
    if (searchText) {
      filteredData = filteredData.filter((r) =>
        `${r.description} ${r.reportType}`
          .toLowerCase()
          .includes(searchText.toLowerCase())
      );
    }
    setFiltered(filteredData);
  }, [searchText, typeFilter, reportsData]);

  // Add filtering for archived reports
  useEffect(() => {
    let filteredArchivedData = [...(archivedData || [])];
    if (typeFilter !== "All") {
      filteredArchivedData = filteredArchivedData.filter((r) => r.reportType === typeFilter);
    }
    if (searchText) {
      filteredArchivedData = filteredArchivedData.filter((r) =>
        `${r.description} ${r.reportType}`
          .toLowerCase()
          .includes(searchText.toLowerCase())
      );
    }
    setArchivedFiltered(filteredArchivedData);
  }, [searchText, typeFilter, archivedData]);

  const processChart = (data) => {
    const typeCounts = data.reduce((acc, r) => {
      acc[r.reportType] = (acc[r.reportType] || 0) + 1;
      return acc;
    }, {});
    setChartData({
      labels: Object.keys(typeCounts),
      datasets: [
        {
          label: "Number of Reports",
          data: Object.values(typeCounts),
          backgroundColor: Object.keys(typeCounts).map(
            (_, i) => `hsl(${(i * 45) % 360}, 70%, 60%)`
          ),
        },
      ],
    });
  };

  const handleSubmit = async () => {
    try {
      // Only validate ID for updates, not for new reports
      if (formData._id && (formData._id === "null" || formData._id === undefined)) {
        console.warn("Invalid report ID. Cannot update report.");
        return;
      }
      // ✅ Validation
      if (!formData.reportType) {
        alert("Please select a report type.");
        return;
      }

      if (!formData.latitude || !formData.longitude) {
        alert("Please select a location on the map.");
        return;
      }

      // ✅ Get address from coordinates
      const address = await getAddressFromCoords(
        formData.latitude,
        formData.longitude
      );

      const payload = {
        reportType: formData.reportType,
        description: formData.description,
        location: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        },
        address: address || "Unknown address",
        verified: { verifiedByAdmin: 0, verifiedByUser: 0 },
      };

      // ✅ Submit (Update or Create)
      if (formData._id) {
        await updateReport({ id: formData._id, body: payload }).unwrap();
      } else {
        await createReport(payload).unwrap();
      }

      // ✅ Close modal & refresh
      setModalOpen(false);
      resetForm();
      refetch();
    } catch (err) {
      console.error("Submit error:", err);
      alert("Something went wrong while submitting. Please try again.");
    }
  };
  const handleDelete = async (id) => {
    if (!id || id === "null") {
      console.warn("handleDelete called with invalid ID:", id);
      return;
    }

    try {
      await archiveReport(id).unwrap();
      refetch();
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
    setFormData({
      _id: null,
      reportType: "",
      description: "",
      latitude: "",
      longitude: "",
      address: "",
      image: null,
    });
    setMarker(null);
  };

const handleVerifybyAdmin = async (reportId = null) => {
  try {
    const idToUse = reportId || selectedReport?._id || formData._id;

    if (!idToUse) {
      console.warn("Invalid report ID. Cannot verify report.");
      return;
    }

    await verifyReportByAdmin({ id: idToUse, verifiedByAdmin: 1 }).unwrap();
    refetch();
    setSelectedReport(null);
  } catch (err) {
    console.error("Verify error:", err);
  }
};



  const columns = [
    { field: "_id", headerName: "Report ID", flex: 1.2 },
    { field: "reportType", headerName: "Type", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "timestamp",
      headerName: "Timestamp",
      flex: 1.2,
      valueGetter: (params) => new Date(params.value).toLocaleString(),
    },
    {
      field: "verifiedByAdmin",
      headerName: "Verified by Admin",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {params.row.verified?.verifiedByAdmin === 1 ? (
            <>
              <Verified 
                sx={{ 
                  color: theme.palette.success.main,
                  fontSize: 18 
                }} 
              />
              <Typography variant="body2" color="success.main">
                Yes
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "votes",
      headerName: "Votes",
      flex: 1,
      valueGetter: (params) => params.row.votes?.length || 0,
    },
    {
      field: "address",
      headerName: "Address",
      flex: 1,
      valueGetter: (params) => `${params.row?.address || "N/A"}`,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          {canUpdate && (
            <IconButton 
              onClick={() => handleEdit(params.row)}
              sx={{
                color: theme.palette.mode === 'dark' 
                  ? theme.palette.primary.main 
                  : theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: alpha(
                    theme.palette.mode === 'dark' 
                      ? theme.palette.primary.main 
                      : theme.palette.secondary.main,
                    0.1
                  )
                }
              }}
            >
              <EditIcon />
            </IconButton>
          )}
          {canDelete && (
            <IconButton
              onClick={() => handleDelete(params.row._id)}
              sx={{
                color: theme.palette.error.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.1)
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          )}
          <IconButton
            onClick={() =>
              zoomToLocation(
                params.row.location.latitude,
                params.row.location.longitude
              )
            }
            title="Zoom to Report"
            sx={{
              color: theme.palette.secondary.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.secondary.main, 0.1)
              }
            }}
          >
            📍
          </IconButton>
        </Box>
      ),
    },
  ];
  const archivedColumns = [
    { field: "_id", headerName: "Report ID", flex: 1.2 },
    { field: "reportType", headerName: "Type", flex: 1 },
    { field: "description", headerName: "Description", flex: 1 },
    {
      field: "timestamp",
      headerName: "Timestamp",
      flex: 1.2,
      valueGetter: (params) => new Date(params.value).toLocaleString(),
    },
    {
      field: "verifiedByAdmin",
      headerName: "Verified by Admin",
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {params.row.verified?.verifiedByAdmin === 1 ? (
            <>
              <Verified 
                sx={{ 
                  color: theme.palette.success.main,
                  fontSize: 18 
                }} 
              />
              <Typography variant="body2" color="success.main">
                Yes
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "votes",
      headerName: "Votes",
      flex: 1,
      valueGetter: (params) => params.row.votes?.length || 0,
      // valueGetter: (params) =>
      //   `${params.row?.votes }` || "N/A"
    },
    {
      field: "address",
      headerName: "Address",
      flex: 1,
      valueGetter: (params) => `${params.row?.address || "N/A"}`,
    },
    {
      field: "archived",
      headerName: "Archived",
      flex: 1,
      valueGetter: (params) => params.value ? "Yes" : "No",
    },
    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   flex: 1,
    //   sortable: false,
    //   renderCell: (params) => (
    //     <Box>
    //       <IconButton color="error" onClick={() => handleEdit(params.row)}>
    //         <EditIcon />
    //       </IconButton>
    //       <IconButton
    //         color="error"
    //         onClick={() => handleDelete(params.row._id)}
    //       >
    //         <DeleteIcon />
    //       </IconButton>
    //       <IconButton
    //         color="secondary"
    //         onClick={() =>
    //           zoomToLocation(
    //             params.row.location.latitude,
    //             params.row.location.longitude
    //           )
    //         }
    //         title="Zoom to Report"
    //       >
    //         📍
    //       </IconButton>
    //     </Box>
    //   ),
    // },
  ];

  const reportTypes = ["Accident", "Traffic Jam", "Road Closure", "Hazard"];

  const getReportTypeStats = () => {
    const stats = {
      Accident: 0,
      "Traffic Jam": 0,
      "Road Closure": 0,
      Hazard: 0,
    };
    (reportsData || []).forEach((report) => {
      if (stats.hasOwnProperty(report.reportType)) {
        stats[report.reportType]++;
      }
    });
    return stats;
  };

  // Error handling
  if (isError) {
    return (
      <Box p="1.5rem 2.5rem" sx={{ backgroundColor: theme.palette.background.default }}>
        <Header title="Reports Dashboard" />
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Failed to load reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error?.data?.message || error?.message || 'An error occurred while loading reports. Please try again.'}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => refetch()} 
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Alert>
      </Box>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Box p="1.5rem 2.5rem" sx={{ backgroundColor: theme.palette.background.default }}>
        <Header title="Reports Dashboard" />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading reports...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      p="1.5rem 2.5rem"
      sx={{ backgroundColor: theme.palette.background.default }}
    >
      {/* Header Section */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Header
              title="Reports Dashboard"
              subtitle="Monitor and manage traffic incidents and road conditions"
            />
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body2" color="text.secondary">
              {isFullWidth ? "Full Width" : "Sidebar Layout"}
            </Typography>
            <Button
              variant={isFullWidth ? "contained" : "outlined"}
              onClick={toggleLayout}
              startIcon={isFullWidth ? "📱" : "📊"}
              sx={{
                backgroundColor: isFullWidth ? theme.palette.secondary.main : 'transparent',
                borderColor: theme.palette.secondary.main,
                color: isFullWidth ? 'white' : theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                }
              }}
            >
              {isFullWidth ? "Show Sidebar" : "Full Width Map"}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Permission-based access warning */}
      {canOnlyView && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            You are logged in as <strong>{userRoleDisplay}</strong>. You have read-only access to reports.
          </Typography>
        </Alert>
      )}

      {/* Overview Section */}
      <Box mb={4}>
        <Typography variant="h5" color="text.primary" fontWeight="bold" mb={2}>
          Overview
        </Typography>
        <Box mb={3}>
          {canCreate ? (
            <Button
              variant="contained"
              onClick={() => setModalOpen(true)}
              startIcon={<EditIcon />}
              sx={{
                backgroundColor: theme.palette.secondary.main,
                "&:hover": {
                  backgroundColor: theme.palette.secondary.dark,
                },
                px: 3,
                py: 1.5,
                borderRadius: 2,
              }}
            >
              New Report
            </Button>
          ) : (
            <Alert severity="warning" sx={{ maxWidth: 400 }}>
              You don't have permission to create reports. Contact your administrator.
            </Alert>
          )}
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: 2,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.error.main, 0.15)
                    : alpha(theme.palette.error.main, 0.08),
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.error.main, 0.25)
                      : alpha(theme.palette.error.main, 0.15),
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="h6"
                    color="text.primary"
                    gutterBottom
                    sx={{ opacity: 0.9 }}
                  >
                    Accidents
                  </Typography>
                  <Typography variant="h3" color="error.main" fontWeight="bold">
                    {getReportTypeStats().Accident}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "50%",
                    backgroundColor: alpha(theme.palette.error.main, 0.2),
                  }}
                >
                  <img
                    src="/assets/reportMarkers/accident.png"
                    alt="accident marker"
                    height={50}
                    width={50}
                    style={{ objectFit: 'contain' }}
                  />
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
                height: "100%",
                borderRadius: 2,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.warning.main, 0.15)
                    : alpha(theme.palette.warning.main, 0.08),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.warning.main, 0.25)
                      : alpha(theme.palette.warning.main, 0.15),
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="h6"
                    color="text.primary"
                    gutterBottom
                    sx={{ opacity: 0.9 }}
                  >
                    Traffic Jams
                  </Typography>
                  <Typography
                    variant="h3"
                    color="warning.main"
                    fontWeight="bold"
                  >
                    {getReportTypeStats()["Traffic Jam"]}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "50%",
                    backgroundColor: alpha(theme.palette.warning.main, 0.2),
                  }}
                >
                  <img
                    src="/assets/reportMarkers/traffic.png"
                    alt="traffic marker"
                    height={50}
                    width={50}
                    style={{ objectFit: 'contain' }}
                  />
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
                height: "100%",
                borderRadius: 2,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.info.main, 0.15)
                    : alpha(theme.palette.info.main, 0.08),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.info.main, 0.25)
                      : alpha(theme.palette.info.main, 0.15),
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="h6"
                    color="text.primary"
                    gutterBottom
                    sx={{ opacity: 0.9 }}
                  >
                    Road Closures
                  </Typography>
                  <Typography variant="h3" color="info.main" fontWeight="bold">
                    {getReportTypeStats()["Road Closure"]}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "50%",
                    backgroundColor: alpha(theme.palette.info.main, 0.2),
                  }}
                >
                  <img
                    src="/assets/reportMarkers/closure.png"
                    alt="road closure marker"
                    height={50}
                    width={50}
                    style={{ objectFit: 'contain' }}
                  />
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
                height: "100%",
                borderRadius: 2,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.success.main, 0.15)
                    : alpha(theme.palette.success.main, 0.08),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.success.main, 0.25)
                      : alpha(theme.palette.success.main, 0.15),
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="h6"
                    color="text.primary"
                    gutterBottom
                    sx={{ opacity: 0.9 }}
                  >
                    Hazards
                  </Typography>
                  <Typography
                    variant="h3"
                    color="success.main"
                    fontWeight="bold"
                  >
                    {getReportTypeStats().Hazard}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "50%",
                    backgroundColor: alpha(theme.palette.success.main, 0.2),
                  }}
                >
                  <img
                    src="/assets/reportMarkers/hazard.png"
                    alt="hazard marker"
                    height={50}
                    width={50}
                    style={{ objectFit: 'contain' }}
                  />
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
              startAdornment: (
                <Search sx={{ mr: 1, color: theme.palette.text.secondary }} />
              ),
            }}
            sx={{
              backgroundColor:
                theme.palette.mode === "light"
                  ? alpha(theme.palette.common.black, 0.02)
                  : alpha(theme.palette.common.white, 0.02),
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
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
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha(theme.palette.divider, 0.2),
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.secondary.main,
                },
              }}
            >
              <MenuItem value="All">All</MenuItem>
              {reportTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Conditional Layout */}
      {isFullWidth ? (
        // Full Width Map Layout
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3,
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="text.primary" fontWeight="bold">
                  Live Map View (Full Width) - Auto Updates Every 10s
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              {/* Debug Info */}
              <Box mb={2} p={2} sx={{ backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Debug Info:</strong> Total Reports: {reportsData?.length || 0} | 
                  Active Reports: {(reportsData || []).filter((r) => r && r.archived !== true).length} | 
                  Markers: {markersData?.length || 0} |
                  With Coordinates: {markersData.filter((r) => r.location?.latitude && r.location?.longitude).length} |
                  Map Loaded: {isLoaded ? 'Yes' : 'No'} |
                  Map Ref: {mapRef.current ? 'Set' : 'Not Set'} |
                  Last Update: {new Date().toLocaleTimeString()}
                </Typography>
                {markersData.slice(0, 3).map((report, index) => (
                  <Typography key={index} variant="caption" color="text.secondary" display="block">
                    Report {index + 1}: {report.reportType} - Lat: {report.location?.latitude || 'N/A'} - Lng: {report.location?.longitude || 'N/A'}
                  </Typography>
                ))}
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  <strong>Test:</strong> Look for the test marker at center of map (14.7006, 120.9836). If you see it, the map is working.
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  <strong>Map Status:</strong> {isLoaded ? '✅ Loaded' : '❌ Loading...'} | 
                  <strong> Reports:</strong> {(reportsData || []).length} | 
                  <strong> With Coords:</strong> {(reportsData || []).filter((r) => r && r.archived !== true && r.location?.latitude && r.location?.longitude).length}
                </Typography>
              </Box>
              
              {!isLoaded ? (
                <Box 
                  display="flex" 
                  justifyContent="center" 
                  alignItems="center" 
                  height="400px"
                  flexDirection="column"
                  gap={2}
                  sx={{ backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}
                >
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary">
                    Loading Google Maps...
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    API Key: {process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? '✅ Set' : '❌ Missing'}
                  </Typography>
                </Box>
              ) : (
                <Box 
                  data-map-container
                  sx={{ height: "90vh", borderRadius: 2, overflow: 'hidden' }}
                >
                  <GoogleMap
                    center={defaultCenter}
                    zoom={12}
                    mapContainerStyle={{ height: "100%", width: "100%" }}
                    onLoad={(map) => {
                      mapRef.current = map;
                      console.log("🗺️ Google Map loaded successfully");
                      setTimeout(() => {
                        if (window.google && map) {
                          window.google.maps.event.trigger(map, 'resize');
                        }
                      }, 100);
                    }}
                    options={{
                      mapTypeControl: true,
                      streetViewControl: true,
                      fullscreenControl: true,
                      zoomControl: true,
                    }}
                  >
                    <TrafficLayer />
                    
                    {/* Render markers using Gas Stations pattern */}
                    {(reportsData || []).filter((r) => r && r.archived !== true).map((report) => (
                      <Marker
                        key={report._id}
                        position={{
                          lat: report.location?.latitude || 0,
                          lng: report.location?.longitude || 0,
                        }}
                        title={`${report.reportType} - ${report.description}`}
                        icon={getReportIcon(report.reportType)}
                        onClick={() => setSelectedReport(report)}
                        onDblClick={() => zoomToLocation(report.location?.latitude || 0, report.location?.longitude || 0)}
                      />
                    ))}

                  {selectedReport && (
                    <InfoBox
                      position={{
                        lat: selectedReport.location?.latitude || 0,
                        lng: selectedReport.location?.longitude || 0,
                      }}
                      options={{
                        closeBoxURL: "", // hides the default X
                        enableEventPropagation: true,
                      }}
                      onCloseClick={() => setSelectedReport(null)}
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
                          <h3 style={{ margin: 0 }}>{selectedReport.reportType}</h3>
                          <span
                            style={{ cursor: "pointer", fontWeight: "bold", color: "#555" }}
                            onClick={() => setSelectedReport(null)}
                          >
                            ✕
                          </span>
                        </div>

                        {/* Report Details */}
                        <p style={{ margin: "4px 0" }}>{selectedReport.address || 'No address'}</p>
                        <p style={{ margin: "4px 0" }}>
                          {selectedReport.description || 'No description'}
                        </p>
                        <p style={{ margin: "4px 0" }}>
                          Time: {selectedReport.timestamp ? new Date(selectedReport.timestamp).toLocaleString() : 'N/A'}
                        </p>
                        <p style={{ margin: "4px 0" }}>
                          Verified: {selectedReport.verified?.verifiedByAdmin === 1 ? 'Yes' : 'No'}
                        </p>

                        {/* Action Buttons */}
                        <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                          <button
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: theme.palette.info.main,
                              color: "white",
                              cursor: "pointer",
                            }}
                            onClick={() => handleEdit(selectedReport)}
                          >
                            Edit
                          </button>
                          <button
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: theme.palette.success.main,
                              color: "white",
                              cursor: "pointer",
                            }}
                            onClick={() => handleVerifybyAdmin(selectedReport._id)}
                          >
                            Verify
                          </button>
                          <button
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: theme.palette.error.main,
                              color: "white",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              if (selectedReport?._id) {
                                handleDelete(selectedReport._id);
                              }
                            }}
                          >
                            Archive
                          </button>
                        </div>
                      </div>
                    </InfoBox>
                  )}
                  </GoogleMap>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : (
        // Sidebar Layout (Original)
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
              Search Reports
            </Typography>
            <TextField
              autoComplete="off"
              fullWidth
              placeholder="Search by type or description..."
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
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={typeFilter}
                label="Filter by Type"
                onChange={(e) => setTypeFilter(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: alpha(theme.palette.divider, 0.2),
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.palette.secondary.main,
                  },
                }}
              >
                <MenuItem value="All">All</MenuItem>
                {reportTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
                Reports List
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Box>
            <Box>
              {(filtered || []).slice(0, 10).map((report) => (
                <Box 
                  key={report._id} 
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
                      src={markerIcons[report.reportType] || "/assets/reportMarkers/hazard.png"}
                      alt={report.reportType}
                      sx={{ width: 40, height: 40 }}
                    />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {report.reportType}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {report.address || 'No address available'}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {report.description || 'No description'}
                  </Typography>

                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    {report.verified?.verifiedByAdmin === 1 && (
                      <Verified 
                        sx={{ 
                          color: theme.palette.success.main,
                          fontSize: 18 
                        }} 
                        title="Verified by Admin"
                      />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {report.timestamp ? new Date(report.timestamp).toLocaleString() : 'No timestamp'}
                    </Typography>
                  </Box>

                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<LocationOn />}
                      onClick={() => zoomToLocation(report.location?.latitude || 0, report.location?.longitude || 0)}
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
                    {canUpdate && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleEdit(report)}
                        sx={{
                          borderColor: alpha(theme.palette.primary.main, 0.5),
                          color: theme.palette.primary.main,
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          }
                        }}
                      >
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(report._id)}
                        sx={{
                          borderColor: alpha(theme.palette.error.main, 0.5),
                          color: theme.palette.error.main,
                          '&:hover': {
                            borderColor: theme.palette.error.main,
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                          }
                        }}
                      >
                        Archive
                      </Button>
                    )}
                  </Box>
                </Box>
              ))}
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" color="text.primary" fontWeight="bold">
                Live Map View - Auto Updates Every 10s
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            {/* Debug Info */}
            <Box mb={2} p={2} sx={{ backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Debug Info:</strong> Total Reports: {reportsData?.length || 0} | 
                Active Reports: {(reportsData || []).filter((r) => r && r.archived !== true).length} | 
                Markers: {markersData?.length || 0} |
                With Coordinates: {markersData.filter((r) => r.location?.latitude && r.location?.longitude).length} |
                Map Loaded: {isLoaded ? 'Yes' : 'No'} |
                Map Ref: {mapRef.current ? 'Set' : 'Not Set'} |
                Last Update: {new Date().toLocaleTimeString()}
              </Typography>
              {markersData.slice(0, 3).map((report, index) => (
                <Typography key={index} variant="caption" color="text.secondary" display="block">
                  Report {index + 1}: {report.reportType} - Lat: {report.location?.latitude || 'N/A'} - Lng: {report.location?.longitude || 'N/A'}
                </Typography>
              ))}
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                <strong>Test:</strong> Look for the test marker at center of map (14.7006, 120.9836). If you see it, the map is working.
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                <strong>Map Status:</strong> {isLoaded ? '✅ Loaded' : '❌ Loading...'} | 
                <strong> Reports:</strong> {(reportsData || []).length} | 
                <strong> With Coords:</strong> {(reportsData || []).filter((r) => r && r.archived !== true && r.location?.latitude && r.location?.longitude).length}
              </Typography>
            </Box>
            {!isLoaded ? (
              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                height="400px"
                flexDirection="column"
                gap={2}
                sx={{ backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: 2 }}
              >
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                  Loading Google Maps...
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  API Key: {process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? '✅ Set' : '❌ Missing'}
                </Typography>
              </Box>
            ) : (
              <Box 
                data-map-container
                sx={{ height: "80vh", borderRadius: 2, overflow: 'hidden' }}
              >
                <GoogleMap
                  center={defaultCenter}
                  zoom={12}
                  mapContainerStyle={{ height: "100%", width: "100%" }}
                  onLoad={(map) => {
                    mapRef.current = map;
                    console.log("🗺️ Google Map loaded successfully");
                    // Trigger resize after map loads
                    setTimeout(() => {
                      if (window.google && map) {
                        window.google.maps.event.trigger(map, 'resize');
                      }
                    }, 100);
                  }}
                  options={{
                    mapTypeControl: true,
                    streetViewControl: true,
                    fullscreenControl: true,
                    zoomControl: true,
                  }}
                >
                  {/* Traffic Layer */}
                  <TrafficLayer />
                  
                  {/* Render markers using Gas Stations pattern - updates every 10 seconds */}
                  {markersData.map((report) => (
                    <Marker
                      key={report._id}
                      position={{
                        lat: report.location?.latitude || 0,
                        lng: report.location?.longitude || 0,
                      }}
                      title={`${report.reportType} - ${report.description}`}
                      icon={getReportIcon(report.reportType)}
                      onClick={() => setSelectedReport(report)}
                      onDblClick={() => zoomToLocation(report.location?.latitude || 0, report.location?.longitude || 0)}
                    />
                  ))}

                  {selectedReport && (
                    <InfoBox
                      position={{
                        lat: selectedReport.location?.latitude || 0,
                        lng: selectedReport.location?.longitude || 0,
                      }}
                      options={{
                        closeBoxURL: "", // hides the default X
                        enableEventPropagation: true,
                      }}
                      onCloseClick={() => setSelectedReport(null)}
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
                          <h3 style={{ margin: 0 }}>{selectedReport.reportType}</h3>
                          <span
                            style={{ cursor: "pointer", fontWeight: "bold", color: "#555" }}
                            onClick={() => setSelectedReport(null)}
                          >
                            ✕
                          </span>
                        </div>

                        {/* Report Details */}
                        <p style={{ margin: "4px 0" }}>{selectedReport.address || 'No address'}</p>
                        <p style={{ margin: "4px 0" }}>
                          {selectedReport.description || 'No description'}
                        </p>
                        <p style={{ margin: "4px 0" }}>
                          Time: {selectedReport.timestamp ? new Date(selectedReport.timestamp).toLocaleString() : 'N/A'}
                        </p>
                        <p style={{ margin: "4px 0" }}>
                          Verified: {selectedReport.verified?.verifiedByAdmin === 1 ? 'Yes' : 'No'}
                        </p>

                        {/* Action Buttons */}
                        <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                          <button
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: theme.palette.info.main,
                              color: "white",
                              cursor: "pointer",
                            }}
                            onClick={() => handleEdit(selectedReport)}
                          >
                            Edit
                          </button>
                          <button
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: theme.palette.success.main,
                              color: "white",
                              cursor: "pointer",
                            }}
                            onClick={() => handleVerifybyAdmin(selectedReport._id)}
                          >
                            Verify
                          </button>
                          <button
                            style={{
                              padding: "6px 12px",
                              borderRadius: "6px",
                              border: "none",
                              backgroundColor: theme.palette.error.main,
                              color: "white",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              if (selectedReport?._id) {
                                handleDelete(selectedReport._id);
                              }
                            }}
                          >
                            Archive
                          </button>
                        </div>
                      </div>
                    </InfoBox>
                  )}
                </GoogleMap>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
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
              border: "none",
              "& .MuiDataGrid-cell": {
                borderColor: alpha(theme.palette.divider, 0.1),
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.secondary.main, 0.15)
                    : alpha(theme.palette.secondary.main, 0.08),
                borderColor: alpha(theme.palette.divider, 0.1),
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
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
          <Typography
            variant="h5"
            color="text.primary"
            fontWeight="bold"
            mb={3}
          >
            Reports Analytics
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" color="text.secondary" mb={2}>
                Reports by Type (Bar)
              </Typography>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: alpha(theme.palette.background.default, 0.6),
                  borderRadius: 2,
                }}
              >
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
              <Typography variant="h6" color="text.secondary" mb={2}>
                Reports Distribution (Pie)
              </Typography>
              <Box
                sx={{
                  p: 2,
                  backgroundColor: alpha(theme.palette.background.default, 0.6),
                  borderRadius: 2,
                }}
              >
                <Pie
                  data={chartData}
                  options={{
                    plugins: {
                      legend: {
                        position: "bottom",
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
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          sx={{
            p: 4,
            width: 600,
            maxWidth: "90%",
            maxHeight: "90vh",
            overflow: "auto",
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography
            variant="h5"
            color="text.primary"
            fontWeight="bold"
            mb={3}
          >
            {formData._id ? "Edit Report" : "New Report"}
          </Typography>

          <Divider sx={{ mb: 3 }} />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel required>Report Type</InputLabel>
            <Select
              value={formData.reportType}
              label="Report Type"
              required
              onChange={(e) =>
                setFormData({ ...formData, reportType: e.target.value })
              }
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: alpha(theme.palette.divider, 0.2),
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.secondary.main,
                },
              }}
            >
              {reportTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
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
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
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
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": {
                      borderColor: theme.palette.secondary.main,
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
          {isLoaded ? (
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Search or click on the map to set location
              </Typography>

              {/* 🔍 Autocomplete Search Box */}
              {/* <StandaloneSearchBox
      onLoad={(ref) => (searchBoxRef.current = ref)}
      onPlaceChanged={() => {
        const place = searchBoxRef.current.getPlace();
        if (place && place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setFormData({ ...formData, latitude: lat, longitude: lng });
          setMarker({ lat, lng });
        }
      }}
    >
      <TextField
        fullWidth
        placeholder="Search for an address"
        variant="outlined"
        sx={{ mb: 2 }}
      />
    </StandaloneSearchBox> */}

              {/* 🗺 Map */}
              <Box sx={{ height: 300, borderRadius: 2, overflow: "hidden" }}>
                <GoogleMap
                  center={{
                    lat: parseFloat(formData.latitude) || defaultCenter.lat,
                    lng: parseFloat(formData.longitude) || defaultCenter.lng,
                  }}
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
          ) : (
            <Typography>Loading map...</Typography> // ⏳ fallback UI
          )}

          {/* 📷 Image Upload Section */}
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Upload Image (optional)
            </Typography>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{
                borderColor: alpha(theme.palette.secondary.main, 0.5),
                color: theme.palette.secondary.main,
                "&:hover": {
                  borderColor: theme.palette.secondary.main,
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                },
              }}
            >
              Choose File
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setFormData({ ...formData, image: file });
                  }
                }}
              />
            </Button>

            {/* Show preview if selected */}
            {formData.image && (
              <Box mt={2}>
                <img
                  src={URL.createObjectURL(formData.image)}
                  alt="Preview"
                  style={{
                    width: "100%",
                    maxHeight: 200,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              </Box>
            )}
          </Box>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              fullWidth
              sx={{
                py: 1.5,
                backgroundColor: theme.palette.secondary.main,
                "&:hover": {
                  backgroundColor: theme.palette.secondary.light,
                },
              }}
            >
              {formData._id ? "Update Report" : "Submit Report"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
              fullWidth
              sx={{
                py: 1.5,
                borderColor: alpha(theme.palette.secondary.main, 0.5),
                color: theme.palette.secondary.main,
                "&:hover": {
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

      {/* Archives Table */}
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
          Archives
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box height="60vh">
          <DataGrid
            getRowId={(row) => row._id}
            rows={archivedFiltered}
            columns={archivedColumns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            sx={{
              border: "none",
              "& .MuiDataGrid-cell": {
                borderColor: alpha(theme.palette.divider, 0.1),
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.secondary.main, 0.15)
                    : alpha(theme.palette.secondary.main, 0.08),
                borderColor: alpha(theme.palette.divider, 0.1),
              },
              "& .MuiDataGrid-row:hover": {
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.secondary.main, 0.1)
                    : alpha(theme.palette.secondary.main, 0.05),
              },
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default ReportsDashboard;