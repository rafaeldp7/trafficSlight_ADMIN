import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, CircularProgress, Typography } from "@mui/material";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = useSelector((state) => state.global.isLoggedIn);
  const user = useSelector((state) => state.global.user);

  // Show loading while checking authentication
  if (isLoggedIn === null) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn || !user) {
    return <Navigate to="../login" replace />;
  }

  // Render protected content
  return children;
};

export default ProtectedRoute;
