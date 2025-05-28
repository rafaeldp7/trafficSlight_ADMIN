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
} from "@mui/material";
import { Delete, Edit, Search } from "@mui/icons-material";
import Header from "components/Header";
import FlexBetween from "components/FlexBetween";

const UserMotor = () => {
  const theme = useTheme();
  const API_URL = "https://ts-backend-1-jyit.onrender.com/api/user-motors";

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

  useEffect(() => {
    fetchMotors();
  }, []);

  const fetchMotors = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setUserMotors(data);
    } catch (err) {
      console.error("Failed to fetch user motors:", err);
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

  const filteredMotors = userMotors.filter((m) =>
    m.nickname?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p="1.5rem 2.5rem" backgroundColor={theme.palette.background.default}>
      <FlexBetween>
        <Header title="User Motors Manager" />
      </FlexBetween>

      {/* Form */}
      <Paper elevation={3} sx={{ p: 3, my: 3, maxWidth: 600 }}>
        <Typography variant="h6">{editingId ? "Edit" : "Add"} User Motor</Typography>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="User ID" name="userId" value={formData.userId} onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Motorcycle ID" name="motorcycleId" value={formData.motorcycleId} onChange={handleChange} margin="normal" />
          <TextField fullWidth label="Nickname" name="nickname" value={formData.nickname} onChange={handleChange} margin="normal" />
          <Box mt={2} display="flex" gap={2}>
            <Button type="submit" variant="contained">{editingId ? "Update" : "Save"}</Button>
            {editingId && (
              <Button variant="outlined" color="secondary" onClick={() => {
                setEditingId(null);
                setFormData({ userId: "", motorcycleId: "", nickname: "" });
              }}>Cancel</Button>
            )}
          </Box>
          {message && <Typography mt={2} color={message.includes("✅") ? "green" : "red"}>{message}</Typography>}
        </form>
      </Paper>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search by nickname..."
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

      {/* Table */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Motorcycle</TableCell>
              <TableCell>Nickname</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMotors.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((motor) => (
              <TableRow key={motor._id}>
                <TableCell>{motor.userId?.name || motor.userId}</TableCell>
                <TableCell>{motor.motorcycleId?.model || motor.motorcycleId}</TableCell>
                <TableCell>{motor.nickname}</TableCell>
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
          count={filteredMotors.length}
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
