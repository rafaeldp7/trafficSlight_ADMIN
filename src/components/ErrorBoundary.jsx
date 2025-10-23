// Error boundary component for catching and handling errors
import React from 'react';
import { Box, Typography, Button, Alert, Card, CardContent } from '@mui/material';
import { Error, Refresh } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
          p={3}
        >
          <Card sx={{ maxWidth: 500, width: '100%' }}>
            <CardContent>
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Error color="error" sx={{ fontSize: 48 }} />
                <Typography variant="h5" color="error" textAlign="center">
                  Something went wrong
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  An unexpected error occurred. Please try refreshing the page.
                </Typography>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                    <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                      {this.state.error.toString()}
                    </Typography>
                  </Alert>
                )}
                
                <Box display="flex" gap={2} mt={2}>
                  <Button
                    variant="contained"
                    startIcon={<Refresh />}
                    onClick={this.handleRetry}
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
