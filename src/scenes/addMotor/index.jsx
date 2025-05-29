import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  useTheme,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  InputAdornment,
  Divider,
  TablePagination,
  Collapse,
  alpha,
  Grid,
} from "@mui/material";
import { Delete, Edit, Search, Restore, ExpandLess, ExpandMore, TwoWheeler, Speed, LocalGasStation } from "@mui/icons-material";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";

const AddMotor = () => {
  const theme = useTheme();
  const API_URL = "https://ts-backend-1-jyit.onrender.com/api/motorcycles";

  const [formData, setFormData] = useState({
    model: "",
    engineDisplacement: "",
    power: "",
    torque: "",
    fuelTank: "",
    fuelConsumption: "",
  });

  const [motors, setMotors] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pageActive, setPageActive] = useState(0);
  const [rowsPerPageActive, setRowsPerPageActive] = useState(5);
  const [pageDeleted, setPageDeleted] = useState(0);
  const [rowsPerPageDeleted, setRowsPerPageDeleted] = useState(5);
  const [showDashboard, setShowDashboard] = useState(true);

  const fetchMotors = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setMotors(data);
    } catch (err) {
      console.error("Failed to fetch motorcycles:", err);
    }
  };

  useEffect(() => {
    fetchMotors();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      model,
      engineDisplacement,
      power,
      torque,
      fuelTank,
      fuelConsumption,
    } = formData;

    if (!model || !fuelConsumption || parseFloat(fuelConsumption) <= 0) {
      setMessage("❌ Model and a valid positive Fuel Consumption are required.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const method = editingId ? "PUT" : "POST";
      const endpoint = editingId ? `${API_URL}/${editingId}` : API_URL;

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          engineDisplacement: engineDisplacement ? parseFloat(engineDisplacement) : undefined,
          power,
          torque,
          fuelTank: fuelTank ? parseFloat(fuelTank) : undefined,
          fuelConsumption: parseFloat(fuelConsumption),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(editingId ? "✅ Motorcycle updated!" : "✅ Motorcycle added!");
        setFormData({
          model: "",
          engineDisplacement: "",
          power: "",
          torque: "",
          fuelTank: "",
          fuelConsumption: "",
        });
        setEditingId(null);
        fetchMotors();
      } else {
        setMessage(data?.msg || "❌ Failed to save motorcycle.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setMessage("❌ Server error.");
    }

    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this motor?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage("✅ Motorcycle deleted.");
        fetchMotors();
      }
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("❌ Failed to delete.");
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await fetch(`${API_URL}/restore/${id}`, { method: "PUT" });
      if (res.ok) {
        setMessage("✅ Motorcycle restored.");
        fetchMotors();
      }
    } catch (err) {
      console.error("Restore error:", err);
      setMessage("❌ Failed to restore.");
    }
  };

  const handleEdit = (motor) => {
    setFormData({ ...motor });
    setEditingId(motor._id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      model: "",
      engineDisplacement: "",
      power: "",
      torque: "",
      fuelTank: "",
      fuelConsumption: "",
    });
  };

  const activeMotors = motors.filter(
    (m) => !m.isDeleted && m.model.toLowerCase().includes(search.toLowerCase())
  );
  const deletedMotors = motors.filter(
    (m) => m.isDeleted && m.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p="1.5rem 2.5rem" sx={{ backgroundColor: theme.palette.background.default }}>
      {/* Header Section */}
      <Box mb={4}>
        <FlexBetween>
          <Box>
            <Header title="Motorcycle Manager" />
            <Typography variant="subtitle1" color="text.secondary" mt={1}>
              Manage and track motorcycle specifications
            </Typography>
          </Box>
        </FlexBetween>
      </Box>

      {/* Dashboard Summary */}
      <Box mb={4}>
        <Box mb={2}>
          <Typography variant="h5" color="text.primary" fontWeight="bold" mb={1}>
            Dashboard Overview
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={showDashboard ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setShowDashboard(!showDashboard)}
            sx={{
              borderColor: alpha(theme.palette.secondary.main, 0.3),
              color: theme.palette.secondary.main,
              px: 2,
              '&:hover': {
                borderColor: theme.palette.secondary.main,
                backgroundColor: alpha(theme.palette.secondary.main, 0.1),
              }
            }}
          >
            {showDashboard ? "Hide Dashboard" : "Show Dashboard"}
          </Button>
        </Box>
        <Collapse in={showDashboard}>
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  height: '100%',
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
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6" color="text.primary" gutterBottom sx={{ opacity: 0.9 }}>
                      Total Motorcycles
                    </Typography>
                    <Typography variant="h3" color="secondary.main" fontWeight="bold">
                      {motors.length}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: '50%', 
                      backgroundColor: alpha(theme.palette.secondary.main, 0.2)
                    }}
                  >
                    <TwoWheeler sx={{ fontSize: 30, color: theme.palette.secondary.main }} />
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
                      Active Motors
                    </Typography>
                    <Typography variant="h3" color="success.main" fontWeight="bold">
                      {activeMotors.length}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: '50%', 
                      backgroundColor: alpha(theme.palette.success.main, 0.2)
                    }}
                  >
                    <Speed sx={{ fontSize: 30, color: theme.palette.success.main }} />
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
                      Deleted Motors
                    </Typography>
                    <Typography variant="h3" color="error.main" fontWeight="bold">
                      {deletedMotors.length}
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: '50%', 
                      backgroundColor: alpha(theme.palette.error.main, 0.2)
                    }}
                  >
                    <Delete sx={{ fontSize: 30, color: theme.palette.error.main }} />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Collapse>
      </Box>

      {/* Form */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          mb: 4,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Typography variant="h5" color="text.primary" fontWeight="bold" mb={3}>
          {editingId ? "Update Motorcycle" : "Add New Motorcycle"}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box maxWidth={800} mx="auto">
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField 
                  required 
                  fullWidth 
                  label="Model" 
                  name="model" 
                  value={formData.model} 
                  onChange={handleChange} 
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
                  fullWidth 
                  label="Engine Displacement (cc)" 
                  name="engineDisplacement" 
                  value={formData.engineDisplacement} 
                  onChange={handleChange} 
                  type="number"
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
                  fullWidth 
                  label="Power" 
                  name="power" 
                  value={formData.power} 
                  onChange={handleChange}
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
                  fullWidth 
                  label="Torque" 
                  name="torque" 
                  value={formData.torque} 
                  onChange={handleChange}
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
                  fullWidth 
                  label="Fuel Tank (L)" 
                  name="fuelTank" 
                  value={formData.fuelTank} 
                  onChange={handleChange} 
                  type="number"
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
                  required 
                  fullWidth 
                  label="Fuel Consumption (km/L)" 
                  name="fuelConsumption" 
                  value={formData.fuelConsumption} 
                  onChange={handleChange} 
                  type="number"
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
            <Box mt={2} display="flex" gap={2}>
              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                disabled={loading}
                sx={{
                  py: 1.5,
                  backgroundColor: theme.palette.secondary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.secondary.dark,
                  },
                  '&:disabled': {
                    backgroundColor: alpha(theme.palette.secondary.main, 0.5),
                  }
                }}
              >
                {loading ? "Saving..." : editingId ? "Update Motorcycle" : "Add Motorcycle"}
              </Button>
              {editingId && (
                <Button 
                  fullWidth 
                  variant="outlined" 
                  onClick={handleCancelEdit}
                  sx={{
                    py: 1.5,
                    borderColor: alpha(theme.palette.secondary.main, 0.5),
                    color: theme.palette.secondary.main,
                    '&:hover': {
                      borderColor: theme.palette.secondary.main,
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                    }
                  }}
                >
                  Cancel
                </Button>
              )}
            </Box>
            {message && (
              <Typography mt={2} textAlign="center" color={message.includes("✅") ? "success.main" : "error.main"}>
                {message}
              </Typography>
            )}
          </form>
        </Box>
      </Paper>

      {/* Search */}
      <Paper 
        elevation={2}
        sx={{ 
          p: 2, 
          mb: 4,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            fullWidth
            placeholder="Search motorcycles by model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
        </Box>
      </Paper>

      {/* Active List */}
      <Paper 
        elevation={3} 
        sx={{ 
          mb: 4,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden',
        }}
      >
        <Box p={3}>
          <Typography variant="h5" color="text.primary" fontWeight="bold" mb={3}>
            Active Motorcycles
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Model</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Displacement</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Power</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Torque</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fuel Tank</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Consumption</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeMotors
              .slice(pageActive * rowsPerPageActive, pageActive * rowsPerPageActive + rowsPerPageActive)
              .map((motor) => (
                <TableRow 
                  key={motor._id}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? alpha(theme.palette.secondary.main, 0.1)
                        : alpha(theme.palette.secondary.main, 0.05),
                    },
                  }}
                >
                  <TableCell>{motor.model}</TableCell>
                  <TableCell>{motor.engineDisplacement} cc</TableCell>
                  <TableCell>{motor.power}</TableCell>
                  <TableCell>{motor.torque}</TableCell>
                  <TableCell>{motor.fuelTank} L</TableCell>
                  <TableCell>{motor.fuelConsumption} km/L</TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleEdit(motor)}
                      sx={{ 
                        color: theme.palette.secondary.main,
                        '&:hover': { backgroundColor: alpha(theme.palette.secondary.main, 0.1) }
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDelete(motor._id)}
                      sx={{ 
                        color: theme.palette.error.main,
                        '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.1) }
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={activeMotors.length}
          page={pageActive}
          onPageChange={(e, newPage) => setPageActive(newPage)}
          rowsPerPage={rowsPerPageActive}
          onRowsPerPageChange={(e) => {
            setRowsPerPageActive(parseInt(e.target.value, 10));
            setPageActive(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Deleted List */}
      <Paper 
        elevation={3} 
        sx={{ 
          mb: 4,
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: 'hidden',
        }}
      >
        <Box p={3}>
          <Typography variant="h5" color="text.primary" fontWeight="bold" mb={3}>
            Recently Deleted
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Model</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Displacement</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Power</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Torque</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Fuel Tank</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Consumption</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deletedMotors
              .slice(pageDeleted * rowsPerPageDeleted, pageDeleted * rowsPerPageDeleted + rowsPerPageDeleted)
              .map((motor) => (
                <TableRow 
                  key={motor._id}
                  sx={{
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? alpha(theme.palette.secondary.main, 0.1)
                        : alpha(theme.palette.secondary.main, 0.05),
                    },
                  }}
                >
                  <TableCell>{motor.model}</TableCell>
                  <TableCell>{motor.engineDisplacement} cc</TableCell>
                  <TableCell>{motor.power}</TableCell>
                  <TableCell>{motor.torque}</TableCell>
                  <TableCell>{motor.fuelTank} L</TableCell>
                  <TableCell>{motor.fuelConsumption} km/L</TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleRestore(motor._id)}
                      sx={{ 
                        color: theme.palette.success.main,
                        '&:hover': { backgroundColor: alpha(theme.palette.success.main, 0.1) }
                      }}
                    >
                      <Restore />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={deletedMotors.length}
          page={pageDeleted}
          onPageChange={(e, newPage) => setPageDeleted(newPage)}
          rowsPerPage={rowsPerPageDeleted}
          onRowsPerPageChange={(e) => {
            setRowsPerPageDeleted(parseInt(e.target.value, 10));
            setPageDeleted(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>
    </Box>
  );
};

export default AddMotor;
