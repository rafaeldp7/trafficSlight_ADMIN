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
  Grid,
  alpha,
} from "@mui/material";
import { Delete, Edit, Search, TwoWheeler, Person, DriveEta } from "@mui/icons-material";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";

const UserMotor = () => {
  const theme = useTheme();
  const API_URL = "https://ts-backend-1-jyit.onrender.com/api/admin-motors";

  const [userMotors, setUserMotors] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    userId: "",
    motorcycleId: "",
    nickname: "",
  });
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch data when component mounts
  useEffect(() => {
    fetchMotors();
  }, []); // Empty dependency array - only runs once

  const fetchMotors = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(API_URL, { headers });
      const data = await res.json();
      
      // Handle structured response from backend
      if (data.success && data.data && data.data.motors) {
        setUserMotors(data.data.motors);
      } else if (data.success && data.data && Array.isArray(data.data)) {
        setUserMotors(data.data);
      } else if (Array.isArray(data)) {
        setUserMotors(data);
      } else {
        console.error('Unexpected response format:', data);
        setUserMotors([]);
      }
    } catch (err) {
      console.error("Failed to fetch user motors:", err);
      setUserMotors([]);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId || !formData.motorcycleId) {
      setMessage("❌ User ID and Motorcycle ID are required.");
      return;
    }
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (res.ok) {
        setMessage(editingId ? "✅ Updated successfully." : "✅ Created successfully.");
        setFormData({ userId: "", motorcycleId: "", nickname: "" });
        setEditingId(null);
        fetchMotors();
      } else {
        setMessage(result?.msg || "❌ Failed to save entry.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setMessage("❌ Server error.");
    }
  };

  const handleEdit = (item) => {
    setFormData({
      userId: item.userId?._id || item.userId,
      motorcycleId: item.motorcycleId?._id || item.motorcycleId,
      nickname: item.nickname || "",
    });
    setEditingId(item._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user motor?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchMotors();
      setMessage("✅ Deleted successfully.");
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredMotors = (userMotors || []).filter((m) =>
    m.nickname?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p="1.5rem 2.5rem" sx={{ backgroundColor: theme.palette.background.default }}>
      {/* Header Section */}
      <Box mb={4}>
        <FlexBetween>
          <Box>
            <Header title="User Motors Manager" />
            <Typography variant="subtitle1" color="text.secondary" mt={1}>
              Manage user motorcycle assignments and preferences
            </Typography>
          </Box>
        </FlexBetween>
      </Box>

      {/* Dashboard Summary */}
      <Box mb={4}>
        <Typography variant="h5" color="text.primary" fontWeight="bold" mb={3}>
          Overview
        </Typography>
        <Grid container spacing={3}>
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
                    Total Assignments
                  </Typography>
                  <Typography variant="h3" color="secondary.main" fontWeight="bold">
                    {(userMotors || []).length}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    backgroundColor: alpha(theme.palette.secondary.main, 0.2)
                  }}
                >
                  <DriveEta sx={{ fontSize: 30, color: theme.palette.secondary.main }} />
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
                    Users with Motors
                  </Typography>
                  <Typography variant="h3" color="info.main" fontWeight="bold">
                    {new Set((userMotors || []).map(m => m.userId)).size}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    backgroundColor: alpha(theme.palette.info.main, 0.2)
                  }}
                >
                  <Person sx={{ fontSize: 30, color: theme.palette.info.main }} />
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
                    Nicknamed Motors
                  </Typography>
                  <Typography variant="h3" color="success.main" fontWeight="bold">
                    {(userMotors || []).filter(m => m.nickname).length}
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    p: 2, 
                    borderRadius: '50%', 
                    backgroundColor: alpha(theme.palette.success.main, 0.2)
                  }}
                >
                  <TwoWheeler sx={{ fontSize: 30, color: theme.palette.success.main }} />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
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
          {editingId ? "Edit Assignment" : "New Assignment"}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box maxWidth={800} mx="auto">
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField 
                  required 
                  fullWidth 
                  label="User ID" 
                  name="userId" 
                  value={formData.userId} 
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
                  required 
                  fullWidth 
                  label="Motorcycle ID" 
                  name="motorcycleId" 
                  value={formData.motorcycleId} 
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
              <Grid item xs={12}>
                <TextField 
                  fullWidth 
                  label="Nickname" 
                  name="nickname" 
                  value={formData.nickname} 
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
            </Grid>
            <Box mt={2} display="flex" gap={2}>
              <Button 
                type="submit" 
                fullWidth 
                variant="contained"
                sx={{
                  py: 1.5,
                  backgroundColor: theme.palette.secondary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.secondary.dark,
                  }
                }}
              >
                {editingId ? "Update Assignment" : "Create Assignment"}
              </Button>
              {editingId && (
                <Button 
                  fullWidth 
                  variant="outlined" 
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ userId: "", motorcycleId: "", nickname: "" });
                  }}
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
            placeholder="Search by nickname..."
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

      {/* Table */}
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
            User Motor Assignments
          </Typography>
          <Divider sx={{ mb: 3 }} />
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Motorcycle</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nickname</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(filteredMotors || [])
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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
                  <TableCell>{motor.userId?.name || motor.userId}</TableCell>
                  <TableCell>{motor.motorcycleId?.model || motor.motorcycleId}</TableCell>
                  <TableCell>{motor.nickname}</TableCell>
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
          count={(filteredMotors || []).length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>
    </Box>
  );
};

export default UserMotor;
