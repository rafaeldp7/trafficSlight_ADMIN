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
} from "@mui/material";
import { Delete, Edit, Search, Restore, ExpandLess, ExpandMore } from "@mui/icons-material";
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
    <Box p="1.5rem 2.5rem" backgroundColor={theme.palette.primary[400]}>
      <FlexBetween>
        <Header title="Motorcycle Manager" />
        <Button
          variant="outlined"
          startIcon={showDashboard ? <ExpandLess /> : <ExpandMore />}
          onClick={() => setShowDashboard(!showDashboard)}
        >
          {showDashboard ? "Hide Dashboard" : "Show Dashboard"}
        </Button>
      </FlexBetween>

      {/* Dashboard Summary */}
      <Collapse in={showDashboard}>
        <Box mt="1.5rem" display="flex" gap="1.5rem" flexWrap="wrap">
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6">Total Motorcycles</Typography>
            <Typography variant="h4">{motors.length}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6">Active</Typography>
            <Typography variant="h4">{activeMotors.length}</Typography>
          </Paper>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6">Deleted</Typography>
            <Typography variant="h4">{deletedMotors.length}</Typography>
          </Paper>
        </Box>
      </Collapse>

      {/* Form */}
      <Box mt="2rem" backgroundColor={theme.palette.background.alt} borderRadius="0.55rem" p="1.25rem 1rem">
        <Typography variant="h6" mb={1}>
          {editingId ? "Update Motorcycle" : "Add Motorcycle"}
        </Typography>
        <Paper elevation={3} sx={{ p: 3, borderRadius: "0.55rem", maxWidth: 600, mx: "auto" }}>
          <form onSubmit={handleSubmit}>
            <TextField required fullWidth label="Model" name="model" value={formData.model} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Engine Displacement" name="engineDisplacement" value={formData.engineDisplacement} onChange={handleChange} margin="normal" type="number" />
            <TextField fullWidth label="Power" name="power" value={formData.power} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Torque" name="torque" value={formData.torque} onChange={handleChange} margin="normal" />
            <TextField fullWidth label="Fuel Tank" name="fuelTank" value={formData.fuelTank} onChange={handleChange} margin="normal" type="number" />
            <TextField required fullWidth label="Fuel Consumption" name="fuelConsumption" value={formData.fuelConsumption} onChange={handleChange} margin="normal" type="number" />
            <Box mt={2} display="flex" gap={2}>
              <Button type="submit" fullWidth variant="contained" color="primary" disabled={loading}>
                {loading ? "Saving..." : editingId ? "Update Motorcycle" : "Add Motorcycle"}
              </Button>
              {editingId && (
                <Button fullWidth variant="outlined" color="secondary" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              )}
            </Box>
            {message && (
              <Typography mt={2} textAlign="center" color={message.includes("✅") ? "green" : "red"}>
                {message}
              </Typography>
            )}
          </form>
        </Paper>
      </Box>

      {/* Search */}
      <Box mt="3rem">
        <Typography variant="h6" mb={1}>Search Motorcycles</Typography>
        <TextField
          fullWidth
          placeholder="Search by model..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      </Box>

      {/* Active List */}
      <Typography variant="h6" mt={4} mb={1}>Active Motorcycles</Typography>
      <Paper sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Model</TableCell>
              <TableCell>Displacement</TableCell>
              <TableCell>Power</TableCell>
              <TableCell>Torque</TableCell>
              <TableCell>Fuel Tank</TableCell>
              <TableCell>Consumption</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeMotors
              .slice(pageActive * rowsPerPageActive, pageActive * rowsPerPageActive + rowsPerPageActive)
              .map((motor) => (
                <TableRow key={motor._id}>
                  <TableCell>{motor.model}</TableCell>
                  <TableCell>{motor.engineDisplacement} cc</TableCell>
                  <TableCell>{motor.power}</TableCell>
                  <TableCell>{motor.torque}</TableCell>
                  <TableCell>{motor.fuelTank} L</TableCell>
                  <TableCell>{motor.fuelConsumption} km/L</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(motor)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(motor._id)}><Delete /></IconButton>
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
      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" mb={1}>Recently Deleted</Typography>
      <Paper sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Model</TableCell>
              <TableCell>Displacement</TableCell>
              <TableCell>Power</TableCell>
              <TableCell>Torque</TableCell>
              <TableCell>Fuel Tank</TableCell>
              <TableCell>Consumption</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deletedMotors
              .slice(pageDeleted * rowsPerPageDeleted, pageDeleted * rowsPerPageDeleted + rowsPerPageDeleted)
              .map((motor) => (
                <TableRow key={motor._id}>
                  <TableCell>{motor.model}</TableCell>
                  <TableCell>{motor.engineDisplacement} cc</TableCell>
                  <TableCell>{motor.power}</TableCell>
                  <TableCell>{motor.torque}</TableCell>
                  <TableCell>{motor.fuelTank} L</TableCell>
                  <TableCell>{motor.fuelConsumption} km/L</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleRestore(motor._id)}><Restore /></IconButton>
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
