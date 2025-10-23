// Reusable loading spinner component
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 40, 
  fullScreen = false,
  color = 'primary'
}) => {
  const content = (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
      <CircularProgress size={size} color={color} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        width="100%"
      >
        {content}
      </Box>
    );
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" p={3}>
      {content}
    </Box>
  );
};

export default LoadingSpinner;
